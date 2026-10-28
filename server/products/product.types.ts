export type ProductStatus = 'draft' | 'published' | 'unpublished';

export interface ManagedProduct {
  id: string; // e.g. "de-prod-001" or server-generated "de-prod-k9x2m1"
  slug: string; // URL-safe slug, unique
  name: string;
  category: 'ebooks-guides' | 'templates' | 'presets' | 'code-snippets' | string;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  pricePaise: number; // Price in paise (e.g. 49900 = ₹499.00)
  currency: string; // Default 'INR'
  coverVisualType: 'playbook' | 'blueprint' | 'audio' | 'component' | 'generic';
  coverGradient: string; // CSS linear gradient for cover badge
  gallery?: string[];
  fileFormats: string[]; // e.g. ['.pdf', '.zip']
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
  // Private Digital File Deliverable Attachment (Never publicly exposed)
  attachedFileId?: string; // References fileId in StorageProvider
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

export interface UpdateProductInput extends Partial<CreateProductInput> {
  id?: string;
}

export interface ProductQueryParams {
  status?: ProductStatus | 'all';
  category?: string;
  search?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}
