import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { LocalStorageProvider } from '../server/storage/localStorageProvider';
import {
  validateUploadFile,
  verifyMagicBytes,
  sanitizeFilename,
  isValidFileId,
  DEFAULT_MAX_FILE_SIZE_BYTES,
} from '../server/storage/storageValidator';
import {
  generateStorageDownloadToken,
  verifyStorageDownloadToken,
} from '../server/storage/storageToken';
import { handleStorageApi, verifyAdminApiKey } from '../server/storageApi';
import { setStorageProvider } from '../server/storage/storageManager';

// Mock request / response helpers
function createMockRequest(options: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  rawBody?: string;
}) {
  const req = new EventEmitter() as any;
  req.method = options.method || 'GET';
  req.url = options.url || '/api/storage/health';
  req.headers = options.headers || {};

  process.nextTick(() => {
    if (options.rawBody !== undefined) {
      req.emit('data', Buffer.from(options.rawBody, 'utf8'));
    }
    req.emit('end');
  });

  return req;
}

function createMockResponse() {
  const res = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: '',
    setHeader(name: string, value: string) {
      res.headers[name.toLowerCase()] = String(value);
    },
    end(data?: any) {
      if (data) {
        if (Buffer.isBuffer(data)) {
          res.body = data.toString('utf8');
        } else {
          res.body = String(data);
        }
      }
    },
  } as any;
  return res;
}

