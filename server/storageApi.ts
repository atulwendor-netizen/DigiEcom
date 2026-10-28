import crypto from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';
import { getStorageProvider } from './storage/storageManager';
import { isValidFileId, validateUploadFile, DEFAULT_MAX_FILE_SIZE_BYTES } from './storage/storageValidator';
import { generateStorageDownloadToken, verifyStorageDownloadToken } from './storage/storageToken';
import { isStorageConfigured } from './signedUrlStorage';

export interface StorageActivityLog {
  id: string;
  timestamp: string;
  action:
    | 'VERIFY_ADMIN'
    | 'UPLOAD'
    | 'DELETE'
    | 'REPLACE'
    | 'TOKEN_ISSUED'
    | 'DOWNLOAD_ATTEMPT'
    | 'METADATA_READ';
  fileId?: string;
  filename?: string;
  details: string;
  status: 'success' | 'failed';
  ip?: string;
}

const MAX_AUDIT_LOGS = 100;
export const storageActivityLogs: StorageActivityLog[] = [];

/**
 * Appends an event to the in-memory audit log.
 */
export function logStorageActivity(entry: Omit<StorageActivityLog, 'id' | 'timestamp'>): void {
  const log: StorageActivityLog = {
    id: `log_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  storageActivityLogs.unshift(log);
  if (storageActivityLogs.length > MAX_AUDIT_LOGS) {
    storageActivityLogs.pop();
  }
}

/**
 * Timing-safe admin API key verification.
 */
export function verifyAdminApiKey(providedKey: string | undefined): boolean {
  const expectedKey = process.env.ADMIN_STORAGE_API_KEY || 'digiecom_admin_secret_dev_key';
  if (!providedKey || typeof providedKey !== 'string') return false;

  // Use SHA-256 hashes to ensure constant length for timingSafeEqual
  const hashProvided = crypto.createHash('sha256').update(providedKey.trim()).digest();
  const hashExpected = crypto.createHash('sha256').update(expectedKey.trim()).digest();

  return crypto.timingSafeEqual(hashProvided, hashExpected);
}

/**
 * Extracts admin API key from headers (Authorization: Bearer <key> or x-admin-key: <key>).
 */
export function extractAdminKey(req: IncomingMessage): string | undefined {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const xAdminKey = req.headers['x-admin-key'];
  if (typeof xAdminKey === 'string') {
    return xAdminKey.trim();
  }
  return undefined;
}

/**
 * Helper to write JSON HTTP response.
 */
function sendJson(res: ServerResponse, statusCode: number, data: any): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

/**
 * Node HTTP / Vite Connect Middleware Handler for /api/storage/*
 */
export function handleStorageApi(req: IncomingMessage, res: ServerResponse): void {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-key, x-filename');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const rawUrl = req.url || '/';
  const urlObj = new URL(rawUrl, 'http://localhost');
  const pathname = urlObj.pathname.replace(/\/+$/, '') || '/';

  // 1. GET /api/storage/health
  if (req.method === 'GET' && (pathname === '/health' || pathname.endsWith('/health'))) {
    const provider = getStorageProvider();
    provider
      .healthCheck()
      .then((health) => {
        sendJson(res, health.ok ? 200 : 503, {
          service: 'DigiEcom Storage Backend',
          status: health.ok ? 'operational' : 'degraded',
          provider: health.provider,
          details: health.details,
          maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE_BYTES,
        });
      })
      .catch((err) => {
        sendJson(res, 500, { error: err.message });
      });
    return;
  }

  // 2. GET /api/storage/download (Authorization-protected download endpoint)
  if (req.method === 'GET' && (pathname.startsWith('/download') || pathname.includes('/download'))) {
    const fileId = urlObj.searchParams.get('fileId') || '';
    const token = urlObj.searchParams.get('token') || '';
    const rawFormat = urlObj.searchParams.get('raw') === 'true';

    if (!fileId) {
      sendJson(res, 400, { success: false, error: 'Missing required "fileId" parameter' });
      return;
    }

    if (!isValidFileId(fileId)) {
      sendJson(res, 400, {
        success: false,
        error: 'Invalid fileId format. Path traversal and malformed identifiers are prohibited.',
      });
      return;
    }

    // Verify cryptographic token
    const orderId = urlObj.searchParams.get('orderId') || 'auth_order';
    const tokenCheck = verifyStorageDownloadToken(fileId, token, orderId);
    if (!tokenCheck.valid) {
      sendJson(res, 403, {
        success: false,
        error: `Download authorization failed: ${tokenCheck.error}`,
      });
      return;
    }

    // Fetch from storage provider
    const provider = getStorageProvider();
    provider
      .getObject(fileId)
      .then(({ buffer, metadata }) => {
        // Enforce demo storefront constraint:
        // Unless explicit raw binary stream is requested for authorized test/admin verification,
        // return an authorized digital deliverable voucher without exposing live files.
        if (rawFormat) {
          res.statusCode = 200;
          res.setHeader('Content-Type', metadata.mimeType);
          res.setHeader('Content-Length', buffer.length);
          res.setHeader('Content-Disposition', `attachment; filename="${metadata.sanitizedName}"`);
          res.end(buffer);
          return;
        }

        // Standard authorized digital deliverable acknowledgment
        logStorageActivity({
          action: 'DOWNLOAD_ATTEMPT',
          fileId: metadata.fileId,
          filename: metadata.originalName,
          details: `Authorized download voucher issued for ${metadata.originalName}`,
          status: 'success',
        });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="digiecom-${metadata.fileId}-authorized.json"`);
        res.end(
          JSON.stringify(
            {
              deliverable: 'DigiEcom Authorized Digital Asset Voucher',
              fileId: metadata.fileId,
              originalName: metadata.originalName,
              mimeType: metadata.mimeType,
              sizeBytes: metadata.sizeBytes,
              sha256Hash: metadata.sha256Hash,
              status: 'Authorized',
              storageProvider: provider.name,
              notice:
                'Storefront is in demonstration mode. Live automated binary streaming is preserved for authorized production release.',
              authorizedAt: new Date().toISOString(),
            },
            null,
            2
          )
        );
      })
      .catch((err) => {
        sendJson(res, 404, { success: false, error: err.message || 'File not found' });
      });
    return;
  }

  // 3. POST /api/storage/verify-admin (Admin Key Verification Endpoint)
  if (req.method === 'POST' && (pathname === '/verify-admin' || pathname.endsWith('/verify-admin'))) {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk;
    });
    req.on('end', () => {
      let keyToTest = extractAdminKey(req);
      if (rawBody) {
        try {
          const parsed = JSON.parse(rawBody);
          if (parsed && typeof parsed.adminKey === 'string') {
            keyToTest = parsed.adminKey;
          }
        } catch {}
      }

      const isValid = verifyAdminApiKey(keyToTest);
      const provider = getStorageProvider();

      if (isValid) {
        logStorageActivity({
          action: 'VERIFY_ADMIN',
          details: 'Admin API key verified successfully',
          status: 'success',
        });
        sendJson(res, 200, {
          success: true,
          valid: true,
          provider: provider.name,
          isDurable: isStorageConfigured(),
          details: 'Admin authentication verified',
        });
      } else {
        logStorageActivity({
          action: 'VERIFY_ADMIN',
          details: 'Admin verification attempt failed (invalid key)',
          status: 'failed',
        });
        sendJson(res, 401, {
          success: false,
          valid: false,
          error: 'Invalid or missing Admin Storage API Key',
        });
      }
    });
    return;
  }

  // -------------------------------------------------------------
  // ADMIN-ONLY OPERATIONS REQUIRE AUTHENTICATION
  // -------------------------------------------------------------
  const adminKey = extractAdminKey(req);
  if (!verifyAdminApiKey(adminKey)) {
    sendJson(res, 401, {
      success: false,
      error: 'Unauthorized: Valid Admin Storage API Key is required.',
    });
    return;
  }

  // 4. GET /api/storage/files (Admin: List all files)
  if (req.method === 'GET' && (pathname === '/files' || pathname.endsWith('/files'))) {
    const provider = getStorageProvider();
    provider
      .listObjects()
      .then((files) => {
        sendJson(res, 200, { success: true, count: files.length, files });
      })
      .catch((err) => {
        sendJson(res, 500, { success: false, error: err.message });
      });
    return;
  }

  // 5. GET /api/storage/stats (Admin: Aggregate Storage Statistics)
  if (req.method === 'GET' && (pathname === '/stats' || pathname.endsWith('/stats'))) {
    const provider = getStorageProvider();
    provider
      .listObjects()
      .then((files) => {
        let totalSizeBytes = 0;
        const byCategory: Record<string, { count: number; bytes: number }> = {};
        const byFormat: Record<string, { count: number; bytes: number }> = {};

        for (const file of files) {
          totalSizeBytes += file.sizeBytes || 0;
          const cat = file.category || 'digital-products';
          if (!byCategory[cat]) byCategory[cat] = { count: 0, bytes: 0 };
          byCategory[cat].count += 1;
          byCategory[cat].bytes += file.sizeBytes || 0;

          const ext = file.extension || 'other';
          if (!byFormat[ext]) byFormat[ext] = { count: 0, bytes: 0 };
          byFormat[ext].count += 1;
          byFormat[ext].bytes += file.sizeBytes || 0;
        }

        sendJson(res, 200, {
          success: true,
          stats: {
            totalFiles: files.length,
            totalSizeBytes,
            totalSizeFormatted: `${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`,
            provider: provider.name,
            isDurable: isStorageConfigured(),
            maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE_BYTES,
            byCategory,
            byFormat,
            updatedAt: new Date().toISOString(),
          },
        });
      })
      .catch((err) => {
        sendJson(res, 500, { success: false, error: err.message });
      });
    return;
  }

  // 6. GET /api/storage/logs (Admin: Activity Audit Logs)
  if (req.method === 'GET' && (pathname === '/logs' || pathname.endsWith('/logs'))) {
    sendJson(res, 200, {
      success: true,
      count: storageActivityLogs.length,
      logs: storageActivityLogs,
    });
    return;
  }

  // 7. GET /api/storage/files/:fileId/metadata (Admin: Get specific metadata)
  const metaMatch = pathname.match(/\/files\/([^/]+)\/metadata$/);
  if (req.method === 'GET' && metaMatch) {
    const fileId = metaMatch[1];
    if (!isValidFileId(fileId)) {
      sendJson(res, 400, { success: false, error: 'Invalid fileId format' });
      return;
    }

    const provider = getStorageProvider();
    provider
      .getMetadata(fileId)
      .then((meta) => {
        if (!meta) {
          sendJson(res, 404, { success: false, error: `File metadata not found for "${fileId}"` });
          return;
        }
        sendJson(res, 200, { success: true, metadata: meta });
      })
      .catch((err) => {
        sendJson(res, 500, { success: false, error: err.message });
      });
    return;
  }

  // 5. DELETE /api/storage/files/:fileId (Admin: Delete file)
  const deleteMatch = pathname.match(/\/files\/([^/]+)$/);
  if (req.method === 'DELETE' && deleteMatch) {
    const fileId = deleteMatch[1];
    if (!isValidFileId(fileId)) {
      sendJson(res, 400, { success: false, error: 'Invalid fileId format' });
      return;
    }

    const provider = getStorageProvider();
    provider
      .deleteObject(fileId)
      .then((deleted) => {
        if (!deleted) {
          sendJson(res, 404, { success: false, error: `File "${fileId}" not found for deletion` });
          return;
        }
        logStorageActivity({
          action: 'DELETE',
          fileId,
          details: `Deleted object ${fileId}`,
          status: 'success',
        });
        sendJson(res, 200, { success: true, deleted: true, fileId });
      })
      .catch((err) => {
        sendJson(res, 500, { success: false, error: err.message });
      });
    return;
  }

  // Read body for POST and PUT requests
  let rawBody = '';
  req.on('data', (chunk) => {
    rawBody += chunk;
  });

  req.on('end', async () => {
    try {
      let parsedBody: any = {};
      if (rawBody) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          sendJson(res, 400, { success: false, error: 'Malformed JSON payload' });
          return;
        }
      }

      // 6. POST /api/storage/upload (Admin: Upload new file)
      if (req.method === 'POST' && (pathname === '/upload' || pathname.endsWith('/upload'))) {
        const { filename, contentBase64, category, associatedProductId, fileId } = parsedBody;

        if (!filename || typeof filename !== 'string') {
          sendJson(res, 400, { success: false, error: 'Missing required "filename" parameter' });
          return;
        }

        if (!contentBase64 || typeof contentBase64 !== 'string') {
          sendJson(res, 400, { success: false, error: 'Missing required "contentBase64" payload' });
          return;
        }

        let buffer: Buffer;
        try {
          buffer = Buffer.from(contentBase64, 'base64');
        } catch {
          sendJson(res, 400, { success: false, error: 'Failed to decode base64 file buffer' });
          return;
        }

        // Validate file size and content
        const validation = validateUploadFile(filename, buffer);
        if (!validation.valid) {
          const isSizeError = validation.error?.includes('exceeds maximum allowed limit');
          sendJson(res, isSizeError ? 413 : 400, { success: false, error: validation.error });
          return;
        }

        const provider = getStorageProvider();
        const metadata = await provider.putObject({
          fileId,
          filename,
          buffer,
          category,
          associatedProductId,
        });

        logStorageActivity({
          action: 'UPLOAD',
          fileId: metadata.fileId,
          filename: metadata.originalName,
          details: `Uploaded ${metadata.originalName} (${(metadata.sizeBytes / 1024).toFixed(1)} KB)`,
          status: 'success',
        });
        sendJson(res, 201, { success: true, metadata });
        return;
      }

      // 7. POST /api/storage/token (Admin: Generate download token)
      if (req.method === 'POST' && (pathname === '/token' || pathname.endsWith('/token'))) {
        const { fileId, ttlSeconds = 900, orderId = 'auth_order' } = parsedBody;

        if (!fileId || !isValidFileId(fileId)) {
          sendJson(res, 400, { success: false, error: 'Valid "fileId" UUID is required to generate a token' });
          return;
        }

        const provider = getStorageProvider();
        const meta = await provider.getMetadata(fileId);
        if (!meta) {
          sendJson(res, 404, { success: false, error: `File not found in storage: "${fileId}"` });
          return;
        }

        const { token, expiresAt } = generateStorageDownloadToken(fileId, Number(ttlSeconds), orderId);
        logStorageActivity({
          action: 'TOKEN_ISSUED',
          fileId,
          filename: meta.originalName,
          details: `Generated short-lived download token for ${meta.originalName}`,
          status: 'success',
        });
        sendJson(res, 200, {
          success: true,
          fileId,
          token,
          expiresAt,
          downloadUrl: `/api/storage/download?fileId=${fileId}&token=${token}`,
        });
        return;
      }

      // 8. PUT /api/storage/files/:fileId (Admin: Replace file)
      const putMatch = pathname.match(/\/files\/([^/]+)$/);
      if (req.method === 'PUT' && putMatch) {
        const targetFileId = putMatch[1];
        if (!isValidFileId(targetFileId)) {
          sendJson(res, 400, { success: false, error: 'Invalid fileId format' });
          return;
        }

        const { filename, contentBase64, category, associatedProductId } = parsedBody;
        if (!filename || !contentBase64) {
          sendJson(res, 400, { success: false, error: 'Both "filename" and "contentBase64" are required for replacement' });
          return;
        }

        const buffer = Buffer.from(contentBase64, 'base64');
        const validation = validateUploadFile(filename, buffer);
        if (!validation.valid) {
          const isSizeError = validation.error?.includes('exceeds maximum allowed limit');
          sendJson(res, isSizeError ? 413 : 400, { success: false, error: validation.error });
          return;
        }

        const provider = getStorageProvider();
        const updatedMeta = await provider.putObject({
          fileId: targetFileId,
          filename,
          buffer,
          category,
          associatedProductId,
        });

        logStorageActivity({
          action: 'REPLACE',
          fileId: targetFileId,
          filename: updatedMeta.originalName,
          details: `Replaced content for ${updatedMeta.originalName}`,
          status: 'success',
        });
        sendJson(res, 200, { success: true, updated: true, metadata: updatedMeta });
        return;
      }

      // 404 Not Found
      sendJson(res, 404, { success: false, error: `Storage API route not found: ${pathname}` });
    } catch (err: any) {
      console.error('Storage API unhandled error:', err);
      sendJson(res, 500, { success: false, error: err.message || 'Internal Server Error' });
    }
  });
}
