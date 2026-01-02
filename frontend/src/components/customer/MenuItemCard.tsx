import React from 'react';
import { MenuItem } from '@/types/menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface MenuItemCardProps {
  item: MenuItem;
  onAddClick: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onAddClick }: MenuItemCardProps) {
  return (
    <div className="menu-card flex gap-4 p-4">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl active-scale transition-transform">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="text-xs font-medium text-muted-foreground">Unavailable</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground leading-tight">{item.name}</h3>
            <Badge variant={item.isVeg ? 'veg' : 'nonveg'} className="h-5 w-5 p-0 flex items-center justify-center">
              <span className="h-2 w-2 rounded-full bg-current" />
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-foreground">${item.price.toFixed(2)}</span>
          <Button
            size="sm"
            variant="accent"
            onClick={() => onAddClick(item)}
            disabled={!item.isAvailable}
            className="h-8 gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
