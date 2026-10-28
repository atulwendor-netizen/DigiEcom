import type { UserProfile, UserPurchasedOrder } from '../../types/auth';
import type { VerifiedOrder } from '../../types/checkout';

const USERS_STORAGE_KEY = 'digiecom_users_v2';
const SESSION_STORAGE_KEY = 'digiecom_session_v2';
const USER_ORDERS_STORAGE_KEY = 'digiecom_user_orders_v2';

// Seed demo users for immediate evaluation
export const INITIAL_DEMO_USERS: Array<UserProfile & { passwordHash: string }> = [
  {
    id: 'usr_anant_001',
    fullName: 'Anant Sharma',
    email: 'anant@example.com',
    phone: '+91 98765 43210',
    country: 'India',
    role: 'customer',
    joinedAt: '2026-08-10T10:00:00Z',
    passwordHash: 'password123',
  },
  {
    id: 'usr_priya_002',
    fullName: 'Priya Patel',
    email: 'priya@example.com',
    phone: '+91 91234 56789',
    country: 'India',
    role: 'customer',
    joinedAt: '2026-09-01T14:30:00Z',
    passwordHash: 'password123',
  },
];

// Seed demo orders for Anant and Priya
export const INITIAL_DEMO_ORDERS: Record<string, UserPurchasedOrder[]> = {
  'anant@example.com': [
    {
      id: 'order_seed_001',
      paymentId: 'pay_rzp_demo_101',
      amountPaise: 79900,
      currency: 'INR',
      status: 'succeeded',
      provider: 'razorpay',
      customerEmail: 'anant@example.com',
      items: [
        {
          productId: 'de-prod-001',
          productName: 'The Pragmatic System Design Handbook: Cloud-Scale Microservices',
          quantity: 1,
          amountPaise: 79900,
        },
      ],
      deliverables: [
        {
          productId: 'de-prod-001',
          productName: 'The Pragmatic System Design Handbook: Cloud-Scale Microservices',
          downloadUrl: '/api/checkout/download?token=dge_seed_001&product=de-prod-001',
          fileFormat: '.pdf, .epub',
          fileSize: '16.4 MB',
          licenseKey: 'DGE-SYS-7749-PRO',
          expiresIn: 'Permanent Access • Single-user Commercial License',
        },
      ],
      receiptId: 'rcpt_seed_101',
      createdAt: '2026-10-15T11:20:00Z',
    },
    {
      id: 'order_seed_002',
      paymentId: 'pay_rzp_demo_102',
      amountPaise: 59900,
      currency: 'INR',
      status: 'succeeded',
      provider: 'razorpay',
      customerEmail: 'anant@example.com',
      items: [
        {
          productId: 'de-prod-002',
          productName: 'Zero-to-One Founder Playbook: Validating & Launching Tech Products',
          quantity: 1,
          amountPaise: 59900,
        },
      ],
      deliverables: [
        {
          productId: 'de-prod-002',
          productName: 'Zero-to-One Founder Playbook: Validating & Launching Tech Products',
          downloadUrl: '/api/checkout/download?token=dge_seed_002&product=de-prod-002',
          fileFormat: '.pdf, .notion',
          fileSize: '12.8 MB',
          licenseKey: 'DGE-FND-3321-LTD',
          expiresIn: 'Permanent Access • Single-user Commercial License',
        },
      ],
      receiptId: 'rcpt_seed_102',
      createdAt: '2026-10-20T16:45:00Z',
    },
  ],
  'priya@example.com': [
    {
      id: 'order_seed_003',
      paymentId: 'pay_rzp_demo_103',
      amountPaise: 89900,
      currency: 'INR',
      status: 'succeeded',
      provider: 'razorpay',
      customerEmail: 'priya@example.com',
      items: [
        {
          productId: 'de-prod-004',
          productName: 'Architectural Vector Blueprints & Diagram Kit',
          quantity: 1,
          amountPaise: 89900,
        },
      ],
      deliverables: [
        {
          productId: 'de-prod-004',
          productName: 'Architectural Vector Blueprints & Diagram Kit',
          downloadUrl: '/api/checkout/download?token=dge_seed_003&product=de-prod-004',
          fileFormat: '.fig, .svg, .drawio',
          fileSize: '48.2 MB',
          licenseKey: 'DGE-VEC-9902-KIT',
          expiresIn: 'Permanent Access • Team Commercial License',
        },
      ],
      receiptId: 'rcpt_seed_103',
      createdAt: '2026-10-25T09:15:00Z',
    },
  ],
};

