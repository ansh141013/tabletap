import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, OrderStatus, CartItem, MenuItem, AddOn } from '@/types/menu';
import { supabase, RESTAURANT_ID } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  placeOrder: (order: { tableNumber: number; items: CartItem[]; subtotal: number; tax: number; total: number }) => Promise<Order | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  setCurrentOrder: (order: Order | null) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all orders (active)
  const fetchOrders = async () => {
    try {
      if (!RESTAURANT_ID) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          tables(table_number),
          order_items (
            quantity,
            item_price,
            notes,
            menu_items (id, name, description, price, image_url, category_id, is_available, dietary_info),
            order_item_modifiers (
              modifier_options (id, name, price_adjustment)
            )
          )
        `)
        .eq('restaurant_id', RESTAURANT_ID)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      // Map Supabase response to Order type
      const mappedOrders: Order[] = data.map((o: any) => ({
        id: o.id,
        tableNumber: o.tables?.table_number || 0,
        status: o.status as OrderStatus,
        createdAt: new Date(o.created_at),
        subtotal: Number(o.total_amount), // Approximate, or recalculate
        tax: 0, // Not stored in top level typically, assume included or recalc
        total: Number(o.total_amount),
        items: o.order_items.map((oi: any) => ({
          menuItem: {
            id: oi.menu_items.id,
            name: oi.menu_items.name,
            description: oi.menu_items.description,
            price: Number(oi.menu_items.price),
            image: oi.menu_items.image_url,
            category: oi.menu_items.category_id,
            isVeg: (oi.menu_items.dietary_info as any)?.isVeg,
            isAvailable: oi.menu_items.is_available,
          },
          quantity: oi.quantity,
          specialInstructions: oi.notes,
          selectedAddOns: oi.order_item_modifiers.map((oim: any) => ({
            id: oim.modifier_options.id,
            name: oim.modifier_options.name,
            price: Number(oim.modifier_options.price_adjustment)
          }))
        }))
      }));

      setOrders(mappedOrders);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to changes
  useEffect(() => {
    fetchOrders();

    const channel: RealtimeChannel = supabase
      .channel('tabletap-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `restaurant_id=eq.${RESTAURANT_ID}` },
        () => {
          fetchOrders(); // Refetch full data on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const placeOrder = async (orderData: { tableNumber: number; items: CartItem[]; subtotal: number; tax: number; total: number }) => {
    try {
      if (!RESTAURANT_ID) throw new Error('No Restaurant ID');

      // 1. Get Table ID
      const { data: tableData, error: tableError } = await supabase
        .from('tables')
        .select('id')
        .eq('restaurant_id', RESTAURANT_ID)
        .eq('table_number', orderData.tableNumber)
        .single();

      let tableId = tableData?.id;

      if (!tableId) {
        // If table doesn't exist, maybe create it or handle error. 
        // For now, let's use the first table found or error.
        console.warn(`Table ${orderData.tableNumber} not found.`);
        const { data: anyTable } = await supabase.from('tables').select('id').eq('restaurant_id', RESTAURANT_ID).limit(1).single();
        tableId = anyTable?.id;
        if (!tableId) throw new Error("No tables configured");
      }

      // 2. Create Order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          restaurant_id: RESTAURANT_ID,
          table_id: tableId,
          status: 'pending',
          total_amount: orderData.total
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Create Order Items & Modifiers
      for (const item of orderData.items) {
        const { data: orderItem, error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: newOrder.id,
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            item_price: item.menuItem.price,
            notes: item.specialInstructions || null
          })
          .select()
          .single();

        if (itemError) throw itemError;

        if (item.selectedAddOns && item.selectedAddOns.length > 0) {
          const modifierInserts = item.selectedAddOns.map(addon => ({
            order_item_id: orderItem.id,
            modifier_option_id: addon.id,
            price_adjustment: addon.price
          }));

          const { error: modError } = await supabase
            .from('order_item_modifiers')
            .insert(modifierInserts);

          if (modError) throw modError;
        }
      }

      // 4. Update local state (optimistic or wait for subscription)
      // Since we subscribe, we might not need to manually add it, but for UI responsiveness:
      // We will rely on fetchOrders triggered by subscription or call it manually
      fetchOrders();

      const constructedOrder: Order = {
        id: newOrder.id,
        tableNumber: orderData.tableNumber,
        items: orderData.items,
        status: 'pending',
        createdAt: new Date(newOrder.created_at),
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        total: orderData.total
      };

      setCurrentOrder(constructedOrder);
      return constructedOrder;

    } catch (err) {
      console.error('Failed to place order:', err);
      return null;
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      // State update handled by subscription
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      currentOrder,
      isLoading,
      placeOrder,
      updateOrderStatus,
      setCurrentOrder,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