describe('Modular Storage Backend — Local Vault, Security & Tokens', () => {
  const TEST_VAULT_DIR = path.resolve(process.cwd(), '.test_storage_vault');
  const TEST_ADMIN_KEY = 'test_admin_super_secret_key_2026';
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.ADMIN_STORAGE_API_KEY = TEST_ADMIN_KEY;
    process.env.LOCAL_STORAGE_DIR = TEST_VAULT_DIR;
    process.env.STORAGE_DOWNLOAD_SECRET = 'test_token_secret_salt_123';
    setStorageProvider(new LocalStorageProvider(TEST_VAULT_DIR));
  });

  afterEach(() => {
    process.env = originalEnv;
    setStorageProvider(null);
    // Cleanup test vault directory
    if (fs.existsSync(TEST_VAULT_DIR)) {
      fs.rmSync(TEST_VAULT_DIR, { recursive: true, force: true });
    }
  });

  // -------------------------------------------------------------
  // 1. FILE VALIDATION & FILE SIGNATURES (MAGIC BYTES)
  // -------------------------------------------------------------
  describe('File Validation & Magic Bytes', () => {
    it('accepts valid PDF containing %PDF- signature', () => {
      const pdfBuffer = Buffer.from('%PDF-1.7\nSample content');
      const res = validateUploadFile('handbook.pdf', pdfBuffer);
      expect(res.valid).toBe(true);
      expect(res.detectedMimeType).toBe('application/pdf');
      expect(res.extension).toBe('.pdf');
    });

    it('rejects text file masquerading with .pdf extension', () => {
      const fakePdfBuffer = Buffer.from('Just plain text without PDF header');
      const res = validateUploadFile('malicious.pdf', fakePdfBuffer);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Missing %PDF- signature header');
    });

    it('accepts valid ZIP containing PK signature header', () => {
      const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
      const res = validateUploadFile('blueprints.zip', zipBuffer);
      expect(res.valid).toBe(true);
      expect(res.detectedMimeType).toBe('application/zip');
    });

    it('strictly prohibits executable or dangerous script extensions', () => {
      const dummyBuffer = Buffer.from('echo dangerous');
      expect(validateUploadFile('script.sh', dummyBuffer).valid).toBe(false);
      expect(validateUploadFile('virus.exe', dummyBuffer).valid).toBe(false);
      expect(validateUploadFile('hack.php', dummyBuffer).valid).toBe(false);
      expect(validateUploadFile('payload.bat', dummyBuffer).valid).toBe(false);
    });

    it('rejects Markdown containing dangerous script tags', () => {
      const maliciousMd = Buffer.from('# Hello\n<script>alert(1)</script>');
      const res = validateUploadFile('readme.md', maliciousMd);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Embedded <script> tags detected');
    });

    it('rejects empty or oversized files', () => {
      const emptyBuffer = Buffer.from([]);
      expect(validateUploadFile('empty.pdf', emptyBuffer).valid).toBe(false);

      const tinyLimit = 100;
      const oversizedBuffer = Buffer.alloc(200);
      const res = validateUploadFile('big.pdf', oversizedBuffer, tinyLimit);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('exceeds maximum allowed limit');
    });

    it('prevents directory traversal characters in filenames', () => {
      const buf = Buffer.from('%PDF-1.4\nvalid');
      expect(validateUploadFile('../../etc/passwd.pdf', buf).valid).toBe(false);
      expect(validateUploadFile('dir/sub/test.pdf', buf).valid).toBe(false);
    });

    it('sanitizes unsafe filenames and verifies magic bytes helper directly', () => {
      expect(sanitizeFilename('../../../secret/my file (1).pdf')).toBe('my_file__1_.pdf');
      expect(DEFAULT_MAX_FILE_SIZE_BYTES).toBe(50 * 1024 * 1024);

      // Direct verifyMagicBytes
      expect(verifyMagicBytes(Buffer.from('%PDF-1.3'), '.pdf').valid).toBe(true);
      expect(verifyMagicBytes(Buffer.from('notpdf'), '.pdf').valid).toBe(false);
    });

    it('validates admin API key timing-safe comparison helper', () => {
      process.env.ADMIN_STORAGE_API_KEY = TEST_ADMIN_KEY;
      expect(verifyAdminApiKey(TEST_ADMIN_KEY)).toBe(true);
      expect(verifyAdminApiKey('wrong_key')).toBe(false);
      expect(verifyAdminApiKey('')).toBe(false);
      expect(verifyAdminApiKey(undefined)).toBe(false);
    });
  });

  // -------------------------------------------------------------
  // 2. LOCAL STORAGE PROVIDER & SEPARATE METADATA
  // -------------------------------------------------------------
  describe('LocalStorageProvider Operations', () => {
    it('stores file contents and metadata in isolated separate locations', async () => {
      const provider = new LocalStorageProvider(TEST_VAULT_DIR);
      await provider.initialize();

      const pdfBuffer = Buffer.from('%PDF-1.7\nHandbook chapter 1');
      const meta = await provider.putObject({
        filename: 'system-design.pdf',
        buffer: pdfBuffer,
        category: 'ebooks',
        associatedProductId: 'de-prod-001',
      });

      expect(meta.fileId).toBeDefined();
      expect(isValidFileId(meta.fileId)).toBe(true);
      expect(meta.sizeBytes).toBe(pdfBuffer.length);
      expect(meta.originalName).toBe('system-design.pdf');

      // Verify physical disk files
      const blobPath = path.resolve(TEST_VAULT_DIR, 'blobs', `${meta.fileId}.bin`);
      const metaPath = path.resolve(TEST_VAULT_DIR, 'meta', `${meta.fileId}.json`);

      expect(fs.existsSync(blobPath)).toBe(true);
      expect(fs.existsSync(metaPath)).toBe(true);

      // Verify metadata can be read independently without loading blob
      const retrievedMeta = await provider.getMetadata(meta.fileId);
      expect(retrievedMeta).not.toBeNull();
      expect(retrievedMeta?.sha256Hash).toBe(meta.sha256Hash);

      // Verify getObject returns both
      const retrieved = await provider.getObject(meta.fileId);
      expect(retrieved.buffer.equals(pdfBuffer)).toBe(true);
      expect(retrieved.metadata.fileId).toBe(meta.fileId);
    });

    it('deletes both binary blob and metadata file cleanly', async () => {
      const provider = new LocalStorageProvider(TEST_VAULT_DIR);
      const pdfBuffer = Buffer.from('%PDF-1.4\nDelete me');
      const meta = await provider.putObject({ filename: 'temp.pdf', buffer: pdfBuffer });

      const deleted = await provider.deleteObject(meta.fileId);
      expect(deleted).toBe(true);

      expect(await provider.getMetadata(meta.fileId)).toBeNull();
      const blobPath = path.resolve(TEST_VAULT_DIR, 'blobs', `${meta.fileId}.bin`);
      expect(fs.existsSync(blobPath)).toBe(false);
    });

    it('lists all stored object metadata records', async () => {
      const provider = new LocalStorageProvider(TEST_VAULT_DIR);
      await provider.putObject({
        filename: 'file1.pdf',
        buffer: Buffer.from('%PDF-1.0\nfile1'),
      });
      await provider.putObject({
        filename: 'file2.pdf',
        buffer: Buffer.from('%PDF-1.0\nfile2'),
      });

      const list = await provider.listObjects();
      expect(list.length).toBe(2);
      expect(list[0].fileId).not.toBe(list[1].fileId);
    });
  });

  // -------------------------------------------------------------
  // 3. SHORT-LIVED TAMPER-RESISTANT DOWNLOAD TOKENS
  // -------------------------------------------------------------
  describe('Download Token Security', () => {
    it('generates and verifies valid download tokens', () => {
      const fileId = crypto.randomUUID();
      const { token, expiresAt } = generateStorageDownloadToken(fileId, 600);

      expect(token).toBeDefined();
      expect(expiresAt).toBeGreaterThan(Date.now());

      const result = verifyStorageDownloadToken(fileId, token);
      expect(result.valid).toBe(true);
      expect(result.fileId).toBe(fileId);
    });

    it('rejects expired download tokens', () => {
      const fileId = crypto.randomUUID();
      // Generate token that expired 10 seconds ago
      const { token } = generateStorageDownloadToken(fileId, -10);

      const result = verifyStorageDownloadToken(fileId, token);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('expired');
    });

    it('rejects tokens forged or tampered with', () => {
      const fileId = crypto.randomUUID();
      const { token } = generateStorageDownloadToken(fileId, 600);

      // Alter signature
      const parts = token.split('.');
      parts[3] = parts[3].slice(0, -4) + 'ffff';
      const tamperedToken = parts.join('.');

      const result = verifyStorageDownloadToken(fileId, tamperedToken);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('signature mismatch');
    });

    it('enforces binding to specific fileId (token swap attack prevention)', () => {
      const fileIdA = crypto.randomUUID();
      const fileIdB = crypto.randomUUID();

      const { token: tokenA } = generateStorageDownloadToken(fileIdA, 600);

      // Attempting to use tokenA to access fileIdB must fail
      const result = verifyStorageDownloadToken(fileIdB, tokenA);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be used for');
    });
  });

  // -------------------------------------------------------------
  // 4. HTTP API ENDPOINTS: AUTHENTICATION, CRUD & PERMISSIONS
  // -------------------------------------------------------------
  describe('Storage API HTTP Endpoints', () => {
    it('rejects unauthorized admin upload with 401', async () => {
      const req = createMockRequest({
        method: 'POST',
        url: '/api/storage/upload',
        headers: {
          'content-type': 'application/json',
          // No Authorization header
        },
        rawBody: JSON.stringify({ filename: 'test.pdf', contentBase64: 'JQ==' }),
      });
      const res = createMockResponse();

      handleStorageApi(req, res);
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(res.statusCode).toBe(401);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('Unauthorized');
    });

    it('allows authorized admin upload and returns 201 Created', async () => {
      const validPdfBase64 = Buffer.from('%PDF-1.7\nAdmin uploaded').toString('base64');
      const req = createMockRequest({
        method: 'POST',
        url: '/api/storage/upload',
        headers: {
          authorization: `Bearer ${TEST_ADMIN_KEY}`,
          'content-type': 'application/json',
        },
        rawBody: JSON.stringify({
          filename: 'system-handbook.pdf',
          contentBase64: validPdfBase64,
          category: 'ebooks',
          associatedProductId: 'de-prod-001',
        }),
      });
      const res = createMockResponse();

      handleStorageApi(req, res);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(res.statusCode).toBe(201);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.metadata.originalName).toBe('system-handbook.pdf');
      expect(body.metadata.fileId).toBeDefined();
    });

    it('rejects malicious or invalid upload files with 400 Bad Request', async () => {
      const fakePdfBase64 = Buffer.from('Not a PDF').toString('base64');
      const req = createMockRequest({
        method: 'POST',
        url: '/api/storage/upload',
        headers: {
          authorization: `Bearer ${TEST_ADMIN_KEY}`,
          'content-type': 'application/json',
        },
        rawBody: JSON.stringify({
          filename: 'fake.pdf',
          contentBase64: fakePdfBase64,
        }),
      });
      const res = createMockResponse();

      handleStorageApi(req, res);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Missing %PDF- signature');
    });

    it('lists uploaded files for authenticated admin', async () => {
      // First upload a file directly
      const provider = new LocalStorageProvider(TEST_VAULT_DIR);
      await provider.putObject({
        filename: 'manual.pdf',
        buffer: Buffer.from('%PDF-1.4\nManual'),
      });

      const req = createMockRequest({
        method: 'GET',
        url: '/api/storage/files',
        headers: {
          'x-admin-key': TEST_ADMIN_KEY,
        },
      });
      const res = createMockResponse();

      handleStorageApi(req, res);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.success).toBe(true);
      expect(body.count).toBeGreaterThanOrEqual(1);
    });

    it('generates a download token and executes authorized download', async () => {
      const provider = new LocalStorageProvider(TEST_VAULT_DIR);
      const uploaded = await provider.putObject({
        filename: 'guide.pdf',
        buffer: Buffer.from('%PDF-1.5\nGuide content'),
      });

      // 1. Generate token
      const tokenReq = createMockRequest({
        method: 'POST',
        url: '/api/storage/token',
        headers: {
          authorization: `Bearer ${TEST_ADMIN_KEY}`,
          'content-type': 'application/json',
        },
        rawBody: JSON.stringify({
          fileId: uploaded.fileId,
          ttlSeconds: 600,
        }),
      });
      const tokenRes = createMockResponse();

      handleStorageApi(tokenReq, tokenRes);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(tokenRes.statusCode).toBe(200);
      const tokenBody = JSON.parse(tokenRes.body);
      const token = tokenBody.token;

      // 2. Download with valid token (demo deliverable voucher)
      const dlReq = createMockRequest({
        method: 'GET',
        url: `/api/storage/download?fileId=${uploaded.fileId}&token=${token}`,
      });
      const dlRes = createMockResponse();

      handleStorageApi(dlReq, dlRes);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(dlRes.statusCode).toBe(200);
      const dlBody = JSON.parse(dlRes.body);
      expect(dlBody.deliverable).toContain('Authorized');
      expect(dlBody.fileId).toBe(uploaded.fileId);

      // 3. Download with invalid token -> 403
      const badDlReq = createMockRequest({
        method: 'GET',
        url: `/api/storage/download?fileId=${uploaded.fileId}&token=invalid_token`,
      });
      const badDlRes = createMockResponse();

      handleStorageApi(badDlReq, badDlRes);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(badDlRes.statusCode).toBe(403);
      const badDlBody = JSON.parse(badDlRes.body);
      expect(badDlBody.success).toBe(false);
    });

    it('reports operational health status', async () => {
      const req = createMockRequest({
        method: 'GET',
        url: '/api/storage/health',
      });
      const res = createMockResponse();

      handleStorageApi(req, res);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      expect(body.status).toBe('operational');
      expect(body.provider).toBe('local');
    });
  });
});
