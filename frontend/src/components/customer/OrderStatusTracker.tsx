import React from 'react';
import { Order, OrderStatus } from '@/types/menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Clock, ChefHat, UtensilsCrossed, Bell, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderStatusTrackerProps {
  order: Order;
  onCallWaiter: () => void;
  onRequestBill: () => void;
}

const statusSteps: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'accepted', label: 'Accepted', icon: <Check className="h-4 w-4" /> },
  { status: 'preparing', label: 'Preparing', icon: <ChefHat className="h-4 w-4" /> },
  { status: 'ready', label: 'Ready', icon: <UtensilsCrossed className="h-4 w-4" /> },
  { status: 'served', label: 'Served', icon: <Check className="h-4 w-4" /> },
];

const statusOrder: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'served'];

export function OrderStatusTracker({ order, onCallWaiter, onRequestBill }: OrderStatusTrackerProps) {
  const currentStatusIndex = statusOrder.indexOf(order.status);

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

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="text-center space-y-2">
        <Badge variant="table" className="text-base px-4 py-1.5">
          Table {order.tableNumber}
        </Badge>
        <h1 className="text-2xl font-bold">Order {order.id}</h1>
        <Badge variant={getStatusVariant(order.status)} className="text-sm">
          {order.status === 'pending' ? 'Waiting for confirmation' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </div>

      {/* Status Timeline */}
      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <h3 className="font-semibold mb-4">Order Progress</h3>
        <div className="relative">
          {statusSteps.map((step, index) => {
            const stepIndex = statusOrder.indexOf(step.status);
            const isCompleted = currentStatusIndex >= stepIndex;
            const isCurrent = order.status === step.status;

            return (
              <div key={step.status} className="flex items-center gap-4">
                <div className="relative flex flex-col items-center">
                  <div
                    className={cn(
                      'h-10 w-10 rounded-full flex items-center justify-center transition-all',
                      isCompleted ? 'bg-accent text-accent-foreground' : 'bg-secondary text-muted-foreground',
                      isCurrent && 'ring-4 ring-accent/30 animate-pulse-soft'
                    )}
                  >
                    {step.icon}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div
                      className={cn(
                        'w-0.5 h-8 my-1',
                        currentStatusIndex > stepIndex ? 'bg-accent' : 'bg-border'
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <p className={cn(
                    'font-medium',
                    isCompleted ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    {step.label}
                  </p>
                  {isCurrent && order.status !== 'served' && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" /> In progress...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-card rounded-2xl p-6 shadow-soft">
        <h3 className="font-semibold mb-4">Order Summary</h3>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.menuItem.name}
                {item.selectedAddOns.length > 0 && (
                  <span className="text-muted-foreground"> (+{item.selectedAddOns.length} add-ons)</span>
                )}
              </span>
              <span className="font-medium">
                ${((item.menuItem.price + item.selectedAddOns.reduce((a, b) => a + b.price, 0)) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="border-t border-border pt-3 mt-3 space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCallWaiter}>
          <Bell className="h-4 w-4 mr-2" />
          Call Waiter
        </Button>
        <Button variant="outline" className="flex-1" onClick={onRequestBill}>
          <Receipt className="h-4 w-4 mr-2" />
          Request Bill
        </Button>
      </div>
    </div>
  );
}