export class AuthService {
  /**
   * Initializes users registry with seed accounts in localStorage if not already present.
   */
  public static init(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
      if (!storedUsers) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_USERS));
      }

      const storedOrders = localStorage.getItem(USER_ORDERS_STORAGE_KEY);
      if (!storedOrders) {
        localStorage.setItem(USER_ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
      }
    } catch (e) {
      console.warn('AuthService localStorage initialization failed:', e);
    }
  }

  /**
   * Retrieves all registered users from storage.
   */
  public static getAllUsers(): Array<UserProfile & { passwordHash: string }> {
    if (typeof window === 'undefined') return INITIAL_DEMO_USERS;

    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      if (!raw) {
        this.init();
        return INITIAL_DEMO_USERS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_DEMO_USERS;
    }
  }

  /**
   * Persists users array to localStorage.
   */
  public static saveAllUsers(users: Array<UserProfile & { passwordHash: string }>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn('Failed saving users to localStorage:', e);
    }
  }

  /**
   * Logs in a user by matching email and password.
   */
  public static async login(
    email: string,
    password = 'password123'
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    this.init();
    const cleanEmail = email.trim().toLowerCase();
    const users = this.getAllUsers();

    const matched = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      return {
        success: false,
        error: 'No account found with this email address. Please register.',
      };
    }

    if (matched.passwordHash && matched.passwordHash !== password) {
      return {
        success: false,
        error: 'Incorrect password. (For demo accounts, use: password123)',
      };
    }

    const { passwordHash: _, ...profile } = matched;
    this.saveSession(profile);

    return {
      success: true,
      user: profile,
    };
  }

  /**
   * Registers a new customer account.
   */
  public static async signup(
    fullName: string,
    email: string,
    password = 'password123',
    phone = ''
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    this.init();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanName || !cleanEmail) {
      return { success: false, error: 'Full name and email are required.' };
    }

    const users = this.getAllUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in.',
      };
    }

    const newUser: UserProfile & { passwordHash: string } = {
      id: `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      fullName: cleanName,
      email: cleanEmail,
      phone: phone.trim() || undefined,
      country: 'India',
      role: 'customer',
      joinedAt: new Date().toISOString(),
      passwordHash: password,
    };

    users.push(newUser);
    this.saveAllUsers(users);

    const { passwordHash: _, ...profile } = newUser;
    this.saveSession(profile);

    return {
      success: true,
      user: profile,
    };
  }

  /**
   * Updates an existing user's profile details.
   */
  public static updateProfile(userId: string, data: Partial<UserProfile>): UserProfile | null {
    const users = this.getAllUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return null;

    const updated = {
      ...users[index],
      ...data,
      id: users[index].id, // protect ID
    };

    users[index] = updated;
    this.saveAllUsers(users);

    const { passwordHash: _, ...profile } = updated;
    this.saveSession(profile);
    return profile;
  }

  /**
   * Saves active user session to localStorage.
   */
  public static saveSession(user: UserProfile): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.warn('Failed saving session:', e);
    }
  }

  /**
   * Retrieves active user session from localStorage.
   */
  public static getSession(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Clears the current user session (Log out).
   */
  public static clearSession(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed clearing session:', e);
    }
  }

  /**
   * Retrieves all purchased orders belonging to an email address.
   */
  public static getUserOrders(email: string): UserPurchasedOrder[] {
    if (typeof window === 'undefined' || !email) return [];
    const cleanEmail = email.trim().toLowerCase();

    try {
      const raw = localStorage.getItem(USER_ORDERS_STORAGE_KEY);
      const ordersMap: Record<string, UserPurchasedOrder[]> = raw ? JSON.parse(raw) : INITIAL_DEMO_ORDERS;
      return ordersMap[cleanEmail] || [];
    } catch {
      return INITIAL_DEMO_ORDERS[cleanEmail] || [];
    }
  }

  /**
   * Appends a newly completed order to the user's permanent purchase library.
   */
  public static recordOrder(
    email: string,
    order: VerifiedOrder | any
  ): UserPurchasedOrder {
    const cleanEmail = (email || order.customer?.email || 'guest@example.com').trim().toLowerCase();

    const userOrder: UserPurchasedOrder = {
      id: order.id,
      paymentId: order.paymentId || order.gatewayTransactionId || `pay_${Date.now().toString(36)}`,
      amountPaise: order.amountPaise || order.subtotalPaise || 0,
      currency: 'INR',
      status: 'succeeded',
      provider: order.provider || 'razorpay',
      customerEmail: cleanEmail,
      items: (order.items || []).map((i: any) => ({
        productId: i.productId || i.product?.id,
        productName: i.productName || i.product?.name,
        quantity: i.quantity || 1,
        amountPaise: i.amountPaise || (i.product?.pricePaise * (i.quantity || 1)) || 0,
      })),
      deliverables: (order.deliverables || []).map((d: any) => ({
        productId: d.productId,
        productName: d.productName,
        downloadUrl: d.downloadUrl,
        fileFormat: d.fileFormat,
        fileSize: d.fileSize,
        licenseKey: d.licenseKey,
        expiresIn: d.expiresIn,
      })),
      receiptId: order.receiptId || `rcpt_${Date.now().toString(36)}`,
      createdAt: order.createdAt || new Date().toISOString(),
    };

    if (typeof window === 'undefined') return userOrder;

    try {
      const raw = localStorage.getItem(USER_ORDERS_STORAGE_KEY);
      const ordersMap: Record<string, UserPurchasedOrder[]> = raw ? JSON.parse(raw) : { ...INITIAL_DEMO_ORDERS };

      const existing = ordersMap[cleanEmail] || [];
      // Prevent duplicates
      if (!existing.some((o) => o.id === userOrder.id)) {
        ordersMap[cleanEmail] = [userOrder, ...existing];
        localStorage.setItem(USER_ORDERS_STORAGE_KEY, JSON.stringify(ordersMap));
      }
    } catch (e) {
      console.warn('Failed recording user order in localStorage:', e);
    }

    return userOrder;
  }
}
