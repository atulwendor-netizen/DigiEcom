import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AdminStorageService } from '../src/services/admin/adminStorage.service';
import { AdminAuthGuard } from '../src/components/admin/AdminAuthGuard';
import { AdminLoginPage } from '../src/pages/admin/AdminLoginPage';
import { AdminLayout } from '../src/components/admin/AdminLayout';

describe('Admin Foundation & Security Guard (Phase 2)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('manages admin key in sessionStorage correctly', () => {
    expect(AdminStorageService.isAuthenticated()).toBe(false);
    expect(AdminStorageService.getStoredAdminKey()).toBeNull();

    AdminStorageService.setStoredAdminKey('my_secret_admin_key_123');
    expect(AdminStorageService.isAuthenticated()).toBe(true);
    expect(AdminStorageService.getStoredAdminKey()).toBe('my_secret_admin_key_123');

    AdminStorageService.clearStoredAdminKey();
    expect(AdminStorageService.isAuthenticated()).toBe(false);
    expect(AdminStorageService.getStoredAdminKey()).toBeNull();
  });

  it('verifies admin key against backend API successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        valid: true,
        provider: 'local',
        isDurable: false,
      }),
    } as any);

    const res = await AdminStorageService.verifyAdminKey('valid_key_xyz');
    expect(res.valid).toBe(true);
    expect(res.provider).toBe('local');
    expect(AdminStorageService.getStoredAdminKey()).toBe('valid_key_xyz');
  });

  it('handles invalid admin key verification gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        valid: false,
        error: 'Invalid or missing Admin Storage API Key',
      }),
    } as any);

    const res = await AdminStorageService.verifyAdminKey('wrong_key');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('Invalid');
  });

  it('renders AdminLoginPage when AdminAuthGuard is not authenticated', () => {
    render(
      <MemoryRouter>
        <AdminAuthGuard>
          <div>Protected Content</div>
        </AdminAuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByText(/DigiEcom Storage Admin/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Admin Storage API Key/i)).toBeInTheDocument();
    expect(screen.queryByText(/Protected Content/i)).not.toBeInTheDocument();
  });

  it('renders protected child component when AdminAuthGuard is authenticated', () => {
    AdminStorageService.setStoredAdminKey('test_authenticated_key');

    render(
      <MemoryRouter>
        <AdminAuthGuard>
          <div data-testid="protected-content">Secret Admin Area</div>
        </AdminAuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText(/Secret Admin Area/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Admin Storage API Key/i)).not.toBeInTheDocument();
  });

  it('renders AdminLayout with admin header, health status, and sign-out button', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        service: 'DigiEcom Storage Backend',
        status: 'operational',
        provider: 'local',
        details: 'Vault active at /tmp/.storage_vault',
      }),
    } as any);

    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>
    );

    expect(screen.getByText(/Admin Console/i)).toBeInTheDocument();
    expect(screen.getByText(/View Storefront/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign out of admin console/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/local: operational/i)).toBeInTheDocument();
    });
  });

  it('allows entering admin key in AdminLoginPage and submits form', async () => {
    const onSuccessMock = vi.fn();

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        valid: true,
        provider: 'local',
      }),
    } as any);

    render(
      <MemoryRouter>
        <AdminLoginPage onSuccess={onSuccessMock} />
      </MemoryRouter>
    );

    const input = screen.getByLabelText(/Admin Storage API Key/i);
    fireEvent.change(input, { target: { value: 'my_test_admin_key_999' } });

    const submitBtn = screen.getByRole('button', { name: /Authenticate & Open Dashboard/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSuccessMock).toHaveBeenCalledTimes(1);
    });
  });
});
