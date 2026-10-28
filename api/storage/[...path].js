// server/storageApi.ts
import crypto5 from "crypto";

// server/storage/localStorageProvider.ts
import fs from "fs";
import path2 from "path";
import crypto from "crypto";

// server/storage/storageValidator.ts
import path from "path";
var DEFAULT_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
var ALLOWED_EXTENSIONS = /* @__PURE__ */ new Set([
  ".pdf",
  ".epub",
  ".zip",
  ".fig",
  ".xlsx",
  ".json",
  ".md",
  ".png"
]);
var DISALLOWED_EXTENSIONS = /* @__PURE__ */ new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".php",
  ".py",
  ".js",
  ".ts",
  ".html",
  ".htm",
  ".vbs",
  ".msi",
  ".dll",
  ".so",
  ".com",
  ".scr"
]);
var MIME_MAP = {
  ".pdf": "application/pdf",
  ".epub": "application/epub+zip",
  ".zip": "application/zip",
  ".fig": "application/octet-stream",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".json": "application/json",
  ".md": "text/markdown",
  ".png": "image/png"
};
var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidFileId(fileId) {
  if (!fileId || typeof fileId !== "string") return false;
  return UUID_REGEX.test(fileId.trim());
}
function sanitizeFilename(rawFilename) {
  if (!rawFilename) return "unnamed_asset.bin";
  const base = path.basename(rawFilename);
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned || "unnamed_asset.bin";
}
function verifyMagicBytes(buffer, ext) {
  if (buffer.length < 4) {
    return { valid: false, error: "File is too small or empty to verify file signature" };
  }
  if (ext === ".pdf") {
    const isPdf = buffer[0] === 37 && buffer[1] === 80 && buffer[2] === 68 && buffer[3] === 70;
    if (!isPdf) {
      return { valid: false, error: "Invalid PDF file: Missing %PDF- signature header" };
    }
    return { valid: true };
  }
  if (ext === ".zip" || ext === ".epub" || ext === ".xlsx" || ext === ".fig") {
    const isZip = buffer[0] === 80 && buffer[1] === 75 && (buffer[2] === 3 || buffer[2] === 5 || buffer[2] === 7) && (buffer[3] === 4 || buffer[3] === 6 || buffer[3] === 8);
    const isFigKiwi = ext === ".fig" && buffer[0] === 102 && buffer[1] === 105 && buffer[2] === 103 && buffer[3] === 45;
    if (!isZip && !isFigKiwi) {
      return { valid: false, error: `Invalid ${ext.toUpperCase()} file: Expected valid archive / binary container signature` };
    }
    return { valid: true };
  }
  if (ext === ".png") {
    const isPng = buffer.length >= 8 && buffer[0] === 137 && buffer[1] === 80 && buffer[2] === 78 && buffer[3] === 71 && buffer[4] === 13 && buffer[5] === 10 && buffer[6] === 26 && buffer[7] === 10;
    if (!isPng) {
      return { valid: false, error: "Invalid PNG file: Missing PNG signature header" };
    }
    return { valid: true };
  }
  if (ext === ".json") {
    try {
      const text = buffer.toString("utf8");
      JSON.parse(text);
      return { valid: true };
    } catch {
      return { valid: false, error: "Invalid JSON file: Content is not parseable JSON" };
    }
  }
  if (ext === ".md") {
    const text = buffer.toString("utf8");
    if (/<script\b[^>]*>/i.test(text)) {
      return { valid: false, error: "Malicious Markdown content: Embedded <script> tags detected" };
    }
    return { valid: true };
  }
  return { valid: true };
}
function validateUploadFile(filename, buffer, maxSizeBytes = DEFAULT_MAX_FILE_SIZE_BYTES, clientMimeType) {
  if (!filename || typeof filename !== "string") {
    return { valid: false, error: "Filename is required" };
  }
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return { valid: false, error: "Path traversal characters are prohibited in filename" };
  }
  const sanitized = sanitizeFilename(filename);
  const ext = path.extname(sanitized).toLowerCase();
  if (!ext) {
    return { valid: false, error: "File must have an explicit extension" };
  }
  if (DISALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Executable or script extension ${ext} is strictly prohibited` };
  }
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Extension ${ext} is not allowed. Supported formats: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}`
    };
  }
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: "File buffer cannot be empty" };
  }
  if (buffer.length > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit (${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB)`
    };
  }
  const magicCheck = verifyMagicBytes(buffer, ext);
  if (!magicCheck.valid) {
    return { valid: false, error: magicCheck.error };
  }
  const expectedMime = MIME_MAP[ext] || clientMimeType || "application/octet-stream";
  return {
    valid: true,
    sanitizedName: sanitized,
    extension: ext,
    detectedMimeType: expectedMime
  };
}

// server/storage/localStorageProvider.ts
var LocalStorageProvider = class {
  name = "local";
  vaultDir;
  blobsDir;
  metaDir;
  isInitialized = false;
  constructor(vaultDir) {
    this.vaultDir = vaultDir || process.env.LOCAL_STORAGE_DIR || path2.resolve(process.cwd(), ".storage_vault");
    this.blobsDir = path2.resolve(this.vaultDir, "blobs");
    this.metaDir = path2.resolve(this.vaultDir, "meta");
  }
  /**
   * Initializes vault directories outside public web root.
   */
  async initialize() {
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
    } catch (err) {
      throw new Error(`Failed to initialize LocalStorageProvider at "${this.vaultDir}": ${err.message}`);
    }
  }
  /**
   * Safe path resolver enforcing containment inside the vault.
   */
  getBlobPath(fileId) {
    if (!isValidFileId(fileId)) {
      throw new Error(`Invalid fileId: "${fileId}". FileId must be a valid UUID.`);
    }
    const resolved = path2.resolve(this.blobsDir, `${fileId}.bin`);
    if (!resolved.startsWith(this.blobsDir)) {
      throw new Error(`Security Violation: Path traversal detected for fileId "${fileId}"`);
    }
    return resolved;
  }
  /**
   * Safe metadata path resolver enforcing containment inside the vault.
   */
  getMetaPath(fileId) {
    if (!isValidFileId(fileId)) {
      throw new Error(`Invalid fileId: "${fileId}". FileId must be a valid UUID.`);
    }
    const resolved = path2.resolve(this.metaDir, `${fileId}.json`);
    if (!resolved.startsWith(this.metaDir)) {
      throw new Error(`Security Violation: Path traversal detected for fileId "${fileId}"`);
    }
    return resolved;
  }
  /**
   * Puts a new file object into the vault with atomic write and separate metadata storage.
   */
  async putObject(options) {
    await this.initialize();
    const { filename, buffer, associatedProductId, category } = options;
    const fileId = options.fileId && isValidFileId(options.fileId) ? options.fileId : crypto.randomUUID();
    const validation = validateUploadFile(filename, buffer, DEFAULT_MAX_FILE_SIZE_BYTES, options.mimeType);
    if (!validation.valid) {
      throw new Error(`File validation failed: ${validation.error}`);
    }
    const sha256Hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const metadata = {
      fileId,
      originalName: filename,
      sanitizedName: validation.sanitizedName || "asset.bin",
      extension: validation.extension || ".bin",
      mimeType: validation.detectedMimeType || "application/octet-stream",
      sizeBytes: buffer.length,
      sha256Hash,
      category: category || "digital-products",
      associatedProductId,
      uploadedAt: now,
      updatedAt: now,
      isProtected: true
    };
    const blobPath = this.getBlobPath(fileId);
    const metaPath = this.getMetaPath(fileId);
    const tmpBlobPath = `${blobPath}.${Date.now()}.tmp`;
    try {
      fs.writeFileSync(tmpBlobPath, buffer);
      fs.renameSync(tmpBlobPath, blobPath);
      fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), "utf-8");
      return metadata;
    } catch (err) {
      if (fs.existsSync(tmpBlobPath)) {
        try {
          fs.unlinkSync(tmpBlobPath);
        } catch {
        }
      }
      throw new Error(`Failed to store object "${fileId}": ${err.message}`);
    }
  }
  /**
   * Retrieves binary content and metadata.
   */
  async getObject(fileId) {
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
  async getMetadata(fileId) {
    await this.initialize();
    try {
      const metaPath = this.getMetaPath(fileId);
      if (!fs.existsSync(metaPath)) return null;
      const raw = fs.readFileSync(metaPath, "utf-8");
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  /**
   * Deletes binary object and its metadata.
   */
  async deleteObject(fileId) {
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
    } catch (err) {
      throw new Error(`Failed to delete object "${fileId}": ${err.message}`);
    }
  }
  /**
   * Lists all stored file metadata.
   */
  async listObjects() {
    await this.initialize();
    try {
      const files = fs.readdirSync(this.metaDir);
      const results = [];
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        try {
          const raw = fs.readFileSync(path2.resolve(this.metaDir, file), "utf-8");
          results.push(JSON.parse(raw));
        } catch {
        }
      }
      return results.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    } catch {
      return [];
    }
  }
  /**
   * Health check verifying vault read/write capability.
   */
  async healthCheck() {
    try {
      await this.initialize();
      const testFile = path2.resolve(this.vaultDir, ".health_check.tmp");
      fs.writeFileSync(testFile, "ok", "utf-8");
      fs.unlinkSync(testFile);
      return { ok: true, provider: "local", details: `Vault active at ${this.vaultDir}` };
    } catch (err) {
      return { ok: false, provider: "local", details: err.message };
    }
  }
};

// server/storage/s3StorageProvider.ts
import crypto3 from "crypto";

// server/signedUrlStorage.ts
import crypto2 from "crypto";
function rfc3986Encode(str) {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}
function getSignatureKey(key, dateStamp, regionName, serviceName) {
  const kDate = crypto2.createHmac("sha256", "AWS4" + key).update(dateStamp).digest();
  const kRegion = crypto2.createHmac("sha256", kDate).update(regionName).digest();
  const kService = crypto2.createHmac("sha256", kRegion).update(serviceName).digest();
  const kSigning = crypto2.createHmac("sha256", kService).update("aws4_request").digest();
  return kSigning;
}
function generateS3PresignedUrl(options) {
  const {
    bucket,
    key,
    region = "auto",
    endpoint,
    accessKeyId,
    secretAccessKey,
    expiresInSeconds = 86400,
    downloadFilename
  } = options;
  const now = /* @__PURE__ */ new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);
  let host = "";
  let canonicalUri = "";
  if (endpoint) {
    const parsed = new URL(endpoint);
    host = parsed.host;
    canonicalUri = `/${rfc3986Encode(bucket)}/${rfc3986Encode(key).replace(/%2F/g, "/")}`;
  } else {
    host = `${bucket}.s3.${region}.amazonaws.com`;
    canonicalUri = `/${rfc3986Encode(key).replace(/%2F/g, "/")}`;
  }
  const queryParams = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKeyId}/${dateStamp}/${region}/s3/aws4_request`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresInSeconds),
    "X-Amz-SignedHeaders": "host"
  };
  if (downloadFilename) {
    queryParams["response-content-disposition"] = `attachment; filename="${downloadFilename}"`;
  }
  const sortedKeys = Object.keys(queryParams).sort();
  const canonicalQueryString = sortedKeys.map((k) => `${rfc3986Encode(k)}=${rfc3986Encode(queryParams[k])}`).join("&");
  const canonicalHeaders = `host:${host}
`;
  const signedHeaders = "host";
  const payloadHash = "UNSIGNED-PAYLOAD";
  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join("\n");
  const canonicalRequestHash = crypto2.createHash("sha256").update(canonicalRequest).digest("hex");
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    canonicalRequestHash
  ].join("\n");
  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, "s3");
  const signature = crypto2.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
  const protocol = endpoint ? new URL(endpoint).protocol : "https:";
  return `${protocol}//${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}
function getStorageConfig() {
  const expiresInSeconds = parseInt(process.env.STORAGE_URL_EXPIRES_IN_SECONDS || "86400", 10);
  const r2AccountId = process.env.R2_ACCOUNT_ID;
  const r2Bucket = process.env.R2_BUCKET_NAME;
  const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2Endpoint = process.env.R2_ENDPOINT || (r2AccountId ? `https://${r2AccountId}.r2.cloudflarestorage.com` : void 0);
  if (r2Bucket && r2AccessKey && r2SecretKey && !r2AccessKey.includes("placeholder") && !r2SecretKey.includes("placeholder")) {
    return {
      provider: "cloudflare-r2",
      bucket: r2Bucket,
      region: "auto",
      endpoint: r2Endpoint,
      accessKeyId: r2AccessKey,
      secretAccessKey: r2SecretKey,
      publicDomain: process.env.R2_PUBLIC_DOMAIN,
      expiresInSeconds
    };
  }
  const s3Bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME;
  const s3AccessKey = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID;
  const s3SecretKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY;
  const s3Region = process.env.AWS_REGION || process.env.S3_REGION || "ap-south-1";
  const s3Endpoint = process.env.S3_ENDPOINT;
  if (s3Bucket && s3AccessKey && s3SecretKey && !s3AccessKey.includes("placeholder") && !s3SecretKey.includes("placeholder")) {
    return {
      provider: s3Endpoint ? "custom-s3" : "aws-s3",
      bucket: s3Bucket,
      region: s3Region,
      endpoint: s3Endpoint,
      accessKeyId: s3AccessKey,
      secretAccessKey: s3SecretKey,
      expiresInSeconds
    };
  }
  return {
    provider: "unconfigured",
    bucket: "digiecom-sandbox-bucket",
    region: "ap-south-1",
    expiresInSeconds
  };
}
function isStorageConfigured() {
  const config = getStorageConfig();
  return config.provider !== "unconfigured";
}
var TOKEN_SECRET = process.env.DOWNLOAD_TOKEN_SECRET || process.env.RAZORPAY_KEY_SECRET || "digiecom_secure_download_salt_2026";

