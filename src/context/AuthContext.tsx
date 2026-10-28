import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile, UserPurchasedOrder, AuthContextType } from '../types/auth';
import type { VerifiedOrder } from '../types/checkout';
import { AuthService } from '../services/auth/auth.service';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<UserPurchasedOrder[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');

  // Load active session and orders on mount
  useEffect(() => {
    AuthService.init();
    const session = AuthService.getSession();
    if (session) {
      setUser(session);
      const userOrders = AuthService.getUserOrders(session.email);
      setOrders(userOrders);
    }
    setIsLoading(false);
  }, []);

  // Sync orders whenever user changes
  useEffect(() => {
    if (user?.email) {
      const userOrders = AuthService.getUserOrders(user.email);
      setOrders(userOrders);
    } else {
      setOrders([]);
    }
  }, [user?.email]);

  const openAuthModal = useCallback((view: 'login' | 'signup' = 'login') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(
    async (email: string, password = 'password123'): Promise<{ success: boolean; error?: string }> => {
      const res = await AuthService.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
        const userOrders = AuthService.getUserOrders(res.user.email);
        setOrders(userOrders);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: res.error || 'Authentication failed' };
    },
    []
  );

  const signup = useCallback(
    async (
      fullName: string,
      email: string,
      password = 'password123',
      phone = ''
    ): Promise<{ success: boolean; error?: string }> => {
      const res = await AuthService.signup(fullName, email, password, phone);
      if (res.success && res.user) {
        setUser(res.user);
        const userOrders = AuthService.getUserOrders(res.user.email);
        setOrders(userOrders);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed' };
    },
    []
  );

  const logout = useCallback(() => {
    AuthService.clearSession();
    setUser(null);
    setOrders([]);
  }, []);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>): Promise<boolean> => {
      if (!user) return false;
      const updated = AuthService.updateProfile(user.id, data);
      if (updated) {
        setUser(updated);
        return true;
      }
      return false;
    },
    [user]
  );

  const recordOrder = useCallback(
    (order: VerifiedOrder | any) => {
      const targetEmail = user?.email || order.customer?.email || 'guest@example.com';
      const saved = AuthService.recordOrder(targetEmail, order);

      // If order belongs to current user, update state immediately
      if (user?.email && targetEmail.toLowerCase() === user.email.toLowerCase()) {
        setOrders((prev) => [saved, ...prev.filter((o) => o.id !== saved.id)]);
      }
    },
    [user?.email]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        orders,
        isAuthModalOpen,
        authModalView,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
        updateProfile,
        recordOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const defaultAuthContext: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  orders: [],
  isAuthModalOpen: false,
  authModalView: 'login',
  openAuthModal: () => {},
  closeAuthModal: () => {},
  login: async () => ({ success: false, error: 'AuthProvider not found' }),
  signup: async () => ({ success: false, error: 'AuthProvider not found' }),
  logout: () => {},
  updateProfile: async () => false,
  recordOrder: () => {},
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
};
