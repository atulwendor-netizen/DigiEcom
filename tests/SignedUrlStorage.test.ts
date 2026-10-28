import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateS3PresignedUrl,
  getStorageConfig,
  isStorageConfigured,
  generateProductPresignedUrl,
  getProductAssetDetails,
  generateDownloadToken,
  verifyDownloadToken,
  rfc3986Encode,
} from '../server/signedUrlStorage';

describe('Cloudflare R2 / AWS S3 Signed URL Download Handler', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('correctly RFC 3986 encodes special characters in URIs', () => {
    expect(rfc3986Encode("hello world! (test)'*")).toBe('hello%20world%21%20%28test%29%27%2A');
  });

  it('generates a compliant AWS SigV4 presigned URL for AWS S3', () => {
    const url = generateS3PresignedUrl({
      bucket: 'my-store-bucket',
      key: 'products/handbook/handbook.pdf',
      region: 'ap-south-1',
      accessKeyId: 'AKIA_TEST_KEY',
      secretAccessKey: 'SECRET_TEST_KEY',
      expiresInSeconds: 3600,
      downloadFilename: 'Handbook.pdf',
    });

    expect(url).toContain('https://my-store-bucket.s3.ap-south-1.amazonaws.com/products/handbook/handbook.pdf?');
    expect(url).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256');
    expect(url).toContain('X-Amz-Credential=AKIA_TEST_KEY%2F');
    expect(url).toContain('%2Fap-south-1%2Fs3%2Faws4_request');
    expect(url).toContain('X-Amz-Expires=3600');
    expect(url).toContain('X-Amz-SignedHeaders=host');
    expect(url).toContain('response-content-disposition=attachment%3B%20filename%3D%22Handbook.pdf%22');
    expect(url).toMatch(/X-Amz-Signature=[0-9a-f]{64}/);
  });

  it('generates a compliant SigV4 presigned URL for Cloudflare R2', () => {
    const url = generateS3PresignedUrl({
      bucket: 'digiecom-prod-bucket',
      key: 'vaults/prompts.zip',
      endpoint: 'https://a987b654c321.r2.cloudflarestorage.com',
      region: 'auto',
      accessKeyId: 'R2_ACCESS_KEY_SAMPLE',
      secretAccessKey: 'R2_SECRET_KEY_SAMPLE',
      expiresInSeconds: 86400,
      downloadFilename: 'Enterprise-Prompts.zip',
    });

    expect(url).toContain('https://a987b654c321.r2.cloudflarestorage.com/digiecom-prod-bucket/vaults/prompts.zip?');
    expect(url).toContain('X-Amz-Algorithm=AWS4-HMAC-SHA256');
    expect(url).toContain('X-Amz-Credential=R2_ACCESS_KEY_SAMPLE%2F');
    expect(url).toContain('%2Fauto%2Fs3%2Faws4_request');
    expect(url).toContain('X-Amz-Expires=86400');
    expect(url).toMatch(/X-Amz-Signature=[0-9a-f]{64}/);
  });

  it('maps catalogue products to predictable storage keys and MIME content types', () => {
    const asset1 = getProductAssetDetails('de-prod-001');
    expect(asset1).not.toBeNull();
    expect(asset1?.slug).toBe('system-design-handbook-cloud-scale');
    expect(asset1?.storageKey).toBe('products/system-design-handbook-cloud-scale/system-design-handbook-cloud-scale.pdf');
    expect(asset1?.contentType).toBe('application/pdf');

    const assetPrompt = getProductAssetDetails('de-prod-003');
    expect(assetPrompt).not.toBeNull();
    expect(assetPrompt?.filename).toBe('master-ai-prompt-vault-gpt4o-claude.json');
    expect(assetPrompt?.contentType).toBe('application/json');
  });

  it('generates and validates tamper-proof HMAC-SHA256 download tokens', () => {
    const productId = 'de-prod-001';
    const orderId = 'order_test_999';
    const token = generateDownloadToken(productId, orderId);

    // Valid token passes
    expect(verifyDownloadToken(productId, orderId, token)).toBe(true);

    // Tampered product fails
    expect(verifyDownloadToken('de-prod-002', orderId, token)).toBe(false);

    // Tampered order fails
    expect(verifyDownloadToken(productId, 'order_fake', token)).toBe(false);

    // Tampered signature fails
    const tamperedToken = token.slice(0, -4) + '0000';
    expect(verifyDownloadToken(productId, orderId, tamperedToken)).toBe(false);

    // Expired token fails
    const ancientTimestamp = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31 days ago
    const expiredToken = generateDownloadToken(productId, orderId, ancientTimestamp);
    expect(verifyDownloadToken(productId, orderId, expiredToken, 30 * 24 * 60 * 60 * 1000)).toBe(false);
  });

  it('identifies unconfigured status in sandbox/demo mode', () => {
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;

    expect(isStorageConfigured()).toBe(false);
    const config = getStorageConfig();
    expect(config.provider).toBe('unconfigured');
    expect(generateProductPresignedUrl('de-prod-001')).toBeNull();
  });

  it('automatically activates Cloudflare R2 mode when R2 environment variables are supplied', () => {
    process.env.R2_ACCOUNT_ID = 'cf_account_12345';
    process.env.R2_BUCKET_NAME = 'my-r2-store';
    process.env.R2_ACCESS_KEY_ID = 'cf_r2_key_xyz';
    process.env.R2_SECRET_ACCESS_KEY = 'cf_r2_secret_xyz';

    expect(isStorageConfigured()).toBe(true);
    const config = getStorageConfig();
    expect(config.provider).toBe('cloudflare-r2');
    expect(config.bucket).toBe('my-r2-store');
    expect(config.endpoint).toBe('https://cf_account_12345.r2.cloudflarestorage.com');

    const presigned = generateProductPresignedUrl('de-prod-001');
    expect(presigned).not.toBeNull();
    expect(presigned?.provider).toBe('cloudflare-r2');
    expect(presigned?.url).toContain('https://cf_account_12345.r2.cloudflarestorage.com/my-r2-store/');
  });

  it('automatically activates AWS S3 mode when AWS environment variables are supplied', () => {
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;

    process.env.AWS_S3_BUCKET = 'digiecom-s3-store';
    process.env.AWS_ACCESS_KEY_ID = 'AKIA_PROD_123';
    process.env.AWS_SECRET_ACCESS_KEY = 'AWS_SECRET_PROD_123';
    process.env.AWS_REGION = 'ap-south-1';

    expect(isStorageConfigured()).toBe(true);
    const config = getStorageConfig();
    expect(config.provider).toBe('aws-s3');
    expect(config.bucket).toBe('digiecom-s3-store');

    const presigned = generateProductPresignedUrl('de-prod-001');
    expect(presigned).not.toBeNull();
    expect(presigned?.provider).toBe('aws-s3');
    expect(presigned?.url).toContain('https://digiecom-s3-store.s3.ap-south-1.amazonaws.com/');
  });
});