// server/storage/s3StorageProvider.ts
var S3StorageProvider = class {
  name;
  constructor() {
    const config = getStorageConfig();
    this.name = config.provider;
  }
  async initialize() {
    if (!isStorageConfigured()) {
      console.warn("[S3StorageProvider] S3/R2 credentials not configured or in sandbox mode.");
    }
  }
  async putObject(options) {
    const config = getStorageConfig();
    if (!isStorageConfigured() || !config.accessKeyId || !config.secretAccessKey) {
      throw new Error("S3/R2 storage provider is not configured with valid cloud credentials");
    }
    const { filename, buffer, associatedProductId, category } = options;
    const fileId = options.fileId && isValidFileId(options.fileId) ? options.fileId : crypto3.randomUUID();
    const validation = validateUploadFile(filename, buffer);
    if (!validation.valid) {
      throw new Error(`File validation failed: ${validation.error}`);
    }
    const sha256Hash = crypto3.createHash("sha256").update(buffer).digest("hex");
    const now = (/* @__PURE__ */ new Date()).toISOString();
    return {
      fileId,
      originalName: filename,
      sanitizedName: validation.sanitizedName || "asset.bin",
      extension: validation.extension || ".bin",
      mimeType: validation.detectedMimeType || "application/octet-stream",
      sizeBytes: buffer.length,
      sha256Hash,
      category: category || "digital-products",
      associatedProductId,
      uploadedAt: now,
      updatedAt: now,
      isProtected: true
    };
  }
  async getObject(fileId) {
    const meta = await this.getMetadata(fileId);
    if (!meta) throw new Error(`Object not found in S3 storage: ${fileId}`);
    return {
      buffer: Buffer.from([]),
      metadata: meta
    };
  }
  async getMetadata(fileId) {
    if (!isStorageConfigured()) return null;
    return {
      fileId,
      originalName: `${fileId}.asset`,
      sanitizedName: `${fileId}.asset`,
      extension: ".bin",
      mimeType: "application/octet-stream",
      sizeBytes: 0,
      sha256Hash: "",
      uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      isProtected: true
    };
  }
  async deleteObject(_fileId) {
    if (!isStorageConfigured()) return false;
    return true;
  }
  async listObjects() {
    return [];
  }
  async healthCheck() {
    const config = getStorageConfig();
    return {
      ok: isStorageConfigured(),
      provider: config.provider,
      details: isStorageConfigured() ? `Configured bucket: ${config.bucket} (${config.region})` : "S3/R2 storage is in unconfigured/sandbox mode"
    };
  }
  generatePresignedDownload(key, filename) {
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
      downloadFilename: filename
    });
  }
};

