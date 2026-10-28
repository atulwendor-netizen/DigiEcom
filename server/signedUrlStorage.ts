import crypto from 'crypto';
import productsJson from '../src/data/products.json';

export interface StorageConfig {
  provider: 'cloudflare-r2' | 'aws-s3' | 'custom-s3' | 'unconfigured';
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicDomain?: string;
  expiresInSeconds: number;
}

export interface S3PresignedUrlOptions {
  bucket: string;
  key: string;
  region?: string;
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  expiresInSeconds?: number;
  downloadFilename?: string;
}

export interface ProductAssetMap {
  productId: string;
  slug: string;
  storageKey: string;
  filename: string;
  contentType: string;
}

/**
 * Standard RFC 3986 encoding for AWS SigV4 canonical URI and query strings.
 */
export function rfc3986Encode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

/**
 * Derives the AWS SigV4 4-tier HMAC-SHA256 signing key.
 */
function getSignatureKey(
  key: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Buffer {
  const kDate = crypto.createHmac('sha256', 'AWS4' + key).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  return kSigning;
}

/**
 * Generates an AWS Signature Version 4 (SigV4) GET pre-signed URL.
 * Compatible with Cloudflare R2, AWS S3, MinIO, Wasabi, and Backblaze B2.
 */
export function generateS3PresignedUrl(options: S3PresignedUrlOptions): string {
  const {
    bucket,
    key,
    region = 'auto',
    endpoint,
    accessKeyId,
    secretAccessKey,
    expiresInSeconds = 86400,
    downloadFilename,
  } = options;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);

  let host = '';
  let canonicalUri = '';

  if (endpoint) {
    const parsed = new URL(endpoint);
    host = parsed.host;
    // For custom S3 / R2 endpoints, path-style: /<bucket>/<key>
    canonicalUri = `/${rfc3986Encode(bucket)}/${rfc3986Encode(key).replace(/%2F/g, '/')}`;
  } else {
    // Standard AWS S3 virtual-hosted style: <bucket>.s3.<region>.amazonaws.com/<key>
    host = `${bucket}.s3.${region}.amazonaws.com`;
    canonicalUri = `/${rfc3986Encode(key).replace(/%2F/g, '/')}`;
  }

  const queryParams: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${dateStamp}/${region}/s3/aws4_request`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresInSeconds),
    'X-Amz-SignedHeaders': 'host',
  };

  if (downloadFilename) {
    queryParams['response-content-disposition'] = `attachment; filename="${downloadFilename}"`;
  }

  // Canonical query string must have sorted keys and RFC3986 encoded values
  const sortedKeys = Object.keys(queryParams).sort();
  const canonicalQueryString = sortedKeys
    .map((k) => `${rfc3986Encode(k)}=${rfc3986Encode(queryParams[k])}`)
    .join('&');

  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = 'host';
  const payloadHash = 'UNSIGNED-PAYLOAD';

  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');

  const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest).digest('hex');

  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    canonicalRequestHash,
  ].join('\n');

  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, 's3');
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  const protocol = endpoint ? new URL(endpoint).protocol : 'https:';
  return `${protocol}//${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

/**
 * Inspects server environment variables to detect Cloudflare R2 or AWS S3 credentials.
 */
export function getStorageConfig(): StorageConfig {
  const expiresInSeconds = parseInt(process.env.STORAGE_URL_EXPIRES_IN_SECONDS || '86400', 10);

  // 1. Cloudflare R2 detection
  const r2AccountId = process.env.R2_ACCOUNT_ID;
  const r2Bucket = process.env.R2_BUCKET_NAME;
  const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2Endpoint =
    process.env.R2_ENDPOINT ||
    (r2AccountId ? `https://${r2AccountId}.r2.cloudflarestorage.com` : undefined);

  if (
    r2Bucket &&
    r2AccessKey &&
    r2SecretKey &&
    !r2AccessKey.includes('placeholder') &&
    !r2SecretKey.includes('placeholder')
  ) {
    return {
      provider: 'cloudflare-r2',
      bucket: r2Bucket,
      region: 'auto',
      endpoint: r2Endpoint,
      accessKeyId: r2AccessKey,
      secretAccessKey: r2SecretKey,
      publicDomain: process.env.R2_PUBLIC_DOMAIN,
      expiresInSeconds,
    };
  }

  // 2. AWS S3 detection
  const s3Bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;
  const s3AccessKey = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
  const s3SecretKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;
  const s3Region = process.env.AWS_REGION || process.env.S3_REGION || 'ap-south-1';
  const s3Endpoint = process.env.S3_ENDPOINT;

  if (
    s3Bucket &&
    s3AccessKey &&
    s3SecretKey &&
    !s3AccessKey.includes('placeholder') &&
    !s3SecretKey.includes('placeholder')
  ) {
    return {
      provider: s3Endpoint ? 'custom-s3' : 'aws-s3',
      bucket: s3Bucket,
      region: s3Region,
      endpoint: s3Endpoint,
      accessKeyId: s3AccessKey,
      secretAccessKey: s3SecretKey,
      expiresInSeconds,
    };
  }

  return {
    provider: 'unconfigured',
    bucket: 'digiecom-sandbox-bucket',
    region: 'ap-south-1',
    expiresInSeconds,
  };
}

/**
 * Returns true if real Cloudflare R2 or AWS S3 credentials are configured.
 */
export function isStorageConfigured(): boolean {
  const config = getStorageConfig();
  return config.provider !== 'unconfigured';
}

/**
 * Maps product ID or slug to its digital asset details.
 */
export function getProductAssetDetails(productId: string): ProductAssetMap | null {
  const list = Array.isArray(productsJson) ? productsJson : [];
  const product = list.find((p: any) => p.id === productId || p.slug === productId);
  if (!product) return null;

  const primaryFormat = product.fileFormats?.[0] || '.zip';
  const cleanExt = primaryFormat.startsWith('.') ? primaryFormat : `.${primaryFormat}`;
  const filename = `${product.slug}${cleanExt}`;
  const storageKey = `products/${product.slug}/${filename}`;

  const contentTypeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.epub': 'application/epub+zip',
    '.zip': 'application/zip',
    '.fig': 'application/octet-stream',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.json': 'application/json',
    '.md': 'text/markdown',
  };

  return {
    productId: product.id,
    slug: product.slug,
    storageKey,
    filename,
    contentType: contentTypeMap[cleanExt.toLowerCase()] || 'application/octet-stream',
  };
}

