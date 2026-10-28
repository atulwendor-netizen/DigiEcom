export interface StorageMetadata {
  fileId: string;
  originalName: string;
  sanitizedName: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  sha256Hash: string;
  category?: string;
  associatedProductId?: string;
  uploadedAt: string;
  updatedAt: string;
  isProtected: boolean;
}

export interface PutObjectOptions {
  fileId?: string;
  filename: string;
  mimeType?: string;
  buffer: Buffer;
  associatedProductId?: string;
  category?: string;
}

export interface StorageProvider {
  readonly name: string;
  initialize(): Promise<void>;
  putObject(options: PutObjectOptions): Promise<StorageMetadata>;
  getObject(fileId: string): Promise<{ buffer: Buffer; metadata: StorageMetadata }>;
  getMetadata(fileId: string): Promise<StorageMetadata | null>;
  deleteObject(fileId: string): Promise<boolean>;
  listObjects(prefix?: string): Promise<StorageMetadata[]>;
  healthCheck(): Promise<{ ok: boolean; provider: string; details?: string }>;
}

export interface StorageConfig {
  provider: 'local' | 'cloudflare-r2' | 'aws-s3' | 'custom-s3';
  localVaultDir: string;
  maxFileSizeBytes: number;
  downloadTokenSecret: string;
  adminApiKey: string;
  tokenTtlSeconds: number;
}
