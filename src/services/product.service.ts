import productsSeed from '../data/products.json';
import { AdminStorageService } from './admin/adminStorage.service';

export type ProductStatus = 'draft' | 'published' | 'unpublished';

export interface ManagedProduct {
  id: string;
  slug: string;
  name: string;
  category: 'ebooks-guides' | 'ai-prompts' | 'business-templates' | 'productivity-tools' | 'design-assets' | 'other-downloads' | string;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  pricePaise: number;
  currency: string;
  coverVisualType: 'playbook' | 'blueprint' | 'audio' | 'component' | 'generic' | 'ai' | 'finance' | 'legal' | 'notion' | 'obsidian' | 'design' | 'illustration' | 'dotfiles';
  coverGradient: string;
  gallery?: string[];
  fileFormats: string[];
  compatibility?: string;
  contents: string[];
  licenseType: string;
  deliveryMethod?: string;
  status: ProductStatus;
  isFeatured: boolean;
  tags: string[];
  faqs: Array<{ question: string; answer: string }>;
  isDemoContent?: boolean;
  demoNotice?: string;
  attachedFileId?: string;
  attachedFileName?: string;
  attachedFileSize?: number;
  attachedFileMime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  category: string;
  categoryLabel?: string;
  shortDescription: string;
  fullDescription: string;
  pricePaise: number;
  currency?: string;
  coverVisualType?: 'playbook' | 'blueprint' | 'audio' | 'component' | 'generic' | 'ai' | 'finance' | 'legal' | 'notion' | 'obsidian' | 'design' | 'illustration' | 'dotfiles';
  coverGradient?: string;
  fileFormats?: string[];
  compatibility?: string;
  contents?: string[];
  licenseType?: string;
  status?: ProductStatus;
  isFeatured?: boolean;
  tags?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  attachedFileId?: string;
  attachedFileName?: string;
  attachedFileSize?: number;
  attachedFileMime?: string;
}

const CUSTOM_PRODUCTS_STORAGE_KEY = 'digiecom_custom_products';
const DELETED_PRODUCT_IDS_STORAGE_KEY = 'digiecom_deleted_product_ids';

function getAdminApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return (
    AdminStorageService.getStoredAdminKey() ||
    sessionStorage.getItem('digiecom_admin_api_key_v1') ||
    sessionStorage.getItem('digiecom_admin_storage_key')
  );
}

function getStoredCustomProducts(): ManagedProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredCustomProduct(product: ManagedProduct): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredCustomProducts();
    const index = existing.findIndex((p) => p.id === product.id || p.slug === product.slug);
    if (index >= 0) {
      existing[index] = product;
    } else {
      existing.unshift(product);
    }
    localStorage.setItem(CUSTOM_PRODUCTS_STORAGE_KEY, JSON.stringify(existing));
    removeStoredDeletedId(product.id);
  } catch (err) {
    console.warn('Failed saving custom product to local storage:', err);
  }
}

function removeStoredCustomProduct(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredCustomProducts();
    const filtered = existing.filter((p) => p.id !== id && p.slug !== id);
    localStorage.setItem(CUSTOM_PRODUCTS_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.warn('Failed removing custom product from local storage:', err);
  }
}

function getStoredDeletedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(DELETED_PRODUCT_IDS_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function addStoredDeletedId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const set = getStoredDeletedIds();
    set.add(id);
    localStorage.setItem(DELETED_PRODUCT_IDS_STORAGE_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

function removeStoredDeletedId(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const set = getStoredDeletedIds();
    if (set.has(id)) {
      set.delete(id);
      localStorage.setItem(DELETED_PRODUCT_IDS_STORAGE_KEY, JSON.stringify(Array.from(set)));
    }
  } catch {}
}

function notifyProductsChanged(product?: ManagedProduct): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent('digiecom_products_changed', { detail: product }));
  } catch {}
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const ProductService = {
  /**
   * Synchronously combines seed products with custom stored products for instant zero-flash rendering.
   */
  getInitialPublishedProducts(category?: string, search?: string): ManagedProduct[] {
    const deletedIds = getStoredDeletedIds();
    const custom = getStoredCustomProducts();
    const seed = (productsSeed as any[]).map((p) => ({
      ...p,
      status: (p.status as ProductStatus) || 'published',
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    })) as ManagedProduct[];

    // Merge: custom products take precedence over seed items with the same ID
    const productMap = new Map<string, ManagedProduct>();
    for (const p of seed) {
      if (!deletedIds.has(p.id)) {
        productMap.set(p.id, p);
      }
    }
    for (const p of custom) {
      if (!deletedIds.has(p.id)) {
        productMap.set(p.id, p);
      }
    }

    let list = Array.from(productMap.values()).filter((p) => p.status === 'published');

    if (category && category !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    return list;
  },

  /**
   * Synchronously retrieves a product by slug or id from client memory.
   */
  getInitialProductBySlug(slug: string): ManagedProduct | null {
    const deletedIds = getStoredDeletedIds();
    const custom = getStoredCustomProducts();
    const customMatch = custom.find((p) => (p.slug === slug || p.id === slug) && !deletedIds.has(p.id));
    if (customMatch) return customMatch;

    const seed = (productsSeed as any[]).find(
      (p) => (p.slug === slug || p.id === slug) && !deletedIds.has(p.id)
    );
    if (!seed) return null;

    return {
      ...seed,
      status: (seed.status as ProductStatus) || 'published',
      createdAt: seed.createdAt || new Date().toISOString(),
      updatedAt: seed.updatedAt || new Date().toISOString(),
    } as ManagedProduct;
  },

  /**
   * Public storefront fetch: Retrieves published products from backend API,
   * merged with client storage and seed data.
   */
  async getPublishedProducts(category?: string, search?: string): Promise<ManagedProduct[]> {
    const deletedIds = getStoredDeletedIds();
    const custom = getStoredCustomProducts();

    try {
      const queryParams = new URLSearchParams();
      if (category && category !== 'all') queryParams.set('category', category);
      if (search && search.trim()) queryParams.set('search', search.trim());

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          // Merge API products with locally stored custom products (in case container is fresh)
          const mergedMap = new Map<string, ManagedProduct>();
          for (const p of data.products as ManagedProduct[]) {
            if (!deletedIds.has(p.id)) {
              mergedMap.set(p.id, p);
            }
          }
          for (const p of custom) {
            if (!deletedIds.has(p.id) && p.status === 'published') {
              if (!mergedMap.has(p.id)) {
                mergedMap.set(p.id, p);
              }
            }
          }

          let result = Array.from(mergedMap.values());
          if (category && category !== 'all') {
            result = result.filter((p) => p.category.toLowerCase() === category.toLowerCase());
          }
          if (search && search.trim()) {
            const q = search.toLowerCase().trim();
            result = result.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.shortDescription.toLowerCase().includes(q) ||
                p.tags?.some((t: string) => t.toLowerCase().includes(q))
            );
          }
          return result;
        }
      }
    } catch {
      // API fallback
    }

    return this.getInitialPublishedProducts(category, search);
  },

  /**
   * Public storefront fetch: Retrieves single product by slug or ID with fallback.
   */
  async getProductBySlug(slug: string): Promise<ManagedProduct | null> {
    const deletedIds = getStoredDeletedIds();
    if (deletedIds.has(slug)) return null;

    try {
      const res = await fetch(`/api/products/${slug}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.product && !deletedIds.has(data.product.id)) {
          return data.product;
        }
      }
    } catch {
      // Fallback
    }

    return this.getInitialProductBySlug(slug);
  },

  /**
   * Admin: List all products (including drafts and unpublished) with total count.
   */
  async getAdminProducts(
    status: ProductStatus | 'all' = 'all',
    category?: string,
    search?: string
  ): Promise<{ products: ManagedProduct[]; total: number }> {
    const adminKey = getAdminApiKey();
    const deletedIds = getStoredDeletedIds();
    const custom = getStoredCustomProducts();

    try {
      const queryParams = new URLSearchParams();
      queryParams.set('status', status);
      if (category && category !== 'all') queryParams.set('category', category);
      if (search && search.trim()) queryParams.set('search', search.trim());

      const res = await fetch(`/api/products?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${adminKey}`,
          'x-admin-key': adminKey || '',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          const map = new Map<string, ManagedProduct>();
          for (const p of data.products as ManagedProduct[]) {
            if (!deletedIds.has(p.id)) {
              map.set(p.id, p);
            }
          }
          for (const p of custom) {
            if (!deletedIds.has(p.id)) {
              map.set(p.id, p);
            }
          }

          let list = Array.from(map.values());
          if (status !== 'all') {
            list = list.filter((p) => p.status === status);
          }
          if (category && category !== 'all') {
            list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
          }
          if (search && search.trim()) {
            const q = search.toLowerCase().trim();
            list = list.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.shortDescription.toLowerCase().includes(q) ||
                p.tags?.some((t: string) => t.toLowerCase().includes(q))
            );
          }

          return { products: list, total: list.length };
        }
      }
    } catch {}

    // Fallback if local without API
    const seed = (productsSeed as any[]).map((p) => ({
      ...p,
      status: (p.status as ProductStatus) || 'published',
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    })) as ManagedProduct[];

    const map = new Map<string, ManagedProduct>();
    for (const p of seed) {
      if (!deletedIds.has(p.id)) {
        map.set(p.id, p);
      }
    }
    for (const p of custom) {
      if (!deletedIds.has(p.id)) {
        map.set(p.id, p);
      }
    }

    let list = Array.from(map.values());
    if (status !== 'all') {
      list = list.filter((p) => p.status === status);
    }
    if (category && category !== 'all') {
      list = list.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    return { products: list, total: list.length };
  },

  /**
   * Admin: Create a new product.
   */
  async createProduct(
    input: CreateProductInput
  ): Promise<{ success: boolean; product?: ManagedProduct; error?: string }> {
    const adminKey = getAdminApiKey();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}`,
          'x-admin-key': adminKey || '',
        },
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.product) {
          saveStoredCustomProduct(data.product);
          notifyProductsChanged(data.product);
          return { success: true, product: data.product };
        }
      }
    } catch {
      // Network/offline fallback
    }

    // Client-side fallback creation to guarantee newly added products appear immediately
    const uniqueSuffix = Math.random().toString(36).substring(2, 6);
    const finalId = `de-prod-${Date.now().toString(36).substring(3)}-${uniqueSuffix}`;
    let finalSlug = input.slug ? sanitizeSlug(input.slug) : sanitizeSlug(input.name);
    if (!finalSlug) finalSlug = `product-${uniqueSuffix}`;

    const newProduct: ManagedProduct = {
      id: finalId,
      slug: finalSlug,
      name: input.name.trim(),
      category: input.category,
      categoryLabel: input.categoryLabel || input.category,
      shortDescription: input.shortDescription.trim(),
      fullDescription: (input.fullDescription || input.shortDescription).trim(),
      pricePaise: Math.round(input.pricePaise),
      currency: input.currency || 'INR',
      coverVisualType: input.coverVisualType || 'playbook',
      coverGradient: input.coverGradient || 'linear-gradient(135deg, #1e1035 0%, #3b1d6e 100%)',
      gallery: ['Overview', 'Details'],
      fileFormats: Array.isArray(input.fileFormats) && input.fileFormats.length > 0 ? input.fileFormats : ['.pdf'],
      compatibility: input.compatibility || 'Compatible with all modern operating systems.',
      contents: Array.isArray(input.contents) && input.contents.length > 0 ? input.contents : [input.name.trim()],
      licenseType: input.licenseType || 'Personal & Commercial Reading License',
      deliveryMethod: 'Instant secure digital download after verification',
      status: input.status || 'published',
      isFeatured: Boolean(input.isFeatured),
      tags: Array.isArray(input.tags) && input.tags.length > 0 ? input.tags : [input.category],
      faqs: Array.isArray(input.faqs) ? input.faqs : [],
      isDemoContent: true,
      demoNotice: 'Demonstration catalogue item — checkout and file delivery are disabled in this storefront preview.',
      attachedFileId: input.attachedFileId,
      attachedFileName: input.attachedFileName,
      attachedFileSize: input.attachedFileSize,
      attachedFileMime: input.attachedFileMime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveStoredCustomProduct(newProduct);
    notifyProductsChanged(newProduct);
    return { success: true, product: newProduct };
  },

  /**
   * Admin: Update an existing product.
   */
  async updateProduct(
    id: string,
    updates: Partial<CreateProductInput>
  ): Promise<{ success: boolean; product?: ManagedProduct; error?: string }> {
    const adminKey = getAdminApiKey();
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}`,
          'x-admin-key': adminKey || '',
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.product) {
          saveStoredCustomProduct(data.product);
          notifyProductsChanged(data.product);
          return { success: true, product: data.product };
        }
      }
    } catch {}

    // Update in client storage
    const custom = getStoredCustomProducts();
    const existing = custom.find((p) => p.id === id);
    if (existing) {
      const updated: ManagedProduct = {
        ...existing,
        ...updates,
        updatedAt: new Date().toISOString(),
      } as ManagedProduct;
      saveStoredCustomProduct(updated);
      notifyProductsChanged(updated);
      return { success: true, product: updated };
    }

    return { success: false, error: 'Product not found' };
  },

  /**
   * Admin: Quick status toggle (published, draft, unpublished).
   */
  async toggleProductStatus(
    id: string,
    status: ProductStatus
  ): Promise<{ success: boolean; product?: ManagedProduct; error?: string }> {
    const adminKey = getAdminApiKey();
    try {
      const res = await fetch(`/api/products/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}`,
          'x-admin-key': adminKey || '',
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.product) {
          saveStoredCustomProduct(data.product);
          notifyProductsChanged(data.product);
          return { success: true, product: data.product };
        }
      }
    } catch {}

    // Update in client storage
    const custom = getStoredCustomProducts();
    const existing = custom.find((p) => p.id === id);
    if (existing) {
      const updated: ManagedProduct = {
        ...existing,
        status,
        updatedAt: new Date().toISOString(),
      };
      saveStoredCustomProduct(updated);
      notifyProductsChanged(updated);
      return { success: true, product: updated };
    }

    return { success: false, error: 'Product not found' };
  },

  /**
   * Admin: Delete a product.
   */
  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    const adminKey = getAdminApiKey();
    removeStoredCustomProduct(id);
    addStoredDeletedId(id);
    notifyProductsChanged();

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}`,
          'x-admin-key': adminKey || '',
        },
      });
      if (res.ok || res.status === 404) {
        return { success: true };
      }
    } catch {}

    return { success: true };
  },

  /**
   * Admin: Direct deliverable file upload for a product.
   */
  async uploadDeliverableAttachment(
    file: File,
    productId?: string
  ): Promise<{
    success: boolean;
    fileId?: string;
    originalName?: string;
    sizeBytes?: number;
    mimeType?: string;
    sha256Hash?: string;
    error?: string;
  }> {
    const adminKey = getAdminApiKey();
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = reader.result as string;
          const commaIndex = res.indexOf(',');
          resolve(commaIndex !== -1 ? res.substring(commaIndex + 1) : res);
        };
        reader.onerror = () => reject(new Error('Failed to read file as Base64'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/products/upload-attachment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          filename: file.name,
          fileBase64: base64,
          mimeType: file.type,
          productId,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        return {
          success: true,
          fileId: data.fileId,
          originalName: data.originalName,
          sizeBytes: data.sizeBytes,
          mimeType: data.mimeType,
          sha256Hash: data.sha256Hash,
        };
      }
      return { success: false, error: data.error || 'File upload failed' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },
};
