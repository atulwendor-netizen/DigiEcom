import type { StorageProvider } from './storage.types';
import { LocalStorageProvider } from './localStorageProvider';
import { S3StorageProvider } from './s3StorageProvider';

let activeProvider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (activeProvider) {
    return activeProvider;
  }

  const configured = (process.env.STORAGE_PROVIDER || 'local').toLowerCase().trim();

  if (configured === 'cloudflare-r2' || configured === 'aws-s3' || configured === 's3-compatible') {
    activeProvider = new S3StorageProvider();
  } else {
    activeProvider = new LocalStorageProvider();
  }

  return activeProvider;
}

/**
 * Allows overriding or resetting provider (useful for isolated unit testing).
 */
export function setStorageProvider(provider: StorageProvider | null): void {
  activeProvider = provider;
}
