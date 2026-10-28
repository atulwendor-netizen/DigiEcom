import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'http';
import { handleProductsApi } from '../server/productsApi';
import {
  LocalFileDatabaseProvider,
  setProductDatabase,
} from '../server/products/productDb';
import { setStorageProvider } from '../server/storage/storageManager';
import { LocalStorageProvider } from '../server/storage/localStorageProvider';
import fs from 'fs';
import path from 'path';

const TEST_ADMIN_KEY = 'test_admin_key_prod_sec_999';
const TEST_VAULT = path.resolve(process.cwd(), '.test_prod_vault');
const TEST_DB_PATH = path.join(TEST_VAULT, 'db', 'products.json');

function makeRequest(
  options: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string; json: any }> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      handleProductsApi(req, res);
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as any;
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: address.port,
          path: options.url,
          method: options.method,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            server.close();
            let parsed = null;
            try {
              parsed = JSON.parse(data);
            } catch {
              parsed = null;
            }
            resolve({
              status: res.statusCode || 500,
              headers: res.headers,
              body: data,
              json: parsed,
            });
          });
        }
      );

      if (options.body) {
        req.write(options.body);
      }
      req.end();
    });
  });
}

describe('Product Management Backend API (Phase 1)', () => {
  let originalEnvKey: string | undefined;

  beforeEach(() => {
    originalEnvKey = process.env.ADMIN_STORAGE_API_KEY;
    process.env.ADMIN_STORAGE_API_KEY = TEST_ADMIN_KEY;

    if (fs.existsSync(TEST_VAULT)) {
      fs.rmSync(TEST_VAULT, { recursive: true, force: true });
    }

    setProductDatabase(new LocalFileDatabaseProvider(TEST_DB_PATH));
    setStorageProvider(new LocalStorageProvider(path.join(TEST_VAULT, 'blobs')));
  });

  afterEach(() => {
    process.env.ADMIN_STORAGE_API_KEY = originalEnvKey;
    if (fs.existsSync(TEST_VAULT)) {
      fs.rmSync(TEST_VAULT, { recursive: true, force: true });
    }
    setProductDatabase(null);
    setStorageProvider(null);
  });

  it('GET /api/products returns seeded published catalogue', async () => {
    const res = await makeRequest({
      method: 'GET',
      url: '/api/products',
    });

    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
    expect(res.json.products.length).toBeGreaterThanOrEqual(10);
    expect(res.json.products[0]).toHaveProperty('id');
    expect(res.json.products[0]).toHaveProperty('slug');
    expect(res.json.products[0]).toHaveProperty('pricePaise');
    expect(res.json.products[0].status).toBe('published');
  });

  it('GET /api/products supports category filtering and search', async () => {
    const res = await makeRequest({
      method: 'GET',
      url: '/api/products?category=ebooks-guides&search=System',
    });

    expect(res.status).toBe(200);
    expect(res.json.success).toBe(true);
    expect(res.json.products.length).toBeGreaterThanOrEqual(1);
    expect(res.json.products[0].category).toBe('ebooks-guides');
    expect(res.json.products[0].name).toContain('System');
  });

  it('GET /api/products/:idOrSlug resolves by slug and id', async () => {
    const bySlug = await makeRequest({
      method: 'GET',
      url: '/api/products/system-design-handbook-cloud-scale',
    });

    expect(bySlug.status).toBe(200);
    expect(bySlug.json.product.id).toBe('de-prod-001');

    const byId = await makeRequest({
      method: 'GET',
      url: '/api/products/de-prod-001',
    });

    expect(byId.status).toBe(200);
    expect(byId.json.product.slug).toBe('system-design-handbook-cloud-scale');
  });

  it('POST /api/products rejects unauthenticated requests with 401', async () => {
    const res = await makeRequest({
      method: 'POST',
      url: '/api/products',
      body: JSON.stringify({
        name: 'Hacker Product',
        pricePaise: 9900,
        category: 'templates',
        shortDescription: 'Unsafe submission',
      }),
    });

    expect(res.status).toBe(401);
    expect(res.json.error).toContain('Unauthorized');
  });

  it('POST /api/products validates required fields', async () => {
    const res = await makeRequest({
      method: 'POST',
      url: '/api/products',
      headers: { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
      body: JSON.stringify({
        name: '',
        pricePaise: -500,
        category: '',
      }),
    });

    expect(res.status).toBe(400);
    expect(res.json.success).toBe(false);
  });

  it('POST /api/products creates a product with server ID and unique slug', async () => {
    const res = await makeRequest({
      method: 'POST',
      url: '/api/products',
      headers: { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
      body: JSON.stringify({
        name: 'Production Node.js Architecture Blueprint',
        pricePaise: 69900, // ₹699.00
        category: 'code-snippets',
        shortDescription: 'Production microservice patterns in Node.js 22 and TypeScript.',
        fullDescription: 'Comprehensive guide and starter kit for clean scalable Node services.',
        contents: ['Docker Compose production stack', 'Auth middleware examples'],
        fileFormats: ['.zip', '.pdf'],
        status: 'published',
      }),
    });

    expect(res.status).toBe(201);
    expect(res.json.success).toBe(true);
    expect(res.json.product.id).toMatch(/^de-prod-/);
    expect(res.json.product.slug).toBe('production-node-js-architecture-blueprint');
    expect(res.json.product.pricePaise).toBe(69900);
    expect(res.json.product.status).toBe('published');
  });

  it('PUT /api/products/:id updates metadata and preserves ID', async () => {
    // 1. Create product
    const createRes = await makeRequest({
      method: 'POST',
      url: '/api/products',
      headers: { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
      body: JSON.stringify({
        name: 'Initial Name',
        pricePaise: 29900,
        category: 'templates',
        shortDescription: 'Initial Description',
      }),
    });

    const productId = createRes.json.product.id;

    // 2. Update product
    const updateRes = await makeRequest({
      method: 'PUT',
      url: `/api/products/${productId}`,
      headers: { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
      body: JSON.stringify({
        name: 'Updated Name Title',
        pricePaise: 39900,
      }),
    });

    expect(updateRes.status).toBe(200);
    expect(updateRes.json.product.id).toBe(productId);
    expect(updateRes.json.product.name).toBe('Updated Name Title');
    expect(updateRes.json.product.pricePaise).toBe(39900);
  });

  it('PATCH /api/products/:id/status toggles draft/published and protects visibility', async () => {
    // 1. Create published product
    const createRes = await makeRequest({
      method: 'POST',
      url: '/api/products',
      headers: { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
      body: JSON.stringify({
        name: 'Secret Draft Roadmap',
        pricePaise: 19900,
        category: 'ebooks-guides',
        shortDescription: 'Confidential draft guide',
        status: 'draft',
      }),
    });

    const productId = createRes.json.product.id;
    const slug = createRes.json.product.slug;

    // 2. Public cannot view draft
    const publicFetch = await makeRequest({
      method: 'GET',
      url: `/api/products/${slug}`,
    });
    expect(publicFetch.status).toBe(404);

    // 3. Admin can view draft
    const adminFetch = await makeRequest({
      method: 'GET',
      url: `/api/products/${slug}`,
      headers: { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    });
    expect(adminFetch.status).toBe(200);
    expect(adminFetch.json.product.id).toBe(productId);

    // 4. Admin publishes the product
    const patchRes = await makeRequest({
      method: 'PATCH',
      url: `/api/products/${productId}/status`,
      headers: { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
      body: JSON.stringify({ status: 'published' }),
    });
    expect(patchRes.status).toBe(200);
    expect(patchRes.json.status).toBe('published');

    // 5. Public can now view published product
    const publicPublishedFetch = await makeRequest({
      method: 'GET',
      url: `/api/products/${slug}`,
    });
    expect(publicPublishedFetch.status).toBe(200);
  });

  it('DELETE /api/products/:id removes product', async () => {
    const createRes = await makeRequest({
      method: 'POST',
      url: '/api/products',
      headers: { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
      body: JSON.stringify({
        name: 'To Be Deleted',
        pricePaise: 9900,
        category: 'templates',
        shortDescription: 'Disposable',
      }),
    });

    const id = createRes.json.product.id;

    const deleteRes = await makeRequest({
      method: 'DELETE',
      url: `/api/products/${id}`,
      headers: { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    });

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.json.deleted).toBe(true);

    const getRes = await makeRequest({
      method: 'GET',
      url: `/api/products/${id}`,
      headers: { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
    });
    expect(getRes.status).toBe(404);
  });

  it('POST /api/products/upload-attachment validates and binds private deliverable', async () => {
    const dummyPdfContent = Buffer.from('%PDF-1.4\n%Fake binary content for test\n%%EOF');
    const base64 = dummyPdfContent.toString('base64');

    const res = await makeRequest({
      method: 'POST',
      url: '/api/products/upload-attachment',
      headers: { Authorization: `Bearer ${TEST_ADMIN_KEY}` },
      body: JSON.stringify({
        filename: 'My-Deliverable-Guide.pdf',
        fileBase64: base64,
        mimeType: 'application/pdf',
      }),
    });

    expect(res.status).toBe(201);
    expect(res.json.success).toBe(true);
    expect(res.json).toHaveProperty('fileId');
    expect(res.json.originalName).toBe('My-Deliverable-Guide.pdf');
    expect(res.json).toHaveProperty('sha256Hash');
  });
});
