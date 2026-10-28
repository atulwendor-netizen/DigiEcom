import type { IncomingMessage, ServerResponse } from 'http';
import { parse as parseUrl } from 'url';
import crypto from 'crypto';
import { getProductDatabase } from './products/productDb';
import type { ManagedProduct, ProductStatus } from './products/product.types';
import { getStorageProvider } from './storage/storageManager';
import { validateUploadFile } from './storage/storageValidator';

function getExpectedAdminKey(): string | null {
  return process.env.ADMIN_STORAGE_API_KEY || null;
}

function verifyAdminApiKey(candidateKey: string | null | undefined): boolean {
  const expectedKey = getExpectedAdminKey();
  if (!expectedKey || !candidateKey) return false;

  const expectedBuffer = Buffer.from(expectedKey, 'utf8');
  const candidateBuffer = Buffer.from(candidateKey, 'utf8');

  if (expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuffer, candidateBuffer);
}

function extractAdminKey(req: IncomingMessage): string | null {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const customHeader = req.headers['x-admin-key'];
  if (typeof customHeader === 'string' && customHeader) {
    return customHeader.trim();
  }
  return null;
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.end(JSON.stringify(data));
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCategoryLabel(category: string): string {
  switch (category.toLowerCase()) {
    case 'ebooks-guides':
      return 'E-books & Guides';
    case 'templates':
      return 'Templates & Kits';
    case 'presets':
      return 'Audio & Presets';
    case 'code-snippets':
      return 'Code & Components';
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
}

export function getDefaultGradient(visualType: string): string {
  switch (visualType) {
    case 'blueprint':
      return 'linear-gradient(135deg, #091e3a 0%, #173b75 100%)';
    case 'audio':
      return 'linear-gradient(135deg, #2b0b3a 0%, #5c187d 100%)';
    case 'component':
      return 'linear-gradient(135deg, #0c2a26 0%, #155c52 100%)';
    case 'playbook':
    default:
      return 'linear-gradient(135deg, #1e1035 0%, #3b1d6e 100%)';
  }
}

export function handleProductsApi(req: IncomingMessage, res: ServerResponse): void {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.end();
    return;
  }

  const parsedUrl = parseUrl(req.url || '', true);
  let pathname = parsedUrl.pathname || '/';

  // Normalize path if prefixed with /api/products
  if (pathname.startsWith('/api/products')) {
    pathname = pathname.substring('/api/products'.length);
  }
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }

  const db = getProductDatabase();
  const candidateAdminKey = extractAdminKey(req);
  const isAdmin = verifyAdminApiKey(candidateAdminKey);

  // -------------------------------------------------------------------------
  // 1. GET /api/products (Catalogue Query)
  // -------------------------------------------------------------------------
  if (req.method === 'GET' && (pathname === '/' || pathname === '')) {
    const category = parsedUrl.query.category as string | undefined;
    const search = parsedUrl.query.search as string | undefined;
    const isFeatured = parsedUrl.query.featured === 'true' ? true : undefined;
    const page = parsedUrl.query.page ? parseInt(parsedUrl.query.page as string, 10) : undefined;
    const limit = parsedUrl.query.limit ? parseInt(parsedUrl.query.limit as string, 10) : undefined;

    // Public users can ONLY ever see 'published' products
    let statusFilter: ProductStatus | 'all' = 'published';
    if (isAdmin && parsedUrl.query.status) {
      statusFilter = parsedUrl.query.status as ProductStatus | 'all';
    }

    db.getAll({
      status: statusFilter,
      category,
      search,
      isFeatured,
      page,
      limit,
    })
      .then(({ products, total }) => {
        sendJson(res, 200, {
          success: true,
          count: products.length,
          total,
          page: page || 1,
          limit: limit || total,
          products,
        });
      })
      .catch((err) => {
        sendJson(res, 500, { success: false, error: err.message });
      });
    return;
  }

  // -------------------------------------------------------------------------
  // 2. POST /api/products/upload-attachment (Admin: Upload deliverable file)
  // -------------------------------------------------------------------------
  if (req.method === 'POST' && pathname === '/upload-attachment') {
    if (!isAdmin) {
      sendJson(res, 401, {
        success: false,
        error: 'Unauthorized: Valid Admin Storage API Key is required.',
      });
      return;
    }

    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
    });

    req.on('end', () => {
      try {
        const body = JSON.parse(rawBody || '{}');
        const { filename, fileBase64, mimeType, productId } = body;

        if (!filename || typeof filename !== 'string') {
          sendJson(res, 400, { success: false, error: 'Missing or invalid "filename" field.' });
          return;
        }

        if (!fileBase64 || typeof fileBase64 !== 'string') {
          sendJson(res, 400, { success: false, error: 'Missing or invalid "fileBase64" field.' });
          return;
        }

        const buffer = Buffer.from(fileBase64, 'base64');
        const validation = validateUploadFile(filename, buffer, mimeType);

        if (!validation.valid) {
          sendJson(res, 400, {
            success: false,
            error: validation.error || 'File validation failed.',
          });
          return;
        }

        const storage = getStorageProvider();
        storage
          .putObject({
            filename: validation.sanitizedName || filename,
            mimeType: validation.detectedMimeType || mimeType || 'application/octet-stream',
            buffer,
            associatedProductId: productId,
          })
          .then(async (metadata) => {
            // If productId provided, optionally update product
            if (productId) {
              await db.update(productId, {
                attachedFileId: metadata.fileId,
                attachedFileName: metadata.originalName,
                attachedFileSize: metadata.sizeBytes,
                attachedFileMime: metadata.mimeType,
              });
            }

            sendJson(res, 201, {
              success: true,
              fileId: metadata.fileId,
              originalName: metadata.originalName,
              sizeBytes: metadata.sizeBytes,
              mimeType: metadata.mimeType,
              sha256Hash: metadata.sha256Hash,
            });
          })
          .catch((err) => {
            sendJson(res, 500, { success: false, error: err.message });
          });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: 'Malformed JSON payload: ' + err.message });
      }
    });
    return;
  }

  // -------------------------------------------------------------------------
  // 3. POST /api/products (Admin: Create Product)
  // -------------------------------------------------------------------------
  if (req.method === 'POST' && (pathname === '/' || pathname === '')) {
    if (!isAdmin) {
      sendJson(res, 401, {
        success: false,
        error: 'Unauthorized: Valid Admin Storage API Key is required.',
      });
      return;
    }

    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
    });

    req.on('end', async () => {
      try {
        const body = JSON.parse(rawBody || '{}');
        const {
          name,
          category,
          pricePaise,
          shortDescription,
          fullDescription,
          coverVisualType,
          fileFormats,
          contents,
          licenseType,
          status,
          isFeatured,
          tags,
          faqs,
          attachedFileId,
          attachedFileName,
          attachedFileSize,
          attachedFileMime,
        } = body;

        // Validation
        if (!name || typeof name !== 'string' || !name.trim()) {
          sendJson(res, 400, { success: false, error: 'Product "name" is required.' });
          return;
        }

        if (pricePaise === undefined || typeof pricePaise !== 'number' || pricePaise < 0) {
          sendJson(res, 400, { success: false, error: 'Valid positive "pricePaise" is required.' });
          return;
        }

        if (!category || typeof category !== 'string') {
          sendJson(res, 400, { success: false, error: 'Product "category" is required.' });
          return;
        }

        if (!shortDescription || typeof shortDescription !== 'string') {
          sendJson(res, 400, { success: false, error: 'Product "shortDescription" is required.' });
          return;
        }

        // Generate ID
        const uniqueSuffix = Math.random().toString(36).substring(2, 6);
        const serverId = `de-prod-${Date.now().toString(36).substring(3)}-${uniqueSuffix}`;

        // Generate Slug
        let finalSlug = body.slug ? sanitizeSlug(body.slug) : sanitizeSlug(name);
        if (!finalSlug) finalSlug = `product-${uniqueSuffix}`;

        // Ensure unique slug
        const existing = await db.getBySlug(finalSlug);
        if (existing) {
          finalSlug = `${finalSlug}-${uniqueSuffix}`;
        }

        const visual = coverVisualType || 'playbook';
        const newProduct: ManagedProduct = {
          id: serverId,
          slug: finalSlug,
          name: name.trim(),
          category: category.trim(),
          categoryLabel: body.categoryLabel || getCategoryLabel(category),
          shortDescription: shortDescription.trim(),
          fullDescription: (fullDescription || shortDescription).trim(),
          pricePaise: Math.round(pricePaise),
          currency: 'INR',
          coverVisualType: visual,
          coverGradient: body.coverGradient || getDefaultGradient(visual),
          gallery: Array.isArray(body.gallery) ? body.gallery : ['Overview', 'Details'],
          fileFormats: Array.isArray(fileFormats) && fileFormats.length > 0 ? fileFormats : ['.pdf'],
          compatibility: body.compatibility || 'Compatible with all modern operating systems.',
          contents: Array.isArray(contents) && contents.length > 0 ? contents : [name.trim()],
          licenseType: licenseType || 'Personal & Commercial Reading License',
          deliveryMethod: 'Instant secure digital download after verification',
          status: status === 'draft' || status === 'unpublished' ? status : 'published',
          isFeatured: Boolean(isFeatured),
          tags: Array.isArray(tags) ? tags : [category],
          faqs: Array.isArray(faqs) ? faqs : [],
          isDemoContent: true,
          demoNotice: 'Demonstration catalogue item — checkout and file delivery are disabled in this storefront preview.',
          attachedFileId,
          attachedFileName,
          attachedFileSize,
          attachedFileMime,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const created = await db.create(newProduct);
        sendJson(res, 201, { success: true, product: created });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: 'Malformed JSON payload: ' + err.message });
      }
    });
    return;
  }

  // -------------------------------------------------------------------------
  // 4. PATCH /api/products/:id/status (Admin: Quick status toggle)
  // -------------------------------------------------------------------------
  const statusMatch = pathname.match(/^\/([^/]+)\/status$/);
  if (req.method === 'PATCH' && statusMatch) {
    if (!isAdmin) {
      sendJson(res, 401, {
        success: false,
        error: 'Unauthorized: Valid Admin Storage API Key is required.',
      });
      return;
    }

    const productId = statusMatch[1];
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
    });

    req.on('end', async () => {
      try {
        const body = JSON.parse(rawBody || '{}');
        const newStatus = body.status as ProductStatus;
        if (!newStatus || !['draft', 'published', 'unpublished'].includes(newStatus)) {
          sendJson(res, 400, {
            success: false,
            error: 'Invalid status. Must be "draft", "published", or "unpublished".',
          });
          return;
        }

        const updated = await db.update(productId, { status: newStatus });
        if (!updated) {
          sendJson(res, 404, { success: false, error: `Product "${productId}" not found.` });
          return;
        }

        sendJson(res, 200, { success: true, id: productId, status: newStatus, product: updated });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: 'Malformed JSON: ' + err.message });
      }
    });
    return;
  }

  // -------------------------------------------------------------------------
  // 5. GET /api/products/:idOrSlug (Single Product Fetch)
  // -------------------------------------------------------------------------
  const singleMatch = pathname.match(/^\/([^/]+)$/);
  if (req.method === 'GET' && singleMatch) {
    const idOrSlug = singleMatch[1];

    const findProduct = async () => {
      let product = await db.getById(idOrSlug);
      if (!product) {
        product = await db.getBySlug(idOrSlug);
      }
      return product;
    };

    findProduct()
      .then((product) => {
        if (!product) {
          sendJson(res, 404, { success: false, error: `Product "${idOrSlug}" not found.` });
          return;
        }

        // Public users can ONLY view published products
        if (!isAdmin && product.status !== 'published') {
          sendJson(res, 404, { success: false, error: `Product "${idOrSlug}" not found.` });
          return;
        }

        sendJson(res, 200, { success: true, product });
      })
      .catch((err) => {
        sendJson(res, 500, { success: false, error: err.message });
      });
    return;
  }

  // -------------------------------------------------------------------------
  // 6. PUT /api/products/:id (Admin: Update Product)
  // -------------------------------------------------------------------------
  if (req.method === 'PUT' && singleMatch) {
    if (!isAdmin) {
      sendJson(res, 401, {
        success: false,
        error: 'Unauthorized: Valid Admin Storage API Key is required.',
      });
      return;
    }

    const productId = singleMatch[1];
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
    });

    req.on('end', async () => {
      try {
        const updates = JSON.parse(rawBody || '{}');
        delete updates.id; // Prevent ID mutation

        if (updates.slug) {
          updates.slug = sanitizeSlug(updates.slug);
        }

        if (updates.category && !updates.categoryLabel) {
          updates.categoryLabel = getCategoryLabel(updates.category);
        }

        const updated = await db.update(productId, updates);
        if (!updated) {
          sendJson(res, 404, { success: false, error: `Product "${productId}" not found.` });
          return;
        }

        sendJson(res, 200, { success: true, product: updated });
      } catch (err: any) {
        sendJson(res, 400, { success: false, error: 'Malformed JSON: ' + err.message });
      }
    });
    return;
  }

  // -------------------------------------------------------------------------
  // 7. DELETE /api/products/:id (Admin: Delete Product)
  // -------------------------------------------------------------------------
  if (req.method === 'DELETE' && singleMatch) {
    if (!isAdmin) {
      sendJson(res, 401, {
        success: false,
        error: 'Unauthorized: Valid Admin Storage API Key is required.',
      });
      return;
    }

    const productId = singleMatch[1];
    db.delete(productId)
      .then((deleted) => {
        if (!deleted) {
          sendJson(res, 404, { success: false, error: `Product "${productId}" not found.` });
          return;
        }
        sendJson(res, 200, { success: true, deleted: true, id: productId });
      })
      .catch((err) => {
        sendJson(res, 500, { success: false, error: err.message });
      });
    return;
  }

  sendJson(res, 404, { success: false, error: 'Endpoint not found' });
}