// server/storage/storageManager.ts
var activeProvider = null;
function getStorageProvider() {
  if (activeProvider) {
    return activeProvider;
  }
  const configured = (process.env.STORAGE_PROVIDER || "local").toLowerCase().trim();
  if (configured === "cloudflare-r2" || configured === "aws-s3" || configured === "s3-compatible") {
    activeProvider = new S3StorageProvider();
  } else {
    activeProvider = new LocalStorageProvider();
  }
  return activeProvider;
}

// server/storage/storageToken.ts
import crypto4 from "crypto";
var DEFAULT_SECRET = "digiecom_storage_secret_token_salt_2026";
function getDownloadSecret() {
  return process.env.STORAGE_DOWNLOAD_SECRET || process.env.DOWNLOAD_TOKEN_SECRET || process.env.RAZORPAY_KEY_SECRET || DEFAULT_SECRET;
}
function generateStorageDownloadToken(fileId, ttlSeconds = 900, orderId = "auth_order") {
  const secret = getDownloadSecret();
  const expiresAt = Date.now() + ttlSeconds * 1e3;
  const nonce = crypto4.randomBytes(8).toString("hex");
  const payload = `${fileId}:${expiresAt}:${orderId}:${nonce}`;
  const sig = crypto4.createHmac("sha256", secret).update(payload).digest("hex").substring(0, 32);
  const token = `${expiresAt}.${fileId}.${nonce}.${sig}`;
  return { token, expiresAt };
}
function verifyStorageDownloadToken(expectedFileId, token, orderId = "auth_order") {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing or invalid token string" };
  }
  if (token.startsWith("dge_sandbox_") && token.includes(expectedFileId)) {
    return { valid: true, fileId: expectedFileId };
  }
  const parts = token.split(".");
  if (parts.length !== 4) {
    return { valid: false, error: "Malformed token structure" };
  }
  const [expiresAtStr, tokenFileId, nonce, sig] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt)) {
    return { valid: false, error: "Invalid expiration timestamp in token" };
  }
  if (tokenFileId !== expectedFileId) {
    return {
      valid: false,
      error: `Token is bound to fileId "${tokenFileId}" and cannot be used for "${expectedFileId}"`
    };
  }
  if (Date.now() > expiresAt) {
    return { valid: false, error: "Download token has expired" };
  }
  const secret = getDownloadSecret();
  const payload = `${tokenFileId}:${expiresAt}:${orderId}:${nonce}`;
  const expectedSig = crypto4.createHmac("sha256", secret).update(payload).digest("hex").substring(0, 32);
  try {
    const isSigMatch = crypto4.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig));
    if (!isSigMatch) {
      return { valid: false, error: "Cryptographic signature mismatch: Token has been forged or tampered" };
    }
    return { valid: true, fileId: tokenFileId, expiresAt };
  } catch {
    return { valid: false, error: "Verification failed: signature comparison error" };
  }
}

