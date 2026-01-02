import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, MenuItem, AddOn } from '@/types/menu';

interface CartContextType {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity: number, addOns: AddOn[], instructions?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('tabletap_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart from local storage', e);
      return [];
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('tabletap_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to local storage', e);
    }
  }, [items]);

  const addItem = (menuItem: MenuItem, quantity: number, addOns: AddOn[], instructions?: string) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item =>
        item.menuItem.id === menuItem.id &&
        JSON.stringify(item.selectedAddOns) === JSON.stringify(addOns)
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { menuItem, quantity, selectedAddOns: addOns, specialInstructions: instructions }];
    });
  };

  const removeItem = (menuItemId: string) => {
    setItems(prev => prev.filter(item => item.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menuItemId);
      return;
    }
    setItems(prev => prev.map(item =>
      item.menuItem.id === menuItemId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.menuItem.price + item.selectedAddOns.reduce((a, b) => a + b.price, 0);
    return sum + itemTotal * item.quantity;
  }, 0);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      totalItems,
      subtotal,
      tax,
      total,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
