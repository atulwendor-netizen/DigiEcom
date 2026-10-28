import path from 'path';

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
  extension?: string;
  detectedMimeType?: string;
}

export const DEFAULT_MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_EXTENSIONS = new Set([
  '.pdf',
  '.epub',
  '.zip',
  '.fig',
  '.xlsx',
  '.json',
  '.md',
  '.png',
]);

export const DISALLOWED_EXTENSIONS = new Set([
  '.exe',
  '.bat',
  '.cmd',
  '.sh',
  '.php',
  '.py',
  '.js',
  '.ts',
  '.html',
  '.htm',
  '.vbs',
  '.msi',
  '.dll',
  '.so',
  '.com',
  '.scr',
]);

const MIME_MAP: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.epub': 'application/epub+zip',
  '.zip': 'application/zip',
  '.fig': 'application/octet-stream',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.json': 'application/json',
  '.md': 'text/markdown',
  '.png': 'image/png',
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates a file ID to ensure it is a valid UUIDv4 and cannot cause path traversal.
 */
export function isValidFileId(fileId: string): boolean {
  if (!fileId || typeof fileId !== 'string') return false;
  return UUID_REGEX.test(fileId.trim());
}

/**
 * Sanitizes a filename, stripping directory path segments and invalid characters.
 */
export function sanitizeFilename(rawFilename: string): string {
  if (!rawFilename) return 'unnamed_asset.bin';
  // Strip any directory traversal components
  const base = path.basename(rawFilename);
  // Remove dangerous control characters and spaces
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_');
  return cleaned || 'unnamed_asset.bin';
}

/**
 * Verifies magic bytes / file signatures to prevent disguised executables or corrupt files.
 */
export function verifyMagicBytes(buffer: Buffer, ext: string): { valid: boolean; error?: string } {
  if (buffer.length < 4) {
    return { valid: false, error: 'File is too small or empty to verify file signature' };
  }

  // 1. PDF signature: starts with %PDF- (0x25 0x50 0x44 0x46)
  if (ext === '.pdf') {
    const isPdf =
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46;
    if (!isPdf) {
      return { valid: false, error: 'Invalid PDF file: Missing %PDF- signature header' };
    }
    return { valid: true };
  }

  // 2. ZIP / EPUB / XLSX / Figma: PK header (0x50 0x4B 0x03 0x04)
  if (ext === '.zip' || ext === '.epub' || ext === '.xlsx' || ext === '.fig') {
    // Note: Some fig files might be raw binary; if it's zip-based or raw, check for PK
    const isZip =
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
      (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08);

    // .fig can also begin with 'fig-kiwi' header (0x66 0x69 0x67 0x2d)
    const isFigKiwi =
      ext === '.fig' &&
      buffer[0] === 0x66 &&
      buffer[1] === 0x69 &&
      buffer[2] === 0x67 &&
      buffer[3] === 0x2d;

    if (!isZip && !isFigKiwi) {
      return { valid: false, error: `Invalid ${ext.toUpperCase()} file: Expected valid archive / binary container signature` };
    }
    return { valid: true };
  }

  // 3. PNG signature (0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A)
  if (ext === '.png') {
    const isPng =
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a;
    if (!isPng) {
      return { valid: false, error: 'Invalid PNG file: Missing PNG signature header' };
    }
    return { valid: true };
  }

  // 4. JSON: Valid parseable JSON structure
  if (ext === '.json') {
    try {
      const text = buffer.toString('utf8');
      JSON.parse(text);
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid JSON file: Content is not parseable JSON' };
    }
  }

  // 5. Markdown: Valid UTF-8 text without embedded script exploits
  if (ext === '.md') {
    const text = buffer.toString('utf8');
    if (/<script\b[^>]*>/i.test(text)) {
      return { valid: false, error: 'Malicious Markdown content: Embedded <script> tags detected' };
    }
    return { valid: true };
  }

  return { valid: true };
}

/**
 * Full file validation before ingestion.
 */
export function validateUploadFile(
  filename: string,
  buffer: Buffer,
  maxSizeBytes: number = DEFAULT_MAX_FILE_SIZE_BYTES,
  clientMimeType?: string
): FileValidationResult {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, error: 'Filename is required' };
  }

  // Check path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return { valid: false, error: 'Path traversal characters are prohibited in filename' };
  }

  const sanitized = sanitizeFilename(filename);
  const ext = path.extname(sanitized).toLowerCase();

  if (!ext) {
    return { valid: false, error: 'File must have an explicit extension' };
  }

  if (DISALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Executable or script extension ${ext} is strictly prohibited` };
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Extension ${ext} is not allowed. Supported formats: ${Array.from(ALLOWED_EXTENSIONS).join(', ')}`,
    };
  }

  // Check file size
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: 'File buffer cannot be empty' };
  }

  if (buffer.length > maxSizeBytes) {
    return {
      valid: false,
      error: `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum allowed limit (${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB)`,
    };
  }

  // Check magic bytes
  const magicCheck = verifyMagicBytes(buffer, ext);
  if (!magicCheck.valid) {
    return { valid: false, error: magicCheck.error };
  }

  const expectedMime = MIME_MAP[ext] || clientMimeType || 'application/octet-stream';

  return {
    valid: true,
    sanitizedName: sanitized,
    extension: ext,
    detectedMimeType: expectedMime,
  };
}
