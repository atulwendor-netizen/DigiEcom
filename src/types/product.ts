import { CategoryId } from './category';

export interface ProductFAQ {
  question: string;
  answer: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  pricePaise: number; // Stored in integer paise (e.g. 79900 = ₹799.00) to prevent IEEE 754 floating point issues
  currency: 'INR';
  coverVisualType: 'code' | 'playbook' | 'ai' | 'finance' | 'legal' | 'notion' | 'obsidian' | 'design' | 'illustration' | 'audio' | 'dotfiles';
  coverGradient: string;
  gallery: string[];
  fileFormats: string[];
  compatibility: string;
  contents: string[];
  licenseType: string;
  deliveryMethod: string;
  publicationStatus: 'published' | 'draft' | 'archived';
  isFeatured: boolean;
  createdAt: string; // ISO 8601
  faqs: ProductFAQ[];
  tags: string[];
  isDemoContent: boolean;
  demoNotice: string;
}

export type ProductSortOption = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name-asc';
