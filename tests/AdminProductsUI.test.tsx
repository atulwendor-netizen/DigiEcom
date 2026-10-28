import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminProductsPage } from '../src/pages/admin/AdminProductsPage';
import { ProductService, ManagedProduct } from '../src/services/product.service';

describe('Admin Products UI (Phase 2)', () => {
  const mockProducts: ManagedProduct[] = [
    {
      id: 'de-prod-001',
      slug: 'system-design-handbook-cloud-scale',
      name: 'System Design Handbook: Cloud-Scale Microservices',
      category: 'ebooks-guides',
      categoryLabel: 'E-books & Guides',
      shortDescription: 'Practitioner guide covering distributed consensus and architectures.',
      fullDescription: 'Comprehensive system design handbook for backend engineers.',
      pricePaise: 79900,
      currency: 'INR',
      coverVisualType: 'playbook',
      coverGradient: 'linear-gradient(135deg, #1e1035 0%, #3b1d6e 100%)',
      fileFormats: ['.pdf', '.epub'],
      contents: ['340-page PDF handbook', 'Vector architecture SVGs'],
      licenseType: 'Personal reading license',
      status: 'published',
      isFeatured: true,
      tags: ['System Design', 'Cloud Architecture'],
      faqs: [],
      attachedFileId: 'vault-uuid-001',
      attachedFileName: 'System-Design-Handbook.pdf',
      attachedFileSize: 15728640,
      createdAt: '2026-10-28T10:00:00Z',
      updatedAt: '2026-10-28T10:00:00Z',
    },
    {
      id: 'de-prod-002',
      slug: 'nextjs-saas-starter-kit',
      name: 'Next.js 15 Full-Stack SaaS Starter Kit',
      category: 'templates',
      categoryLabel: 'Templates & Kits',
      shortDescription: 'Production-ready Next.js 15 starter with auth and Stripe.',
      fullDescription: 'Complete SaaS template with Prisma, Tailwind v4, and Docker.',
      pricePaise: 99900,
      currency: 'INR',
      coverVisualType: 'blueprint',
      coverGradient: 'linear-gradient(135deg, #091e3a 0%, #173b75 100%)',
      fileFormats: ['.zip'],
      contents: ['Next.js project repository .zip', 'Setup guide PDF'],
      licenseType: 'Commercial developer license',
      status: 'draft',
      isFeatured: false,
      tags: ['Next.js', 'TypeScript', 'SaaS'],
      faqs: [],
      createdAt: '2026-10-28T12:00:00Z',
      updatedAt: '2026-10-28T12:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(ProductService, 'getAdminProducts').mockResolvedValue({
      products: mockProducts,
      total: mockProducts.length,
    });
    vi.spyOn(ProductService, 'toggleProductStatus').mockResolvedValue({
      success: true,
      product: { ...mockProducts[0], status: 'draft' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Product Catalogue Manager page with metrics and table', async () => {
    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Product Catalogue Manager/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('System Design Handbook: Cloud-Scale Microservices')).toBeInTheDocument();
      expect(screen.getByText('Next.js 15 Full-Stack SaaS Starter Kit')).toBeInTheDocument();
      expect(screen.getByText('₹799.00')).toBeInTheDocument();
      expect(screen.getByText('₹999.00')).toBeInTheDocument();
      expect(screen.getByText('System-Design-Handbook.pdf')).toBeInTheDocument();
      expect(screen.getByText('No Vault Asset')).toBeInTheDocument();
    });
  });

  it('opens Product Form Modal when clicking Add New Product', async () => {
    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    const addBtn = screen.getByRole('button', { name: /Add New Product/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('Add New Digital Product')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e.g. Modern Cloud Microservices Architecture Playbook/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Product/i })).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole('button', { name: /Close product modal/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Add New Digital Product')).not.toBeInTheDocument();
    });
  });

  it('opens Product Form Modal in Edit mode when clicking Edit button', async () => {
    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('System Design Handbook: Cloud-Scale Microservices')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByTitle('Edit product');
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Digital Product')).toBeInTheDocument();
      const input = screen.getByDisplayValue('System Design Handbook: Cloud-Scale Microservices');
      expect(input).toBeInTheDocument();
    });
  });

  it('switches between tabs inside the Product Form Modal', async () => {
    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    const addBtn = screen.getByRole('button', { name: /Add New Product/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText('Add New Digital Product')).toBeInTheDocument();
    });

    // 1. Switch to Copy & Details tab
    const copyTab = screen.getByRole('button', { name: /Copy & Details/i });
    fireEvent.click(copyTab);
    expect(screen.getByText(/Short Storefront Summary/i)).toBeInTheDocument();

    // 2. Switch to Digital Attachment tab
    const fileTab = screen.getByRole('button', { name: /Digital Attachment/i });
    fireEvent.click(fileTab);
    expect(screen.getByText(/Vault Deliverable Protection/i)).toBeInTheDocument();

    // 3. Switch to Live Card Preview tab
    const previewTab = screen.getByRole('button', { name: /Live Card Preview/i });
    fireEvent.click(previewTab);
    expect(screen.getByText(/Interactive live preview of how this product appears/i)).toBeInTheDocument();
  });

  it('toggles product status dropdown', async () => {
    render(
      <MemoryRouter>
        <AdminProductsPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('System Design Handbook: Cloud-Scale Microservices')).toBeInTheDocument();
    });

    const selects = screen.getAllByRole('combobox');
    const productStatusSelect = selects.find((s) => (s as HTMLSelectElement).value === 'published');
    expect(productStatusSelect).toBeDefined();

    fireEvent.change(productStatusSelect!, { target: { value: 'draft' } });

    await waitFor(() => {
      expect(ProductService.toggleProductStatus).toHaveBeenCalledWith('de-prod-001', 'draft');
    });
  });
});
