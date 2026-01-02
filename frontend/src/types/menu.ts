export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  addOns?: AddOn[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  selectedAddOns: AddOn[];
  specialInstructions?: string;
}

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  status: OrderStatus;
  createdAt: Date;
  specialNotes?: string;
  subtotal: number;
  tax: number;
  total: number;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'served';

export interface Category {
  id: string;
  name: string;
  icon?: string;
}
