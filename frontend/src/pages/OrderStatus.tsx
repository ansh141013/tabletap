import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import { OrderStatusTracker } from '@/components/customer/OrderStatusTracker';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function OrderStatus() {
  const { currentOrder } = useOrders();
  const navigate = useNavigate();

  const handleCallWaiter = () => {
    toast({
      title: "Waiter Called",
      description: "A staff member will be with you shortly.",
    });
  };

  const handleRequestBill = () => {
    toast({
      title: "Bill Requested",
      description: "Your bill is being prepared.",
    });
  };

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">No Active Order</h1>
        <p className="text-muted-foreground mb-6">You haven't placed an order yet.</p>
        <Button onClick={() => navigate('/')}>
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Order Status</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <OrderStatusTracker
          order={currentOrder}
          onCallWaiter={handleCallWaiter}
          onRequestBill={handleRequestBill}
        />
      </main>
    </div>
  );
}
