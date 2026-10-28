import fs from 'fs';
import path from 'path';
import type { ManagedProduct, ProductQueryParams } from './product.types';

export interface ProductDatabaseProvider {
  readonly name: string;
  initialize(): Promise<void>;
  getAll(params?: ProductQueryParams): Promise<{ products: ManagedProduct[]; total: number }>;
  getById(id: string): Promise<ManagedProduct | null>;
  getBySlug(slug: string): Promise<ManagedProduct | null>;
  create(product: ManagedProduct): Promise<ManagedProduct>;
  update(id: string, updates: Partial<ManagedProduct>): Promise<ManagedProduct | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * Local file-based JSON database provider.
 * Automatically bootstraps from src/data/products.json if no database file exists yet.
 */
export class LocalFileDatabaseProvider implements ProductDatabaseProvider {
  readonly name = 'local-file';
  private dbFilePath: string;
  private isInitialized = false;
  private cache: ManagedProduct[] = [];

  constructor(customPath?: string) {
    if (customPath) {
      this.dbFilePath = customPath;
    } else {
      const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
      const baseDir = isVercel ? '/tmp/.storage_vault' : path.resolve(process.cwd(), '.storage_vault');
      this.dbFilePath = path.join(baseDir, 'db', 'products.json');
    }
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const dir = path.dirname(this.dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.dbFilePath)) {
      try {
        const raw = fs.readFileSync(this.dbFilePath, 'utf8');
        this.cache = JSON.parse(raw);
      } catch {
        this.cache = [];
      }
    } else {
      // Auto-bootstrap seed data from src/data/products.json
      this.cache = this.loadSeedProducts();
      this.persist();
    }

    this.isInitialized = true;
  }

  private loadSeedProducts(): ManagedProduct[] {
    const seedCandidates = [
      path.resolve(process.cwd(), 'src/data/products.json'),
      path.resolve(process.cwd(), 'dist/src/data/products.json'),
      path.resolve(__dirname, '../../src/data/products.json'),
    ];

    for (const cand of seedCandidates) {
      if (fs.existsSync(cand)) {
        try {
          const raw = fs.readFileSync(cand, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((p) => ({
              ...p,
              status: (p.status as any) || 'published',
              createdAt: p.createdAt || new Date().toISOString(),
              updatedAt: p.updatedAt || new Date().toISOString(),
            }));
          }
        } catch {
          // continue
        }
      }
    }
    return [];
  }

  private persist(): void {
    const dir = path.dirname(this.dbFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.dbFilePath, JSON.stringify(this.cache, null, 2), 'utf8');
  }

  async getAll(params?: ProductQueryParams): Promise<{ products: ManagedProduct[]; total: number }> {
    await this.initialize();
    let result = [...this.cache];

    if (params?.status && params.status !== 'all') {
      result = result.filter((p) => p.status === params.status);
    }

    if (params?.category) {
      result = result.filter((p) => p.category.toLowerCase() === params.category!.toLowerCase());
    }

    if (params?.isFeatured !== undefined) {
      result = result.filter((p) => Boolean(p.isFeatured) === params.isFeatured);
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    const total = result.length;

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    if (params?.page && params?.limit) {
      const start = (params.page - 1) * params.limit;
      result = result.slice(start, start + params.limit);
    }

    return { products: result, total };
  }

  async getById(id: string): Promise<ManagedProduct | null> {
    await this.initialize();
    const found = this.cache.find((p) => p.id === id);
    return found ? { ...found } : null;
  }

  async getBySlug(slug: string): Promise<ManagedProduct | null> {
    await this.initialize();
    const found = this.cache.find((p) => p.slug === slug);
    return found ? { ...found } : null;
  }

  async create(product: ManagedProduct): Promise<ManagedProduct> {
    await this.initialize();
    this.cache.unshift(product);
    this.persist();
    return { ...product };
  }

  async update(id: string, updates: Partial<ManagedProduct>): Promise<ManagedProduct | null> {
    await this.initialize();
    const index = this.cache.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updated: ManagedProduct = {
      ...this.cache[index],
      ...updates,
      id, // Immutable ID
      updatedAt: new Date().toISOString(),
    };

    this.cache[index] = updated;
    this.persist();
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    await this.initialize();
    const initialLen = this.cache.length;
    this.cache = this.cache.filter((p) => p.id !== id);
    if (this.cache.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }
}

let activeProductDb: ProductDatabaseProvider | null = null;

export function getProductDatabase(): ProductDatabaseProvider {
  if (activeProductDb) return activeProductDb;
  activeProductDb = new LocalFileDatabaseProvider();
  return activeProductDb;
}

export function setProductDatabase(provider: ProductDatabaseProvider | null): void {
  activeProductDb = provider;
}
