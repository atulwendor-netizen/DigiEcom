// server/productsApi.ts
import { parse as parseUrl } from "url";
import crypto4 from "crypto";

// server/products/productDb.ts
import fs from "fs";
import path from "path";
var LocalFileDatabaseProvider = class {
  name = "local-file";
  dbFilePath;
  isInitialized = false;
  cache = [];
  constructor(customPath) {
    if (customPath) {
      this.dbFilePath = customPath;
    } else {
      const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      const baseDir = isVercel ? "/tmp/.storage_vault" : path.resolve(process.cwd(), ".storage_vault");
      this.dbFilePath = path.join(baseDir, "db", "products.json");
    }
  }
  async initialize() {
    if (this.isInitialized) return;
    const dir = path.dirname(this.dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(this.dbFilePath)) {
      try {
        const raw = fs.readFileSync(this.dbFilePath, "utf8");
        this.cache = JSON.parse(raw);
      } catch {
        this.cache = [];
      }
    } else {
      this.cache = this.loadSeedProducts();
      this.persist();
    }
    this.isInitialized = true;
  }
  loadSeedProducts() {
    const seedCandidates = [
      path.resolve(process.cwd(), "src/data/products.json"),
      path.resolve(process.cwd(), "dist/src/data/products.json"),
      path.resolve(__dirname, "../../src/data/products.json")
    ];
    for (const cand of seedCandidates) {
      if (fs.existsSync(cand)) {
        try {
          const raw = fs.readFileSync(cand, "utf8");
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((p) => ({
              ...p,
              status: p.status || "published",
              createdAt: p.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
              updatedAt: p.updatedAt || (/* @__PURE__ */ new Date()).toISOString()
            }));
          }
        } catch {
        }
      }
    }
    return [];
  }
  persist() {
    const dir = path.dirname(this.dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.dbFilePath, JSON.stringify(this.cache, null, 2), "utf8");
  }
  async getAll(params) {
    await this.initialize();
    let result = [...this.cache];
    if (params?.status && params.status !== "all") {
      result = result.filter((p) => p.status === params.status);
    }
    if (params?.category) {
      result = result.filter((p) => p.category.toLowerCase() === params.category.toLowerCase());
    }
    if (params?.isFeatured !== void 0) {
      result = result.filter((p) => Boolean(p.isFeatured) === params.isFeatured);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    const total = result.length;
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      result = result.slice(start, start + params.limit);
    }
    return { products: result, total };
  }
  async getById(id) {
    await this.initialize();
    const found = this.cache.find((p) => p.id === id);
    return found ? { ...found } : null;
  }
  async getBySlug(slug) {
    await this.initialize();
    const found = this.cache.find((p) => p.slug === slug);
    return found ? { ...found } : null;
  }
  async create(product) {
    await this.initialize();
    this.cache.unshift(product);
    this.persist();
    return { ...product };
  }
  async update(id, updates) {
    await this.initialize();
    const index = this.cache.findIndex((p) => p.id === id);
    if (index === -1) return null;
    const updated = {
      ...this.cache[index],
      ...updates,
      id,
      // Immutable ID
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.cache[index] = updated;
    this.persist();
    return { ...updated };
  }
  async delete(id) {
    await this.initialize();
    const initialLen = this.cache.length;
    this.cache = this.cache.filter((p) => p.id !== id);
    if (this.cache.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }
};
var activeProductDb = null;
function getProductDatabase() {
  if (activeProductDb) return activeProductDb;
  activeProductDb = new LocalFileDatabaseProvider();
  return activeProductDb;
}

// server/storage/localStorageProvider.ts
import fs2 from "fs";
import path3 from "path";
import crypto from "crypto";

// server/storage/storageValidator.ts
import path2 from "path";
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
  const base = path2.basename(rawFilename);
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
  const ext = path2.extname(sanitized).toLowerCase();
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
    const defaultDir = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? "/tmp/.storage_vault" : path3.resolve(process.cwd(), ".storage_vault");
    this.vaultDir = vaultDir || process.env.LOCAL_STORAGE_DIR || defaultDir;
    this.blobsDir = path3.resolve(this.vaultDir, "blobs");
    this.metaDir = path3.resolve(this.vaultDir, "meta");
  }
  /**
   * Initializes vault directories outside public web root.
   */
  async initialize() {
    if (this.isInitialized) return;
    try {
      if (!fs2.existsSync(this.vaultDir)) {
        fs2.mkdirSync(this.vaultDir, { recursive: true });
      }
      if (!fs2.existsSync(this.blobsDir)) {
        fs2.mkdirSync(this.blobsDir, { recursive: true });
      }
      if (!fs2.existsSync(this.metaDir)) {
        fs2.mkdirSync(this.metaDir, { recursive: true });
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
    const resolved = path3.resolve(this.blobsDir, `${fileId}.bin`);
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
    const resolved = path3.resolve(this.metaDir, `${fileId}.json`);
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
      fs2.writeFileSync(tmpBlobPath, buffer);
      fs2.renameSync(tmpBlobPath, blobPath);
      fs2.writeFileSync(metaPath, JSON.stringify(metadata, null, 2), "utf-8");
      return metadata;
    } catch (err) {
      if (fs2.existsSync(tmpBlobPath)) {
        try {
          fs2.unlinkSync(tmpBlobPath);
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
    if (!fs2.existsSync(blobPath)) {
      throw new Error(`Binary object data missing for fileId "${fileId}"`);
    }
    const buffer = fs2.readFileSync(blobPath);
    return { buffer, metadata: meta };
  }
  /**
   * Reads metadata separately from file content (fast, low memory footprint).
   */
  async getMetadata(fileId) {
    await this.initialize();
    try {
      const metaPath = this.getMetaPath(fileId);
      if (!fs2.existsSync(metaPath)) return null;
      const raw = fs2.readFileSync(metaPath, "utf-8");
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
      if (fs2.existsSync(blobPath)) {
        fs2.unlinkSync(blobPath);
        deleted = true;
      }
      if (fs2.existsSync(metaPath)) {
        fs2.unlinkSync(metaPath);
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
      const files = fs2.readdirSync(this.metaDir);
      const results = [];
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        try {
          const raw = fs2.readFileSync(path3.resolve(this.metaDir, file), "utf-8");
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
      const testFile = path3.resolve(this.vaultDir, ".health_check.tmp");
      fs2.writeFileSync(testFile, "ok", "utf-8");
      fs2.unlinkSync(testFile);
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

// server/productsApi.ts
function getExpectedAdminKey() {
  return process.env.ADMIN_STORAGE_API_KEY || null;
}
function verifyAdminApiKey(candidateKey) {
  const expectedKey = getExpectedAdminKey();
  if (!expectedKey || !candidateKey) return false;
  const expectedBuffer = Buffer.from(expectedKey, "utf8");
  const candidateBuffer = Buffer.from(candidateKey, "utf8");
  if (expectedBuffer.length !== candidateBuffer.length) {
    return false;
  }
  return crypto4.timingSafeEqual(expectedBuffer, candidateBuffer);
}
function extractAdminKey(req) {
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  const customHeader = req.headers["x-admin-key"];
  if (typeof customHeader === "string" && customHeader) {
    return customHeader.trim();
  }
  return null;
}
function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.end(JSON.stringify(data));
}
function sanitizeSlug(input) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function getCategoryLabel(category) {
  switch (category.toLowerCase()) {
    case "ebooks-guides":
      return "E-books & Guides";
    case "templates":
      return "Templates & Kits";
    case "presets":
      return "Audio & Presets";
    case "code-snippets":
      return "Code & Components";
    default:
      return category.charAt(0).toUpperCase() + category.slice(1);
  }
}
function getDefaultGradient(visualType) {
  switch (visualType) {
    case "blueprint":
      return "linear-gradient(135deg, #091e3a 0%, #173b75 100%)";
    case "audio":
      return "linear-gradient(135deg, #2b0b3a 0%, #5c187d 100%)";
    case "component":
      return "linear-gradient(135deg, #0c2a26 0%, #155c52 100%)";
    case "playbook":
    default:
      return "linear-gradient(135deg, #1e1035 0%, #3b1d6e 100%)";
  }
}
function handleProductsApi(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-key");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.end();
    return;
  }
  const parsedUrl = parseUrl(req.url || "", true);
  let pathname = parsedUrl.pathname || "/";
  if (pathname.startsWith("/api/products")) {
    pathname = pathname.substring("/api/products".length);
  }
  if (!pathname.startsWith("/")) {
    pathname = "/" + pathname;
  }
  const db = getProductDatabase();
  const candidateAdminKey = extractAdminKey(req);
  const isAdmin = verifyAdminApiKey(candidateAdminKey);
  if (req.method === "GET" && (pathname === "/" || pathname === "")) {
    const category = parsedUrl.query.category;
    const search = parsedUrl.query.search;
    const isFeatured = parsedUrl.query.featured === "true" ? true : void 0;
    const page = parsedUrl.query.page ? parseInt(parsedUrl.query.page, 10) : void 0;
    const limit = parsedUrl.query.limit ? parseInt(parsedUrl.query.limit, 10) : void 0;
    let statusFilter = "published";
    if (isAdmin && parsedUrl.query.status) {
      statusFilter = parsedUrl.query.status;
    }
    db.getAll({
      status: statusFilter,
      category,
      search,
      isFeatured,
      page,
      limit
    }).then(({ products, total }) => {
      sendJson(res, 200, {
        success: true,
        count: products.length,
        total,
        page: page || 1,
        limit: limit || total,
        products
      });
    }).catch((err) => {
      sendJson(res, 500, { success: false, error: err.message });
    });
    return;
  }
  if (req.method === "POST" && pathname === "/upload-attachment") {
    if (!isAdmin) {
      sendJson(res, 401, {
        success: false,
        error: "Unauthorized: Valid Admin Storage API Key is required."
      });
      return;
    }
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });
    req.on("end", () => {
      try {
        const body = JSON.parse(rawBody || "{}");
        const { filename, fileBase64, mimeType, productId } = body;
        if (!filename || typeof filename !== "string") {
          sendJson(res, 400, { success: false, error: 'Missing or invalid "filename" field.' });
          return;
        }
        if (!fileBase64 || typeof fileBase64 !== "string") {
          sendJson(res, 400, { success: false, error: 'Missing or invalid "fileBase64" field.' });
          return;
        }
        const buffer = Buffer.from(fileBase64, "base64");
        const validation = validateUploadFile(filename, buffer, mimeType);
        if (!validation.valid) {
          sendJson(res, 400, {
            success: false,
            error: validation.error || "File validation failed."
          });
          return;
        }
        const storage = getStorageProvider();
        storage.putObject({
          filename: validation.sanitizedName || filename,
          mimeType: validation.detectedMimeType || mimeType || "application/octet-stream",
          buffer,
          associatedProductId: productId
        }).then(async (metadata) => {
          if (productId) {
            await db.update(productId, {
              attachedFileId: metadata.fileId,
              attachedFileName: metadata.originalName,
              attachedFileSize: metadata.sizeBytes,
              attachedFileMime: metadata.mimeType
            });
          }
          sendJson(res, 201, {
            success: true,
            fileId: metadata.fileId,
            originalName: metadata.originalName,
            sizeBytes: metadata.sizeBytes,
            mimeType: metadata.mimeType,
            sha256Hash: metadata.sha256Hash
          });
        }).catch((err) => {
          sendJson(res, 500, { success: false, error: err.message });
        });
      } catch (err) {
        sendJson(res, 400, { success: false, error: "Malformed JSON payload: " + err.message });
      }
    });
    return;
  }
  if (req.method === "POST" && (pathname === "/" || pathname === "")) {
    if (!isAdmin) {
      sendJson(res, 401, {
        success: false,
        error: "Unauthorized: Valid Admin Storage API Key is required."
      });
      return;
    }
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });
    req.on("end", async () => {
      try {
        const body = JSON.parse(rawBody || "{}");
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
          attachedFileMime
        } = body;
        if (!name || typeof name !== "string" || !name.trim()) {
          sendJson(res, 400, { success: false, error: 'Product "name" is required.' });
          return;
        }
        if (pricePaise === void 0 || typeof pricePaise !== "number" || pricePaise < 0) {
          sendJson(res, 400, { success: false, error: 'Valid positive "pricePaise" is required.' });
          return;
        }
        if (!category || typeof category !== "string") {
          sendJson(res, 400, { success: false, error: 'Product "category" is required.' });
          return;
        }
        if (!shortDescription || typeof shortDescription !== "string") {
          sendJson(res, 400, { success: false, error: 'Product "shortDescription" is required.' });
          return;
        }
        const uniqueSuffix = Math.random().toString(36).substring(2, 6);
        const serverId = `de-prod-${Date.now().toString(36).substring(3)}-${uniqueSuffix}`;
        let finalSlug = body.slug ? sanitizeSlug(body.slug) : sanitizeSlug(name);
        if (!finalSlug) finalSlug = `product-${uniqueSuffix}`;
        const existing = await db.getBySlug(finalSlug);
        if (existing) {
          finalSlug = `${finalSlug}-${uniqueSuffix}`;
        }
        const visual = coverVisualType || "playbook";
        const newProduct = {
          id: serverId,
          slug: finalSlug,
          name: name.trim(),
          category: category.trim(),
          categoryLabel: body.categoryLabel || getCategoryLabel(category),
          shortDescription: shortDescription.trim(),
          fullDescription: (fullDescription || shortDescription).trim(),
          pricePaise: Math.round(pricePaise),
          currency: "INR",
          coverVisualType: visual,
          coverGradient: body.coverGradient || getDefaultGradient(visual),
          gallery: Array.isArray(body.gallery) ? body.gallery : ["Overview", "Details"],
          fileFormats: Array.isArray(fileFormats) && fileFormats.length > 0 ? fileFormats : [".pdf"],
          compatibility: body.compatibility || "Compatible with all modern operating systems.",
          contents: Array.isArray(contents) && contents.length > 0 ? contents : [name.trim()],
          licenseType: licenseType || "Personal & Commercial Reading License",
          deliveryMethod: "Instant secure digital download after verification",
          status: status === "draft" || status === "unpublished" ? status : "published",
          isFeatured: Boolean(isFeatured),
          tags: Array.isArray(tags) ? tags : [category],
          faqs: Array.isArray(faqs) ? faqs : [],
          isDemoContent: true,
          demoNotice: "Demonstration catalogue item \u2014 checkout and file delivery are disabled in this storefront preview.",
          attachedFileId,
          attachedFileName,
          attachedFileSize,
          attachedFileMime,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const created = await db.create(newProduct);
        sendJson(res, 201, { success: true, product: created });
      } catch (err) {
        sendJson(res, 400, { success: false, error: "Malformed JSON payload: " + err.message });
      }
    });
    return;
  }
  const statusMatch = pathname.match(/^\/([^/]+)\/status$/);
  if (req.method === "PATCH" && statusMatch) {
    if (!isAdmin) {
      sendJson(res, 401, {
        success: false,
        error: "Unauthorized: Valid Admin Storage API Key is required."
      });
      return;
    }
    const productId = statusMatch[1];
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });
    req.on("end", async () => {
      try {
        const body = JSON.parse(rawBody || "{}");
        const newStatus = body.status;
        if (!newStatus || !["draft", "published", "unpublished"].includes(newStatus)) {
          sendJson(res, 400, {
            success: false,
            error: 'Invalid status. Must be "draft", "published", or "unpublished".'
          });
          return;
        }
        const updated = await db.update(productId, { status: newStatus });
        if (!updated) {
          sendJson(res, 404, { success: false, error: `Product "${productId}" not found.` });
          return;
        }
        sendJson(res, 200, { success: true, id: productId, status: newStatus, product: updated });
      } catch (err) {
        sendJson(res, 400, { success: false, error: "Malformed JSON: " + err.message });
      }
    });
    return;
  }
  const singleMatch = pathname.match(/^\/([^/]+)$/);
  if (req.method === "GET" && singleMatch) {
    const idOrSlug = singleMatch[1];
    const findProduct = async () => {
      let product = await db.getById(idOrSlug);
      if (!product) {
        product = await db.getBySlug(idOrSlug);
      }
      return product;
    };
    findProduct().then((product) => {
      if (!product) {
        sendJson(res, 404, { success: false, error: `Product "${idOrSlug}" not found.` });
        return;
      }
      if (!isAdmin && product.status !== "published") {
        sendJson(res, 404, { success: false, error: `Product "${idOrSlug}" not found.` });
        return;
      }
      sendJson(res, 200, { success: true, product });
    }).catch((err) => {
      sendJson(res, 500, { success: false, error: err.message });
    });
    return;
  }
  if (req.method === "PUT" && singleMatch) {
    if (!isAdmin) {
      sendJson(res, 401, {
        success: false,
        error: "Unauthorized: Valid Admin Storage API Key is required."
      });
      return;
    }
    const productId = singleMatch[1];
    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });
    req.on("end", async () => {
      try {
        const updates = JSON.parse(rawBody || "{}");
        delete updates.id;
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
      } catch (err) {
        sendJson(res, 400, { success: false, error: "Malformed JSON: " + err.message });
      }
    });
    return;
  }
  if (req.method === "DELETE" && singleMatch) {
    if (!isAdmin) {
      sendJson(res, 401, {
        success: false,
        error: "Unauthorized: Valid Admin Storage API Key is required."
      });
      return;
    }
    const productId = singleMatch[1];
    db.delete(productId).then((deleted) => {
      if (!deleted) {
        sendJson(res, 404, { success: false, error: `Product "${productId}" not found.` });
        return;
      }
      sendJson(res, 200, { success: true, deleted: true, id: productId });
    }).catch((err) => {
      sendJson(res, 500, { success: false, error: err.message });
    });
    return;
  }
  sendJson(res, 404, { success: false, error: "Endpoint not found" });
}
export {
  getCategoryLabel,
  getDefaultGradient,
  handleProductsApi,
  sanitizeSlug
};

export default function handler(req, res) { return handleProductsApi(req, res); }

