import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartSheetProps {
  onClose: () => void;
  onPlaceOrder: () => void;
}

export function CartSheet({ onClose, onPlaceOrder }: CartSheetProps) {
  const { items, updateQuantity, removeItem, subtotal, tax, total, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
        <div
          className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
          onClick={onClose}
        />
        <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-elevated animate-slide-up p-8 text-center">
          <div className="mx-auto h-20 w-20 bg-success/10 rounded-full flex items-center justify-center mb-4 animate-check">
            <div className="h-10 w-10 bg-success rounded-full flex items-center justify-center shadow-soft">
              <Check className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-muted-foreground mb-6">Your food needs a moment to prepare.</p>
          <Button onClick={onClose} className="w-full h-12 text-lg active-scale">Track Status</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-elevated animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 p-6 pb-4 border-b border-border">
          <h2 className="text-xl font-semibold">Your Order</h2>
          <p className="text-sm text-muted-foreground">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.map((cartItem, index) => (
            <div key={`${cartItem.menuItem.id}-${index}`} className="flex gap-4 p-4 bg-secondary/50 rounded-xl">
              <img
                src={cartItem.menuItem.image}
                alt={cartItem.menuItem.name}
                className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{cartItem.menuItem.name}</h4>
                {cartItem.selectedAddOns.length > 0 && (
                  <p className="text-xs text-muted-foreground truncate">
                    + {cartItem.selectedAddOns.map(a => a.name).join(', ')}
                  </p>
                )}
                {cartItem.specialInstructions && (
                  <p className="text-xs text-muted-foreground italic truncate">
                    "{cartItem.specialInstructions}"
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-medium">{cartItem.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      className="h-7 w-7"
                      onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      ${((cartItem.menuItem.price + cartItem.selectedAddOns.reduce((a, b) => a + b.price, 0)) * cartItem.quantity).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeItem(cartItem.menuItem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Price Breakdown & CTA */}
        <div className="flex-shrink-0 p-6 pt-4 border-t border-border bg-card space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Button
            variant="accent"
            size="lg"
            className="w-full h-14 text-lg shadow-md"
            onClick={onPlaceOrder}
          >
            Place Order — ${total.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
