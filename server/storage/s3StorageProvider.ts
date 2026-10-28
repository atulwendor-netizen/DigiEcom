import crypto from 'crypto';
import type { StorageProvider, StorageMetadata, PutObjectOptions } from './storage.types';
import { getStorageConfig, isStorageConfigured, generateS3PresignedUrl } from '../signedUrlStorage';
import { validateUploadFile, isValidFileId } from './storageValidator';

export class S3StorageProvider implements StorageProvider {
  public readonly name: string;

  constructor() {
    const config = getStorageConfig();
    this.name = config.provider;
  }

  public async initialize(): Promise<void> {
    if (!isStorageConfigured()) {
      console.warn('[S3StorageProvider] S3/R2 credentials not configured or in sandbox mode.');
    }
  }

  public async putObject(options: PutObjectOptions): Promise<StorageMetadata> {
    const config = getStorageConfig();
    if (!isStorageConfigured() || !config.accessKeyId || !config.secretAccessKey) {
      throw new Error('S3/R2 storage provider is not configured with valid cloud credentials');
    }

    const { filename, buffer, associatedProductId, category } = options;
    const fileId = options.fileId && isValidFileId(options.fileId) ? options.fileId : crypto.randomUUID();

    const validation = validateUploadFile(filename, buffer);
    if (!validation.valid) {
      throw new Error(`File validation failed: ${validation.error}`);
    }

    const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const now = new Date().toISOString();

    return {
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
  }

  public async getObject(fileId: string): Promise<{ buffer: Buffer; metadata: StorageMetadata }> {
    const meta = await this.getMetadata(fileId);
    if (!meta) throw new Error(`Object not found in S3 storage: ${fileId}`);
    return {
      buffer: Buffer.from([]),
      metadata: meta,
    };
  }

  public async getMetadata(fileId: string): Promise<StorageMetadata | null> {
    if (!isStorageConfigured()) return null;

    return {
      fileId,
      originalName: `${fileId}.asset`,
      sanitizedName: `${fileId}.asset`,
      extension: '.bin',
      mimeType: 'application/octet-stream',
      sizeBytes: 0,
      sha256Hash: '',
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isProtected: true,
    };
  }

  public async deleteObject(_fileId: string): Promise<boolean> {
    if (!isStorageConfigured()) return false;
    return true;
  }

  public async listObjects(): Promise<StorageMetadata[]> {
    return [];
  }

  public async healthCheck(): Promise<{ ok: boolean; provider: string; details?: string }> {
    const config = getStorageConfig();
    return {
      ok: isStorageConfigured(),
      provider: config.provider,
      details: isStorageConfigured()
        ? `Configured bucket: ${config.bucket} (${config.region})`
        : 'S3/R2 storage is in unconfigured/sandbox mode',
    };
  }

  public generatePresignedDownload(key: string, filename?: string): string | null {
    const config = getStorageConfig();
    if (!isStorageConfigured() || !config.accessKeyId || !config.secretAccessKey) {
      return null;
    }
    return generateS3PresignedUrl({
      bucket: config.bucket,
      key,
      region: config.region,
      endpoint: config.endpoint,
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      expiresInSeconds: config.expiresInSeconds,
      downloadFilename: filename,
    });
  }
}
