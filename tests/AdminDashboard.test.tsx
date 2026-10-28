import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminStoragePage } from '../src/pages/admin/AdminStoragePage';
import { AdminStorageService } from '../src/services/admin/adminStorage.service';

describe('Admin Storage Dashboard UI (Phase 3)', () => {
  const mockFiles = [
    {
      fileId: 'b7c3d2e1-1111-4000-8000-000000000001',
      originalName: 'Cloud-Architecture-Handbook.pdf',
      sanitizedName: 'Cloud_Architecture_Handbook.pdf',
      extension: '.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 15728640, // 15 MB
      sha256Hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      category: 'ebooks-guides',
      associatedProductId: 'de-prod-001',
      uploadedAt: '2026-10-28T12:00:00Z',
      updatedAt: '2026-10-28T12:00:00Z',
      isProtected: true,
    },
    {
      fileId: 'c8d4e3f2-2222-4000-8000-000000000002',
      originalName: 'Vector-Blueprints.zip',
      sanitizedName: 'Vector_Blueprints.zip',
      extension: '.zip',
      mimeType: 'application/zip',
      sizeBytes: 41943040, // 40 MB
      sha256Hash: 'b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef01',
      category: 'templates',
      associatedProductId: 'de-prod-004',
      uploadedAt: '2026-10-28T14:30:00Z',
      updatedAt: '2026-10-28T14:30:00Z',
      isProtected: true,
    },
  ];

  const mockStats = {
    totalFiles: 2,
    totalSizeBytes: 57671680,
    totalSizeFormatted: '55.00 MB',
    provider: 'local',
    isDurable: false,
    maxFileSizeBytes: 52428800,
    byCategory: {
      'ebooks-guides': { count: 1, bytes: 15728640 },
      templates: { count: 1, bytes: 41943040 },
    },
    byFormat: {
      '.pdf': { count: 1, bytes: 15728640 },
      '.zip': { count: 1, bytes: 41943040 },
    },
    updatedAt: new Date().toISOString(),
  };

  const mockLogs = [
    {
      id: 'log_test_1',
      timestamp: '2026-10-28T14:30:00Z',
      action: 'UPLOAD',
      fileId: 'c8d4e3f2-2222-4000-8000-000000000002',
      filename: 'Vector-Blueprints.zip',
      details: 'Uploaded Vector-Blueprints.zip (40.0 MB)',
      status: 'success' as const,
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AdminStorageService, 'listFiles').mockResolvedValue(mockFiles);
    vi.spyOn(AdminStorageService, 'getStats').mockResolvedValue(mockStats);
    vi.spyOn(AdminStorageService, 'getLogs').mockResolvedValue(mockLogs);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Dashboard title, metrics cards, and file table', async () => {
    render(
      <MemoryRouter>
        <AdminStoragePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Digital Asset Storage Vault/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('55.00 MB')).toBeInTheDocument();
      expect(screen.getByText('Cloud-Architecture-Handbook.pdf')).toBeInTheDocument();
      expect(screen.getByText('Vector-Blueprints.zip')).toBeInTheDocument();
    });
  });

  it('switches between Files, Audit Logs, and Storage Guide tabs', async () => {
    render(
      <MemoryRouter>
        <AdminStoragePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cloud-Architecture-Handbook.pdf')).toBeInTheDocument();
    });

    // Switch to Audit Logs tab
    const logsTab = screen.getByRole('button', { name: /Audit Logs/i });
    fireEvent.click(logsTab);

    await waitFor(() => {
      expect(screen.getByText(/Storage Activity Audit Log/i)).toBeInTheDocument();
      expect(screen.getByText(/Uploaded Vector-Blueprints.zip/i)).toBeInTheDocument();
    });

    // Switch to Guide tab
    const guideTab = screen.getByRole('button', { name: /Storage & Cloud Guide/i });
    fireEvent.click(guideTab);

    await waitFor(() => {
      expect(screen.getByText(/Production Cloud Storage Configuration Guide/i)).toBeInTheDocument();
      expect(screen.getByText(/Option A: Cloudflare R2/i)).toBeInTheDocument();
    });
  });

  it('opens and closes the Upload Asset Modal', async () => {
    render(
      <MemoryRouter>
        <AdminStoragePage />
      </MemoryRouter>
    );

    const uploadButtons = screen.getAllByRole('button', { name: /\+ Upload New Asset|Upload New Asset/i });
    fireEvent.click(uploadButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Upload Digital Asset/i })).toBeInTheDocument();
      expect(screen.getByText(/Click to select digital asset file/i)).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole('button', { name: /Close upload modal/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Click to select digital asset file/i)).not.toBeInTheDocument();
    });
  });

  it('opens Metadata Drawer when clicking Inspect', async () => {
    render(
      <MemoryRouter>
        <AdminStoragePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cloud-Architecture-Handbook.pdf')).toBeInTheDocument();
    });

    const inspectBtn = screen.getByRole('button', {
      name: /Inspect metadata for Cloud-Architecture-Handbook.pdf/i,
    });
    fireEvent.click(inspectBtn);

    await waitFor(() => {
      expect(screen.getByText(/Storage Identity & Checksum/i)).toBeInTheDocument();
      expect(screen.getByText(/Generate Authorized Download Voucher/i)).toBeInTheDocument();
      expect(screen.getAllByText(/b7c3d2e1-1111-4000-8000-000000000001/i).length).toBeGreaterThanOrEqual(1);
    });

    const closeDrawerBtn = screen.getByRole('button', { name: /Close metadata drawer/i });
    fireEvent.click(closeDrawerBtn);

    await waitFor(() => {
      expect(screen.queryByText(/Storage Identity & Checksum/i)).not.toBeInTheDocument();
    });
  });

  it('filters assets by search text in File Manager table', async () => {
    render(
      <MemoryRouter>
        <AdminStoragePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Cloud-Architecture-Handbook.pdf')).toBeInTheDocument();
      expect(screen.getByText('Vector-Blueprints.zip')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by filename, product ID, or category.../i);
    fireEvent.change(searchInput, { target: { value: 'Vector' } });

    await waitFor(() => {
      expect(screen.queryByText('Cloud-Architecture-Handbook.pdf')).not.toBeInTheDocument();
      expect(screen.getByText('Vector-Blueprints.zip')).toBeInTheDocument();
    });
  });
});
