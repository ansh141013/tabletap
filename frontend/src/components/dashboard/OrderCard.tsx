import React from 'react';
import { Order, OrderStatus } from '@/types/menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

const statusActions: Record<OrderStatus, { next: OrderStatus; label: string } | null> = {
  pending: { next: 'accepted', label: 'Accept' },
  accepted: { next: 'preparing', label: 'Start Preparing' },
  preparing: { next: 'ready', label: 'Mark Ready' },
  ready: { next: 'served', label: 'Mark Served' },
  served: null,
};

const getStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case 'pending': return 'pending';
    case 'accepted': return 'accent';
    case 'preparing': return 'preparing';
    case 'ready': return 'ready';
    case 'served': return 'served';
    default: return 'default';
  }
};

export function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const action = statusActions[order.status];

  return (
    <div className="order-card space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="table">Table {order.tableNumber}</Badge>
            <Badge variant={getStatusVariant(order.status)}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(order.createdAt, { addSuffix: true })}
          </p>
        </div>
        <span className="text-sm font-mono text-muted-foreground">{order.id}</span>
      </div>

      {/* Items */}
      <div className="space-y-2">
        {order.items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>
              <span className="font-medium">{item.quantity}x</span> {item.menuItem.name}
              {item.selectedAddOns.length > 0 && (
                <span className="text-muted-foreground text-xs block pl-5">
                  + {item.selectedAddOns.map(a => a.name).join(', ')}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Special Notes */}
      {order.items.some(i => i.specialInstructions) && (
        <div className="bg-warning/10 rounded-lg p-3 text-sm">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {order.items.filter(i => i.specialInstructions).map((item, idx) => (
                <p key={idx}>
                  <span className="font-medium">{item.menuItem.name}:</span>{' '}
                  <span className="text-muted-foreground italic">{item.specialInstructions}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      {action && (
        <Button
          variant={order.status === 'pending' ? 'accent' : 'default'}
          className="w-full"
          onClick={() => onStatusChange(order.id, action.next)}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
