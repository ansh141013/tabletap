import React, { useState } from 'react';
import { categories, menuItems as initialMenuItems } from '@/data/mockData';
import { MenuItem } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plus, Search, Edit2, Image } from 'lucide-react';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = menuItems.filter(item => 
    item.category === selectedCategory &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleToggleAvailability = (itemId: string) => {
    setMenuItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  const handleSelectItem = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const handleUpdateItem = (field: keyof MenuItem, value: any) => {
    if (!selectedItem) return;
    const updated = { ...selectedItem, [field]: value };
    setSelectedItem(updated);
    setMenuItems(prev => prev.map(item => item.id === updated.id ? updated : item));
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel - Category & Items List */}
      <div className="w-96 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold mb-4">Menu Management</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="p-4 border-b border-border">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  'category-tab',
                  selectedCategory === cat.id && 'category-tab-active'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleSelectItem(item)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors',
                selectedItem?.id === item.id 
                  ? 'bg-accent/10 border border-accent' 
                  : 'bg-card border border-border hover:bg-secondary/50'
              )}
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{item.name}</span>
                  <Badge variant={item.isVeg ? 'veg' : 'nonveg'} className="h-4 w-4 p-0 flex items-center justify-center flex-shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
              </div>
              <div className={cn(
                'h-2 w-2 rounded-full flex-shrink-0',
                item.isAvailable ? 'bg-success' : 'bg-destructive'
              )} />
            </button>
          ))}
        </div>

        {/* Add New Button */}
        <div className="p-4 border-t border-border">
          <Button className="w-full" variant="accent">
            <Plus className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </div>
      </div>

      {/* Right Panel - Item Editor */}
      <div className="flex-1 overflow-y-auto">
        {selectedItem ? (
          <div className="p-8 max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Edit Item</h2>
              <Button variant="outline" size="sm">
                <Edit2 className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>

            <div className="space-y-6">
              {/* Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <div className="relative h-48 rounded-xl overflow-hidden bg-secondary">
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.name}
                    className="h-full w-full object-cover"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-4 right-4"
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Change Image
                  </Button>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name</label>
                <Input
                  value={selectedItem.name}
                  onChange={(e) => handleUpdateItem('name', e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={selectedItem.description}
                  onChange={(e) => handleUpdateItem('description', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={selectedItem.price}
                    onChange={(e) => handleUpdateItem('price', parseFloat(e.target.value) || 0)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => handleUpdateItem('category', cat.id)}
                      className={cn(
                        'category-tab',
                        selectedItem.category === cat.id && 'category-tab-active'
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium">Vegetarian</p>
                    <p className="text-sm text-muted-foreground">Mark as vegetarian item</p>
                  </div>
                  <Switch
                    checked={selectedItem.isVeg}
                    onCheckedChange={(checked) => handleUpdateItem('isVeg', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                  <div>
                    <p className="font-medium">Available</p>
                    <p className="text-sm text-muted-foreground">Show item on menu</p>
                  </div>
                  <Switch
                    checked={selectedItem.isAvailable}
                    onCheckedChange={(checked) => handleUpdateItem('isAvailable', checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p>Select an item to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}
