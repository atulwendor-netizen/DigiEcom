import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthService } from '../src/services/auth/auth.service';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { AuthModal } from '../src/components/auth/AuthModal';
import { UserMenu } from '../src/components/auth/UserMenu';
import { AccountPage } from '../src/pages/AccountPage';

describe('Customer Authentication & Profiles System', () => {
  beforeEach(() => {
    localStorage.clear();
    AuthService.init();
  });

  it('authenticates demo customer Anant Sharma and sets active session', async () => {
    const result = await AuthService.login('anant@example.com', 'password123');
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.fullName).toBe('Anant Sharma');
    expect(result.user?.role).toBe('customer');

    const session = AuthService.getSession();
    expect(session?.email).toBe('anant@example.com');
  });

  it('rejects login with invalid email or incorrect password', async () => {
    const nonExistent = await AuthService.login('nobody@example.com', 'password123');
    expect(nonExistent.success).toBe(false);
    expect(nonExistent.error).toContain('No account found');

    const wrongPass = await AuthService.login('anant@example.com', 'wrongpassword');
    expect(wrongPass.success).toBe(false);
    expect(wrongPass.error).toContain('Incorrect password');
  });

  it('registers a new customer account and prevents duplicate emails', async () => {
    const signupRes = await AuthService.signup('Kavita Rao', 'kavita@example.com', 'securepass123');
    expect(signupRes.success).toBe(true);
    expect(signupRes.user?.fullName).toBe('Kavita Rao');
    expect(signupRes.user?.email).toBe('kavita@example.com');

    // Attempt duplicate registration
    const duplicateRes = await AuthService.signup('Kavita R', 'kavita@example.com', 'otherpass');
    expect(duplicateRes.success).toBe(false);
    expect(duplicateRes.error).toContain('already exists');
  });

  it('retrieves pre-seeded digital library orders for demo users', () => {
    const anantOrders = AuthService.getUserOrders('anant@example.com');
    expect(anantOrders.length).toBeGreaterThanOrEqual(2);
    expect(anantOrders[0].deliverables[0].licenseKey).toMatch(/^DGE-/);

    const priyaOrders = AuthService.getUserOrders('priya@example.com');
    expect(priyaOrders.length).toBeGreaterThanOrEqual(1);
    expect(priyaOrders[0].deliverables[0].productName).toContain('Architectural Vector Blueprints');
  });

  it('updates profile information and persists changes', async () => {
    await AuthService.login('anant@example.com', 'password123');
    const updated = AuthService.updateProfile('usr_anant_001', {
      fullName: 'Anant S. Sharma',
      phone: '+91 99999 11111',
    });

    expect(updated?.fullName).toBe('Anant S. Sharma');
    expect(updated?.phone).toBe('+91 99999 11111');
    expect(AuthService.getSession()?.fullName).toBe('Anant S. Sharma');
  });

  it('renders AuthModal with login view, quick demo logins, and tab switching', async () => {
    const TestComponent = () => {
      const { openAuthModal } = useAuth();
      return (
        <div>
          <button type="button" onClick={() => openAuthModal('login')}>
            Trigger Modal
          </button>
          <AuthModal />
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Open modal
    fireEvent.click(screen.getByText('Trigger Modal'));

    expect(screen.getByRole('dialog', { name: /Welcome Back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to DigiEcom/i })).toBeInTheDocument();
    expect(screen.getByText('Anant Sharma')).toBeInTheDocument();
    expect(screen.getByText('Priya Patel')).toBeInTheDocument();

    // Switch to Create Account
    const createAccountTab = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(createAccountTab);

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create My Account/i })).toBeInTheDocument();
  });

  it('renders UserMenu showing Sign In button when logged out and User initials when logged in', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <AuthProvider>
          <UserMenu />
          <AuthModal />
        </AuthProvider>
      </MemoryRouter>
    );

    // Logged out: "Sign In" button is visible
    const signInBtn = screen.getByRole('button', { name: /Sign In/i });
    expect(signInBtn).toBeInTheDocument();

    // Click Sign In to open modal
    await user.click(signInBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Click quick demo login for Anant
    const anantQuickBtn = screen.getByRole('button', { name: /Anant Sharma 2 Owned Products/i });
    await user.click(anantQuickBtn);

    // After login, User initials pill is displayed
    await waitFor(() => {
      expect(screen.getByText('AS')).toBeInTheDocument();
      expect(screen.getByText('Anant')).toBeInTheDocument();
    });

    // Clicking avatar opens dropdown menu
    await user.click(screen.getByRole('button', { name: /User menu for Anant Sharma/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /My Profile & Settings/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Digital Library/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Sign Out/i })).toBeInTheDocument();
  });

  it('renders AccountPage Digital Library with purchased assets and copyable license keys', async () => {
    // Log in Anant first
    await AuthService.login('anant@example.com', 'password123');

    render(
      <MemoryRouter initialEntries={['/account']}>
        <AuthProvider>
          <AccountPage defaultTab="library" />
        </AuthProvider>
      </MemoryRouter>
    );

    // Header with user name and verification
    expect(screen.getByText('Anant Sharma')).toBeInTheDocument();
    expect(screen.getByText(/Verified Buyer/i)).toBeInTheDocument();

    // Stats
    expect(screen.getByText(/Products Owned/i)).toBeInTheDocument();

    // Check purchased items in library
    expect(
      screen.getByText(/The Pragmatic System Design Handbook: Cloud-Scale Microservices/i)
    ).toBeInTheDocument();
    expect(screen.getByText('DGE-SYS-7749-PRO')).toBeInTheDocument();
    expect(
      screen.getByText(/Zero-to-One Founder Playbook: Validating & Launching Tech Products/i)
    ).toBeInTheDocument();

    // License copy buttons exist
    const copyButtons = screen.getAllByRole('button', { name: /Copy license key/i });
    expect(copyButtons.length).toBeGreaterThanOrEqual(2);
  });
});
