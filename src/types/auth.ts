import { VerifiedOrder } from './checkout';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  avatarUrl?: string;
  role: 'customer' | 'creator' | 'admin';
  joinedAt: string;
}

export interface UserOrderDeliverable {
  productId: string;
  productName: string;
  downloadUrl: string;
  fileFormat: string;
  fileSize: string;
  licenseKey: string;
  expiresIn: string;
}

export interface UserPurchasedOrder {
  id: string;
  paymentId: string;
  amountPaise: number;
  currency: 'INR';
  status: 'succeeded';
  provider: 'razorpay' | 'sandbox';
  customerEmail: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    amountPaise: number;
  }>;
  deliverables: UserOrderDeliverable[];
  receiptId: string;
  createdAt: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  orders: UserPurchasedOrder[];
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'signup';
  openAuthModal: (view?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (
    fullName: string,
    email: string,
    password?: string,
    phone?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  recordOrder: (order: VerifiedOrder | any) => void;
}