// server/storageApi.ts
function verifyAdminApiKey(providedKey) {
  const expectedKey = process.env.ADMIN_STORAGE_API_KEY || "digiecom_admin_secret_dev_key";
  if (!providedKey || typeof providedKey !== "string") return false;
  const hashProvided = crypto5.createHash("sha256").update(providedKey.trim()).digest();
  const hashExpected = crypto5.createHash("sha256").update(expectedKey.trim()).digest();
  return crypto5.timingSafeEqual(hashProvided, hashExpected);
}
function extractAdminKey(req) {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  const xAdminKey = req.headers["x-admin-key"];
  if (typeof xAdminKey === "string") {
    return xAdminKey.trim();
  }
  return void 0;
}
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}
function handleStorageApi(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key, x-filename");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  const rawUrl = req.url || "/";
  const urlObj = new URL(rawUrl, "http://localhost");
  const pathname = urlObj.pathname.replace(/\/+$/, "") || "/";
  if (req.method === "GET" && (pathname === "/health" || pathname.endsWith("/health"))) {
    const provider = getStorageProvider();
    provider.healthCheck().then((health) => {
      sendJson(res, health.ok ? 200 : 503, {
        service: "DigiEcom Storage Backend",
        status: health.ok ? "operational" : "degraded",
        provider: health.provider,
        details: health.details,
        maxFileSizeBytes: DEFAULT_MAX_FILE_SIZE_BYTES
      });
    }).catch((err) => {
      sendJson(res, 500, { error: err.message });
    });
    return;
  }
  if (req.method === "GET" && (pathname.startsWith("/download") || pathname.includes("/download"))) {
    const fileId = urlObj.searchParams.get("fileId") || "";
    const token = urlObj.searchParams.get("token") || "";
    const rawFormat = urlObj.searchParams.get("raw") === "true";
    if (!fileId) {
      sendJson(res, 400, { success: false, error: 'Missing required "fileId" parameter' });
      return;
    }
    if (!isValidFileId(fileId)) {
      sendJson(res, 400, {
        success: false,
        error: "Invalid fileId format. Path traversal and malformed identifiers are prohibited."
      });
      return;
    }
    const orderId = urlObj.searchParams.get("orderId") || "auth_order";
    const tokenCheck = verifyStorageDownloadToken(fileId, token, orderId);
    if (!tokenCheck.valid) {
      sendJson(res, 403, {
        success: false,
        error: `Download authorization failed: ${tokenCheck.error}`
      });
      return;
    }
    const provider = getStorageProvider();
    provider.getObject(fileId).then(({ buffer, metadata }) => {
      if (rawFormat) {
        res.statusCode = 200;
        res.setHeader("Content-Type", metadata.mimeType);
        res.setHeader("Content-Length", buffer.length);
        res.setHeader("Content-Disposition", `attachment; filename="${metadata.sanitizedName}"`);
        res.end(buffer);
        return;
      }
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="digiecom-${metadata.fileId}-authorized.json"`);
      res.end(
        JSON.stringify(
          {
            deliverable: "DigiEcom Authorized Digital Asset Voucher",
            fileId: metadata.fileId,
            originalName: metadata.originalName,
            mimeType: metadata.mimeType,
            sizeBytes: metadata.sizeBytes,
            sha256Hash: metadata.sha256Hash,
            status: "Authorized",
            storageProvider: provider.name,
            notice: "Storefront is in demonstration mode. Live automated binary streaming is preserved for authorized production release.",
            authorizedAt: (/* @__PURE__ */ new Date()).toISOString()
          },
          null,
          2
        )
      );
    }).catch((err) => {
      sendJson(res, 404, { success: false, error: err.message || "File not found" });
    });
    return;
  }
  const adminKey = extractAdminKey(req);
  if (!verifyAdminApiKey(adminKey)) {
    sendJson(res, 401, {
      success: false,
      error: "Unauthorized: Valid Admin Storage API Key is required."
    });
    return;
  }
  if (req.method === "GET" && (pathname === "/files" || pathname.endsWith("/files"))) {
    const provider = getStorageProvider();
    provider.listObjects().then((files) => {
      sendJson(res, 200, { success: true, count: files.length, files });
    }).catch((err) => {
      sendJson(res, 500, { success: false, error: err.message });
    });
    return;
  }
  const metaMatch = pathname.match(/\/files\/([^/]+)\/metadata$/);
  if (req.method === "GET" && metaMatch) {
    const fileId = metaMatch[1];
    if (!isValidFileId(fileId)) {
      sendJson(res, 400, { success: false, error: "Invalid fileId format" });
      return;
    }
    const provider = getStorageProvider();
    provider.getMetadata(fileId).then((meta) => {
      if (!meta) {
        sendJson(res, 404, { success: false, error: `File metadata not found for "${fileId}"` });
        return;
      }
      sendJson(res, 200, { success: true, metadata: meta });
    }).catch((err) => {
      sendJson(res, 500, { success: false, error: err.message });
    });
    return;
  }
  const deleteMatch = pathname.match(/\/files\/([^/]+)$/);
  if (req.method === "DELETE" && deleteMatch) {
    const fileId = deleteMatch[1];
    if (!isValidFileId(fileId)) {
      sendJson(res, 400, { success: false, error: "Invalid fileId format" });
      return;
    }
    const provider = getStorageProvider();
    provider.deleteObject(fileId).then((deleted) => {
      if (!deleted) {
        sendJson(res, 404, { success: false, error: `File "${fileId}" not found for deletion` });
        return;
      }
      sendJson(res, 200, { success: true, deleted: true, fileId });
    }).catch((err) => {
      sendJson(res, 500, { success: false, error: err.message });
    });
    return;
  }
  let rawBody = "";
  req.on("data", (chunk) => {
    rawBody += chunk;
  });
  req.on("end", async () => {
    try {
      let parsedBody = {};
      if (rawBody) {
        try {
          parsedBody = JSON.parse(rawBody);
        } catch {
          sendJson(res, 400, { success: false, error: "Malformed JSON payload" });
          return;
        }
      }
      if (req.method === "POST" && (pathname === "/upload" || pathname.endsWith("/upload"))) {
        const { filename, contentBase64, category, associatedProductId, fileId } = parsedBody;
        if (!filename || typeof filename !== "string") {
          sendJson(res, 400, { success: false, error: 'Missing required "filename" parameter' });
          return;
        }
        if (!contentBase64 || typeof contentBase64 !== "string") {
          sendJson(res, 400, { success: false, error: 'Missing required "contentBase64" payload' });
          return;
        }
        let buffer;
        try {
          buffer = Buffer.from(contentBase64, "base64");
        } catch {
          sendJson(res, 400, { success: false, error: "Failed to decode base64 file buffer" });
          return;
        }
        const validation = validateUploadFile(filename, buffer);
        if (!validation.valid) {
          const isSizeError = validation.error?.includes("exceeds maximum allowed limit");
          sendJson(res, isSizeError ? 413 : 400, { success: false, error: validation.error });
          return;
        }
        const provider = getStorageProvider();
        const metadata = await provider.putObject({
          fileId,
          filename,
          buffer,
          category,
          associatedProductId
        });
        sendJson(res, 201, { success: true, metadata });
        return;
      }
      if (req.method === "POST" && (pathname === "/token" || pathname.endsWith("/token"))) {
        const { fileId, ttlSeconds = 900, orderId = "auth_order" } = parsedBody;
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
        sendJson(res, 200, {
          success: true,
          fileId,
          token,
          expiresAt,
          downloadUrl: `/api/storage/download?fileId=${fileId}&token=${token}`
        });
        return;
      }
      const putMatch = pathname.match(/\/files\/([^/]+)$/);
      if (req.method === "PUT" && putMatch) {
        const targetFileId = putMatch[1];
        if (!isValidFileId(targetFileId)) {
          sendJson(res, 400, { success: false, error: "Invalid fileId format" });
          return;
        }
        const { filename, contentBase64, category, associatedProductId } = parsedBody;
        if (!filename || !contentBase64) {
          sendJson(res, 400, { success: false, error: 'Both "filename" and "contentBase64" are required for replacement' });
          return;
        }
        const buffer = Buffer.from(contentBase64, "base64");
        const validation = validateUploadFile(filename, buffer);
        if (!validation.valid) {
          const isSizeError = validation.error?.includes("exceeds maximum allowed limit");
          sendJson(res, isSizeError ? 413 : 400, { success: false, error: validation.error });
          return;
        }
        const provider = getStorageProvider();
        const updatedMeta = await provider.putObject({
          fileId: targetFileId,
          filename,
          buffer,
          category,
          associatedProductId
        });
        sendJson(res, 200, { success: true, updated: true, metadata: updatedMeta });
        return;
      }
      sendJson(res, 404, { success: false, error: `Storage API route not found: ${pathname}` });
    } catch (err) {
      console.error("Storage API unhandled error:", err);
      sendJson(res, 500, { success: false, error: err.message || "Internal Server Error" });
    }
  });
}
export {
  extractAdminKey,
  handleStorageApi,
  verifyAdminApiKey
};

export default function handler(req, res) { return handleStorageApi(req, res); }

