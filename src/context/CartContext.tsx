import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types/product';
import { formatINR } from '../utils/currency';

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  subtotalPaise: number;
  subtotalFormatted: string;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'digiecom_cart_v1';
const MAX_ITEM_QUANTITY = 99;

/**
 * Safely parse and validate cart data from localStorage.
 * Ensures corrupt, outdated or malicious JSON never crashes the application.
 */
function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const validatedItems: CartItem[] = [];

    for (const entry of parsed) {
      if (
        entry &&
        typeof entry === 'object' &&
        entry.product &&
        typeof entry.product === 'object' &&
        typeof entry.product.id === 'string' &&
        typeof entry.product.name === 'string' &&
        typeof entry.product.pricePaise === 'number' &&
        entry.product.pricePaise >= 0 &&
        typeof entry.quantity === 'number' &&
        entry.quantity > 0
      ) {
        validatedItems.push({
          product: entry.product as Product,
          quantity: Math.min(Math.floor(entry.quantity), MAX_ITEM_QUANTITY),
        });
      }
    }

    return validatedItems;
  } catch (err) {
    console.warn('Failed to parse DigiEcom cart from storage. Resetting to empty cart.', err);
    return [];
  }
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(loadCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to localStorage on cart change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to save DigiEcom cart to localStorage:', err);
    }
  }, [items]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const addItem = useCallback((product: Product, quantity = 1) => {
    const qtyToAdd = Math.max(1, Math.floor(quantity));

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const next = [...prevItems];
        const updatedQty = Math.min(next[existingIndex].quantity + qtyToAdd, MAX_ITEM_QUANTITY);
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: updatedQty,
        };
        return next;
      }

      return [
        ...prevItems,
        {
          product,
          quantity: Math.min(qtyToAdd, MAX_ITEM_QUANTITY),
        },
      ];
    });

    // Auto-open drawer to give visual confirmation
    setIsCartOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const normalizedQty = Math.floor(quantity);

    if (normalizedQty <= 0) {
      setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(normalizedQty, MAX_ITEM_QUANTITY) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Compute integer subtotal and total item count
  const { subtotalPaise, itemCount } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const validPrice =
          typeof item.product.pricePaise === 'number' && item.product.pricePaise >= 0
            ? item.product.pricePaise
            : 0;
        const validQty = Math.max(0, Math.floor(item.quantity));

        return {
          subtotalPaise: acc.subtotalPaise + validPrice * validQty,
          itemCount: acc.itemCount + validQty,
        };
      },
      { subtotalPaise: 0, itemCount: 0 }
    );
  }, [items]);

  const subtotalFormatted = useMemo(() => formatINR(subtotalPaise), [subtotalPaise]);

  const contextValue = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount,
      subtotalPaise,
      subtotalFormatted,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [
      items,
      itemCount,
      subtotalPaise,
      subtotalFormatted,
      isCartOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
};

const defaultCartContext: CartContextValue = {
  items: [],
  itemCount: 0,
  subtotalPaise: 0,
  subtotalFormatted: '₹0',
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
};

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    return defaultCartContext;
  }
  return context;
}
