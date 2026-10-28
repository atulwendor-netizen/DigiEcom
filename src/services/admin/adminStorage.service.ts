export interface AdminStorageStats {
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeFormatted: string;
  provider: string;
  isDurable: boolean;
  maxFileSizeBytes: number;
  byCategory: Record<string, { count: number; bytes: number }>;
  byFormat: Record<string, { count: number; bytes: number }>;
  updatedAt: string;
}

export interface AdminStoredFile {
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

export interface AdminActivityLogItem {
  id: string;
  timestamp: string;
  action: string;
  fileId?: string;
  filename?: string;
  details: string;
  status: 'success' | 'failed';
}

const ADMIN_SESSION_STORAGE_KEY = 'digiecom_admin_api_key_v1';

export class AdminStorageService {
  /**
   * Retrieves the current session-stored Admin API key.
   */
  public static getStoredAdminKey(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      return (
        sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) ||
        localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) ||
        sessionStorage.getItem('digiecom_admin_storage_key') ||
        localStorage.getItem('digiecom_admin_storage_key') ||
        null
      );
    } catch {
      return null;
    }
  }

  /**
   * Sets the verified Admin API key into sessionStorage & localStorage.
   */
  public static setStoredAdminKey(key: string): void {
    if (typeof window === 'undefined') return;
    const cleanKey = key.trim();
    try {
      sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, cleanKey);
      sessionStorage.setItem('digiecom_admin_storage_key', cleanKey);
      localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, cleanKey);
      localStorage.setItem('digiecom_admin_storage_key', cleanKey);
    } catch (e) {
      console.warn('Failed saving admin key in storage:', e);
    }
  }

  /**
   * Clears the Admin API key (Sign out).
   */
  public static clearStoredAdminKey(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      sessionStorage.removeItem('digiecom_admin_storage_key');
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
      localStorage.removeItem('digiecom_admin_storage_key');
    } catch (e) {
      console.warn('Failed removing admin key from storage:', e);
    }
  }

  /**
   * Checks whether an admin key is present in session storage.
   */
  public static isAuthenticated(): boolean {
    const key = this.getStoredAdminKey();
    return Boolean(key && key.length > 5);
  }

  /**
   * Helper to construct authenticated headers.
   */
  private static getHeaders(explicitKey?: string): HeadersInit {
    const key = explicitKey || this.getStoredAdminKey() || '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'x-admin-key': key,
    };
  }

  /**
   * Tests and verifies an Admin API Key against the backend.
   */
  public static async verifyAdminKey(
    key: string
  ): Promise<{ success: boolean; valid: boolean; provider?: string; isDurable?: boolean; error?: string }> {
    try {
      const response = await fetch('/api/storage/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: key.trim() }),
      });

      const data = await response.json();
      if (response.ok && data.valid) {
        this.setStoredAdminKey(key);
        return {
          success: true,
          valid: true,
          provider: data.provider,
          isDurable: data.isDurable,
        };
      }

      return {
        success: false,
        valid: false,
        error: data.error || 'Invalid Admin Storage API Key',
      };
    } catch (err: any) {
      return {
        success: false,
        valid: false,
        error: err.message || 'Network error connecting to storage backend',
      };
    }
  }

  /**
   * Fetches aggregate storage metrics.
   */
  public static async getStats(explicitKey?: string): Promise<AdminStorageStats | null> {
    try {
      const response = await fetch('/api/storage/stats', {
        method: 'GET',
        headers: this.getHeaders(explicitKey),
      });

      if (!response.ok) {
        if (response.status === 401) this.clearStoredAdminKey();
        return null;
      }

      const data = await response.json();
      return data.stats || null;
    } catch (err) {
      console.error('Failed fetching admin storage stats:', err);
      return null;
    }
  }

  /**
   * Lists all stored file metadata.
   */
  public static async listFiles(explicitKey?: string): Promise<AdminStoredFile[]> {
    try {
      const response = await fetch('/api/storage/files', {
        method: 'GET',
        headers: this.getHeaders(explicitKey),
      });

      if (!response.ok) {
        if (response.status === 401) this.clearStoredAdminKey();
        return [];
      }

      const data = await response.json();
      return data.files || [];
    } catch (err) {
      console.error('Failed listing admin files:', err);
      return [];
    }
  }

  /**
   * Retrieves specific file metadata.
   */
  public static async getFileMetadata(fileId: string, explicitKey?: string): Promise<AdminStoredFile | null> {
    try {
      const response = await fetch(`/api/storage/files/${encodeURIComponent(fileId)}/metadata`, {
        method: 'GET',
        headers: this.getHeaders(explicitKey),
      });

      if (!response.ok) return null;
      const data = await response.json();
      return data.metadata || null;
    } catch {
      return null;
    }
  }

  /**
   * Uploads a new digital asset.
   */
  public static async uploadFile(
    payload: {
      filename: string;
      contentBase64: string;
      category?: string;
      associatedProductId?: string;
      fileId?: string;
    },
    explicitKey?: string
  ): Promise<{ success: boolean; metadata?: AdminStoredFile; error?: string }> {
    try {
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: this.getHeaders(explicitKey),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Upload failed' };
      }

      return { success: true, metadata: data.metadata };
    } catch (err: any) {
      return { success: false, error: err.message || 'Upload network error' };
    }
  }

  /**
   * Replaces an existing file's contents or metadata.
   */
  public static async replaceFile(
    fileId: string,
    payload: {
      filename: string;
      contentBase64: string;
      category?: string;
      associatedProductId?: string;
    },
    explicitKey?: string
  ): Promise<{ success: boolean; metadata?: AdminStoredFile; error?: string }> {
    try {
      const response = await fetch(`/api/storage/files/${encodeURIComponent(fileId)}`, {
        method: 'PUT',
        headers: this.getHeaders(explicitKey),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Replacement failed' };
      }

      return { success: true, metadata: data.metadata };
    } catch (err: any) {
      return { success: false, error: err.message || 'Replacement network error' };
    }
  }

  /**
   * Deletes a file and its metadata.
   */
  public static async deleteFile(
    fileId: string,
    explicitKey?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`/api/storage/files/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
        headers: this.getHeaders(explicitKey),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Delete failed' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Delete network error' };
    }
  }

  /**
   * Generates a short-lived download token.
   */
  public static async generateDownloadToken(
    fileId: string,
    ttlSeconds: number = 900,
    explicitKey?: string
  ): Promise<{ success: boolean; token?: string; downloadUrl?: string; expiresAt?: number; error?: string }> {
    try {
      const response = await fetch('/api/storage/token', {
        method: 'POST',
        headers: this.getHeaders(explicitKey),
        body: JSON.stringify({ fileId, ttlSeconds }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || 'Token generation failed' };
      }

      return {
        success: true,
        token: data.token,
        downloadUrl: data.downloadUrl,
        expiresAt: data.expiresAt,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Token generation network error' };
    }
  }

  /**
   * Fetches storage activity audit logs.
   */
  public static async getLogs(explicitKey?: string): Promise<AdminActivityLogItem[]> {
    try {
      const response = await fetch('/api/storage/logs', {
        method: 'GET',
        headers: this.getHeaders(explicitKey),
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.logs || [];
    } catch {
      return [];
    }
  }

  /**
   * Fetches storage system health.
   */
  public static async getHealth(): Promise<{ service: string; status: string; provider: string; details?: string }> {
    try {
      const response = await fetch('/api/storage/health');
      return await response.json();
    } catch {
      return { service: 'DigiEcom Storage', status: 'unknown', provider: 'unknown' };
    }
  }
}
