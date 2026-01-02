import React, { useState } from 'react';
import { MenuItem, AddOn } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Minus, Plus, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface ItemCustomizationModalProps {
  item: MenuItem;
  onClose: () => void;
}

export function ItemCustomizationModal({ item, onClose }: ItemCustomizationModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [instructions, setInstructions] = useState('');
  const { addItem } = useCart();

  const toggleAddOn = (addOn: AddOn) => {
    setSelectedAddOns(prev =>
      prev.some(a => a.id === addOn.id)
        ? prev.filter(a => a.id !== addOn.id)
        : [...prev, addOn]
    );
  };

  const calculateTotal = () => {
    const addOnTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    return (item.price + addOnTotal) * quantity;
  };

  const handleAddToCart = () => {
    addItem(item, quantity, selectedAddOns, instructions || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-elevated animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header Image */}
        <div className="relative h-56 flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="absolute top-4 right-4 bg-card/80 backdrop-blur hover:bg-card"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2">
              <Badge variant={item.isVeg ? 'veg' : 'nonveg'} className="h-5 w-5 p-0 flex items-center justify-center">
                <span className="h-2 w-2 rounded-full bg-current" />
              </Badge>
              <span className="text-sm text-primary-foreground/80">
                {item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-primary-foreground">{item.name}</h2>
            <p className="text-lg font-semibold text-primary-foreground/90">${item.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <p className="text-muted-foreground">{item.description}</p>

          {/* Quantity Selector */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold text-lg">{quantity}</span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setQuantity(q => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Add-ons */}
          {item.addOns && item.addOns.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">Add-ons</h3>
              <div className="space-y-2">
                {item.addOns.map((addOn) => (
                  <label
                    key={addOn.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-secondary/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedAddOns.some(a => a.id === addOn.id)}
                        onCheckedChange={() => toggleAddOn(addOn)}
                      />
                      <span>{addOn.name}</span>
                    </div>
                    <span className="text-muted-foreground">+${addOn.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2">
            <label className="font-medium">Special Instructions</label>
            <Textarea
              placeholder="Any allergies or preferences..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="flex-shrink-0 p-4 border-t border-border bg-card shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
          <Button
            variant="accent"
            size="lg"
            className="w-full h-14 text-lg shadow-md"
            onClick={handleAddToCart}
          >
            Add to Cart — ${calculateTotal().toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
