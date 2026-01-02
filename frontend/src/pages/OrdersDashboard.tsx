import React from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { OrderCard } from '@/components/dashboard/OrderCard';
import { OrderStatus } from '@/types/menu';
import { Badge } from '@/components/ui/badge';

export default function OrdersDashboard() {
  const { orders, updateOrderStatus } = useOrders();

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'accepted' || o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const servedOrders = orders.filter(o => o.status === 'served');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage incoming orders in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Pending Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Pending</h2>
            <Badge variant="pending">{pendingOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
            ))}
            {pendingOrders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 bg-card rounded-xl border border-dashed border-border">
                No pending orders
              </p>
            )}
          </div>
        </div>

        {/* Preparing Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Preparing</h2>
            <Badge variant="preparing">{preparingOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {preparingOrders.map(order => (
              <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
            ))}
            {preparingOrders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 bg-card rounded-xl border border-dashed border-border">
                No orders preparing
              </p>
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Ready</h2>
            <Badge variant="ready">{readyOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {readyOrders.map(order => (
              <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
            ))}
            {readyOrders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 bg-card rounded-xl border border-dashed border-border">
                No orders ready
              </p>
            )}
          </div>
        </div>

        {/* Served Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold">Served</h2>
            <Badge variant="served">{servedOrders.length}</Badge>
          </div>
          <div className="space-y-4">
            {servedOrders.slice(0, 5).map(order => (
              <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
            ))}
            {servedOrders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8 bg-card rounded-xl border border-dashed border-border">
                No served orders
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
