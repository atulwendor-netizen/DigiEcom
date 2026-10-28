import productsSeed from '../data/products.json';

export type ProductStatus = 'draft' | 'published' | 'unpublished';

export interface ManagedProduct {
  id: string;
  slug: string;
  name: string;
  category: 'ebooks-guides' | 'templates' | 'presets' | 'code-snippets' | string;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  pricePaise: number;
  currency: string;
  coverVisualType: 'playbook' | 'blueprint' | 'audio' | 'component' | 'generic';
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
  coverVisualType?: 'playbook' | 'blueprint' | 'audio' | 'component' | 'generic';
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

const ADMIN_STORAGE_KEY_STORAGE = 'digiecom_admin_storage_key';

function getAdminApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(ADMIN_STORAGE_KEY_STORAGE);
}

export const ProductService = {
  /**
   * Public storefront fetch: Retrieves published products with fallback to seed data.
   */
  async getPublishedProducts(category?: string, search?: string): Promise<ManagedProduct[]> {
    try {
      const queryParams = new URLSearchParams();
      if (category) queryParams.set('category', category);
      if (search) queryParams.set('search', search);

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`API responded with ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        return data.products;
      }
    } catch {
      // Fallback seamlessly to seed data
    }

    let fallback = (productsSeed as any[]).map((p) => ({
      ...p,
      status: (p.status as ProductStatus) || 'published',
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    })) as ManagedProduct[];

    if (category) {
      fallback = fallback.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase().trim();
      fallback = fallback.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags?.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    return fallback;
  },

  /**
   * Public storefront fetch: Retrieves single product by slug or ID with fallback to seed data.
   */
  async getProductBySlug(slug: string): Promise<ManagedProduct | null> {
    try {
      const res = await fetch(`/api/products/${slug}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.product) {
          return data.product;
        }
      }
    } catch {
      // Fallback
    }

    const found = (productsSeed as any[]).find((p) => p.slug === slug || p.id === slug);
    if (!found) return null;
    return {
      ...found,
      status: (found.status as ProductStatus) || 'published',
      createdAt: found.createdAt || new Date().toISOString(),
      updatedAt: found.updatedAt || new Date().toISOString(),
    } as ManagedProduct;
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
    const queryParams = new URLSearchParams();
    queryParams.set('status', status);
    if (category) queryParams.set('category', category);
    if (search) queryParams.set('search', search);

    try {
      const res = await fetch(`/api/products?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          return { products: data.products, total: data.total || data.products.length };
        }
      }
    } catch {}

    // Fallback if local without API
    const fallback = (productsSeed as any[]).map((p) => ({
      ...p,
      status: (p.status as ProductStatus) || 'published',
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    })) as ManagedProduct[];

    return { products: fallback, total: fallback.length };
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
        },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, product: data.product };
      }
      return { success: false, error: data.error || 'Failed to create product' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
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
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, product: data.product };
      }
      return { success: false, error: data.error || 'Failed to update product' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
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
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, product: data.product };
      }
      return { success: false, error: data.error || 'Failed to toggle status' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Admin: Delete a product.
   */
  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    const adminKey = getAdminApiKey();
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true };
      }
      return { success: false, error: data.error || 'Failed to delete product' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
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
