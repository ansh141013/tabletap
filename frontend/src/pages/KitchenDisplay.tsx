import React from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, ArrowLeft, Volume2, VolumeX, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Order, CartItem, AddOn } from '@/types/menu';
import { useNavigate } from 'react-router-dom';
import { useOrderNotifications } from '@/hooks/useOrderNotifications';
import { Toaster } from '@/components/ui/toaster';

export default function KitchenDisplay() {
  const { orders, updateOrderStatus, isLoading } = useOrders();
  const navigate = useNavigate();
  const { soundEnabled, toggleSound, testSound } = useOrderNotifications(orders);

  // Filter to show only orders that need kitchen attention
  const kitchenOrders = orders.filter((o: Order) =>
    o.status === 'accepted' || o.status === 'preparing'
  );

  const handleMarkPrepared = (orderId: string) => {
    updateOrderStatus(orderId, 'ready');
  };

  return (
    <div className="min-h-screen bg-primary text-primary-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary/95 backdrop-blur-sm border-b border-primary-foreground/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate('/dashboard')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Kitchen Display</h1>
              <p className="text-sm text-primary-foreground/70">
                {kitchenOrders.length} active order{kitchenOrders.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={testSound}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Bell className="h-4 w-4 mr-2" />
              Test Sound
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSound}
              className={`${soundEnabled ? 'text-accent' : 'text-primary-foreground/50'} hover:bg-primary-foreground/10`}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
              <Clock className="h-4 w-4" />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </header>

      {/* Orders Grid */}
      <main className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-card border border-border/50 rounded-xl p-5 h-80 flex flex-col justify-between animate-pulse">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="h-8 w-24 bg-muted rounded" />
                    <div className="h-4 w-16 bg-muted rounded" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-5 w-3/4 bg-muted rounded" />
                    <div className="h-5 w-1/2 bg-muted rounded" />
                    <div className="h-5 w-2/3 bg-muted rounded" />
                  </div>
                </div>
                <div className="h-10 w-full bg-muted rounded mt-4" />
              </div>
            ))}
          </div>
        ) : kitchenOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h2 className="text-2xl font-semibold mb-2">All Caught Up!</h2>
            <p className="text-primary-foreground/70">No orders to prepare right now</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {kitchenOrders.map((order: Order) => (
              <div
                key={order.id}
                className="kitchen-card bg-card text-card-foreground"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="table" className="text-lg px-4 py-1.5">
                    Table {order.tableNumber}
                  </Badge>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-mono">{order.id}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(order.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.items.map((item: CartItem, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-start gap-3">
                        <span className="text-xl font-bold text-accent min-w-[2rem]">
                          {item.quantity}x
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-lg">{item.menuItem.name}</p>
                          {item.selectedAddOns.length > 0 && (
                            <p className="text-sm text-muted-foreground">
                              + {item.selectedAddOns.map((a: AddOn) => a.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      {item.specialInstructions && (
                        <div className="ml-11 p-2 bg-warning/10 rounded-lg border border-warning/20">
                          <p className="text-sm text-warning font-medium">
                            ⚠️ {item.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  variant="kitchen"
                  className="w-full"
                  onClick={() => handleMarkPrepared(order.id)}
                >
                  <Check className="h-5 w-5 mr-2" />
                  Mark Prepared
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      <Toaster />
    </div>
  );
}