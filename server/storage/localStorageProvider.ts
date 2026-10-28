import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type { StorageProvider, StorageMetadata, PutObjectOptions } from './storage.types';
import { isValidFileId, validateUploadFile, DEFAULT_MAX_FILE_SIZE_BYTES } from './storageValidator';

export class LocalStorageProvider implements StorageProvider {
  public readonly name = 'local';
  private readonly vaultDir: string;
  private readonly blobsDir: string;
  private readonly metaDir: string;
  private isInitialized = false;

  constructor(vaultDir?: string) {
    this.vaultDir = vaultDir || process.env.LOCAL_STORAGE_DIR || path.resolve(process.cwd(), '.storage_vault');
    this.blobsDir = path.resolve(this.vaultDir, 'blobs');
    this.metaDir = path.resolve(this.vaultDir, 'meta');
  }

  /**
   * Initializes vault directories outside public web root.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (!fs.existsSync(this.vaultDir)) {
        fs.mkdirSync(this.vaultDir, { recursive: true });
      }
      if (!fs.existsSync(this.blobsDir)) {
        fs.mkdirSync(this.blobsDir, { recursive: true });
      }
      if (!fs.existsSync(this.metaDir)) {
        fs.mkdirSync(this.metaDir, { recursive: true });
      }
      this.isInitialized = true;
    } catch (err: any) {
      throw new Error(`Failed to initialize LocalStorageProvider at "${this.vaultDir}": ${err.message}`);
    }
  }

  /**
   * Safe path resolver enforcing containment inside the vault.
   */
  private getBlobPath(fileId: string): string {
    if (!isValidFileId(fileId)) {
      throw new Error(`Invalid fileId: "${fileId}". FileId must be a valid UUID.`);
    }
    const resolved = path.resolve(this.blobsDir, `${fileId}.bin`);
    if (!resolved.startsWith(this.blobsDir)) {
      throw new Error(`Security Violation: Path traversal detected for fileId "${fileId}"`);
    }
    return resolved;
  }

  /**
   * Safe metadata path resolver enforcing containment inside the vault.
   */
  private getMetaPath(fileId: string): string {
    if (!isValidFileId(fileId)) {
      throw new Error(`Invalid fileId: "${fileId}". FileId must be a valid UUID.`);
    }
    const resolved = path.resolve(this.metaDir, `${fileId}.json`);
    if (!resolved.startsWith(this.metaDir)) {
      throw new Error(`Security Violation: Path traversal detected for fileId "${fileId}"`);
    }
    return resolved;
  }

  /**
   * Puts a new file object into the vault with atomic write and separate metadata storage.
   */
  public async putObject(options: PutObjectOptions): Promise<StorageMetadata> {
    await this.initialize();

    const { filename, buffer, associatedProductId, category } = options;
    const fileId = options.fileId && isValidFileId(options.fileId) ? options.fileId : crypto.randomUUID();

    // Validate file integrity, size, and magic bytes
    const validation = validateUploadFile(filename, buffer, DEFAULT_MAX_FILE_SIZE_BYTES, options.mimeType);
    if (!validation.valid) {
      throw new Error(`File validation failed: ${validation.error}`);
    }

    const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const now = new Date().toISOString();

    const metadata: StorageMetadata = {
      fileId,
      originalName: filename,
      sanitizedName: validation.sanitizedName || 'asset.bin',
      extension: validation.extension || '.bin',
      mimeType: validation.detectedMimeType || 'application/octet-stream',
      sizeBytes: buffer.length,
      sha256Hash,
      category: category || 'digital-products',
      associatedProductId,
      uploadedAt: now,
      updatedAt: now,
      isProtected: true,
    };

    const blobPath = this.getBlobPath(fileId);
    const metaPath = this.getMetaPath(fileId);
    const tmpBlobPath = `${blobPath}.${Date.now()}.tmp`;

    try {
      // 1. Atomic write of binary blob
      fs.writeFileSync(tmpBlobPath, buffer);
      fs.renameSync(tmpBlobPath, blobPath);

      // 2. Write metadata JSON separately
      fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), 'utf-8');

      return metadata;
    } catch (err: any) {
      if (fs.existsSync(tmpBlobPath)) {
        try { fs.unlinkSync(tmpBlobPath); } catch {}
      }
      throw new Error(`Failed to store object "${fileId}": ${err.message}`);
    }
  }

  /**
   * Retrieves binary content and metadata.
   */
  public async getObject(fileId: string): Promise<{ buffer: Buffer; metadata: StorageMetadata }> {
    await this.initialize();
    const meta = await this.getMetadata(fileId);
    if (!meta) {
      throw new Error(`File not found: "${fileId}"`);
    }

    const blobPath = this.getBlobPath(fileId);
    if (!fs.existsSync(blobPath)) {
      throw new Error(`Binary object data missing for fileId "${fileId}"`);
    }

    const buffer = fs.readFileSync(blobPath);
    return { buffer, metadata: meta };
  }

  /**
   * Reads metadata separately from file content (fast, low memory footprint).
   */
  public async getMetadata(fileId: string): Promise<StorageMetadata | null> {
    await this.initialize();
    try {
      const metaPath = this.getMetaPath(fileId);
      if (!fs.existsSync(metaPath)) return null;
      const raw = fs.readFileSync(metaPath, 'utf-8');
      return JSON.parse(raw) as StorageMetadata;
    } catch {
      return null;
    }
  }

  /**
   * Deletes binary object and its metadata.
   */
  public async deleteObject(fileId: string): Promise<boolean> {
    await this.initialize();
    try {
      const blobPath = this.getBlobPath(fileId);
      const metaPath = this.getMetaPath(fileId);
      let deleted = false;

      if (fs.existsSync(blobPath)) {
        fs.unlinkSync(blobPath);
        deleted = true;
      }
      if (fs.existsSync(metaPath)) {
        fs.unlinkSync(metaPath);
        deleted = true;
      }
      return deleted;
    } catch (err: any) {
      throw new Error(`Failed to delete object "${fileId}": ${err.message}`);
    }
  }

  /**
   * Lists all stored file metadata.
   */
  public async listObjects(): Promise<StorageMetadata[]> {
    await this.initialize();
    try {
      const files = fs.readdirSync(this.metaDir);
      const results: StorageMetadata[] = [];

      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        try {
          const raw = fs.readFileSync(path.resolve(this.metaDir, file), 'utf-8');
          results.push(JSON.parse(raw));
        } catch {}
      }

      // Sort by uploadedAt descending
      return results.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    } catch {
      return [];
    }
  }

  /**
   * Health check verifying vault read/write capability.
   */
  public async healthCheck(): Promise<{ ok: boolean; provider: string; details?: string }> {
    try {
      await this.initialize();
      const testFile = path.resolve(this.vaultDir, '.health_check.tmp');
      fs.writeFileSync(testFile, 'ok', 'utf-8');
      fs.unlinkSync(testFile);
      return { ok: true, provider: 'local', details: `Vault active at ${this.vaultDir}` };
    } catch (err: any) {
      return { ok: false, provider: 'local', details: err.message };
    }
  }
}