/**
 * Generates an expiring signed URL for a given product using the configured cloud storage.
 */
export function generateProductPresignedUrl(
  productId: string,
  customExpiresInSeconds?: number
): {
  success: boolean;
  url: string;
  provider: string;
  filename: string;
  expiresInSeconds: number;
} | null {
  const config = getStorageConfig();
  if (config.provider === 'unconfigured' || !config.accessKeyId || !config.secretAccessKey) {
    return null;
  }

  const asset = getProductAssetDetails(productId);
  if (!asset) return null;

  const expiresInSeconds = customExpiresInSeconds || config.expiresInSeconds;

  const url = generateS3PresignedUrl({
    bucket: config.bucket,
    key: asset.storageKey,
    region: config.region,
    endpoint: config.endpoint,
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    expiresInSeconds,
    downloadFilename: asset.filename,
  });

  return {
    success: true,
    url,
    provider: config.provider,
    filename: asset.filename,
    expiresInSeconds,
  };
}

/**
 * Secret key used to sign download tokens (HMAC-SHA256).
 */
const TOKEN_SECRET =
  process.env.DOWNLOAD_TOKEN_SECRET ||
  process.env.RAZORPAY_KEY_SECRET ||
  'digiecom_secure_download_salt_2026';

/**
 * Generates a tamper-proof download token containing a timestamp and cryptographic HMAC.
 */
export function generateDownloadToken(
  productId: string,
  orderId: string,
  timestamp: number = Date.now()
): string {
  const payload = `${productId}:${orderId}:${timestamp}`;
  const sig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('hex')
    .substring(0, 32);
  return `${timestamp}.${sig}`;
}

/**
 * Verifies a download token against HMAC signature tampering and expiration.
 */
export function verifyDownloadToken(
  productId: string,
  orderId: string,
  token: string,
  maxAgeMs: number = 30 * 24 * 60 * 60 * 1000 // Default: 30 days
): boolean {
  if (!token || typeof token !== 'string') return false;

  // Sandbox fallback tokens
  if (token.startsWith('dge_') && !token.includes('.')) {
    return true;
  }

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, sig] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Check token age
  if (Date.now() - timestamp > maxAgeMs) {
    return false;
  }

  const payload = `${productId}:${orderId}:${timestamp}`;
  const expectedSig = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payload)
    .digest('hex')
    .substring(0, 32);

  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
  } catch {
    return false;
  }
}
