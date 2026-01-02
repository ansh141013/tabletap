import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { restaurantInfo } from '@/data/mockData';
import { MenuItem } from '@/types/menu';
import { CategoryTabs } from '@/components/customer/CategoryTabs';
import { MenuItemCard } from '@/components/customer/MenuItemCard';
import { ItemCustomizationModal } from '@/components/customer/ItemCustomizationModal';
import { CartSheet } from '@/components/customer/CartSheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Loader2, Sparkles } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useOrders } from '@/contexts/OrderContext';
import { useMenu } from '@/hooks/useMenu';
import { useAuth } from '@/contexts/AuthContext';

export default function CustomerMenu() {
  const [searchParams] = useSearchParams();
  const tableFromUrl = searchParams.get('table');
  const tableNumber = tableFromUrl ? parseInt(tableFromUrl, 10) : restaurantInfo.tableNumber;

  const { categories, menuItems, isLoading, error } = useMenu();
  const { profile } = useAuth();

  const [activeCategory, setActiveCategory] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showCart, setShowCart] = useState(false);
  const { totalItems, items, subtotal, tax, total, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const navigate = useNavigate();

  // Set initial active category when data loads
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  // Personalization Logic
  interface PersonalizedMenuItem extends MenuItem {
    isRecommended: boolean;
    recommendationReason?: string;
  }

  const personalizedItems: PersonalizedMenuItem[] = filteredItems.map(item => {
    let score = 0;
    let reason = '';

    if (profile?.preferences) {
      const p = profile.preferences;
      // Veg Check
      if (p.isVeg && !item.isVeg) return { ...item, isRecommended: false }; // Strict filter? Or just lower rank?
      // If strictly veg user, maybe hide non-veg? The prompt says "Personalized labels... Recommended".
      // Let's keep them but not recommend.

      if (p.isVeg && item.isVeg) score += 2;
      // Spicy
      // We need accurate data for 'isSpicy'. Mock/Supabase data might not have it yet.
      // Assuming description check for now or random for demo if data missing.
      if (p.spicyLover && (item.description.toLowerCase().includes('spicy') || item.description.toLowerCase().includes('chili'))) {
        score += 2;
        reason = 'Spicy pick';
      }
      if (p.sweetTooth && item.category === 'Desserts') { // simplistic check
        score += 2;
        reason = 'For your sweet tooth';
      }
    }

    return {
      ...item,
      isRecommended: score >= 2,
      recommendationReason: reason
    };
  });

  const sortedItems = personalizedItems.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    if (!profile) {
      // Guest User: Redirect to Login with return path
      // Cart is already in local storage, so it persists.
      navigate(`/login?redirectTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    try {
      const order = await placeOrder({
        tableNumber: tableNumber,
        items: items,
        subtotal,
        tax,
        total,
      });

      if (order) {
        clearCart();
        setShowCart(false);
        navigate('/order-status');
      } else {
        console.error("Failed to place order");
      }
    } catch (error) {
      console.error("Unexpected error placing order:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-full animate-pulse" /> {/* Logo */}
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" /> {/* Name */}
                  <div className="h-3 w-20 bg-muted rounded animate-pulse" /> {/* Table info */}
                </div>
              </div>
            </div>
          </div>
          {/* Category Tabs Skeleton */}
          <div className="px-4 pb-3 flex gap-2 overflow-x-hidden">
            {[1, 2, 3, 4].map(k => (
              <div key={k} className="h-8 w-24 bg-muted rounded-full animate-pulse flex-shrink-0" />
            ))}
          </div>
        </header>

        {/* Menu Items Skeleton */}
        <main className="px-4 py-4 space-y-4">
          {/* Personalization hint skeleton */}
          <div className="h-4 w-48 bg-muted rounded animate-pulse mb-6" />

          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-4 p-4 rounded-xl border border-border bg-card">
              {/* Image */}
              <div className="h-24 w-24 bg-muted rounded-lg animate-pulse flex-shrink-0" />
              {/* Content */}
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                <div className="h-3 w-full bg-muted rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                <div className="flex justify-between items-end mt-2">
                  <div className="h-5 w-16 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Menu</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{restaurantInfo.logo}</span>
              <div>
                <h1 className="font-semibold text-lg leading-tight">{restaurantInfo.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="table" className="mt-1">Table {tableNumber}</Badge>
                  {profile?.username && <span className="text-xs text-muted-foreground mt-1">Hi, {profile.username}</span>}
                </div>
              </div>
            </div>
            {/* If logged in, maybe Avatar? */}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 pb-3">
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>
      </header>

      {/* Menu Items */}
      <main className="px-4 py-4 space-y-4">
        {profile?.preferences && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-accent" />
            <span>Menu personalized for you</span>
          </div>
        )}

        {sortedItems.map(item => (
          <div key={item.id} className="relative">
            {item.isRecommended && (
              <div className="absolute -top-2 -right-2 z-10">
                <Badge variant="accent" className="shadow-soft animate-pulse">
                  {item.recommendationReason || "Recommended"}
                </Badge>
              </div>
            )}
            <MenuItemCard
              item={item}
              onAddClick={setSelectedItem}
            />
          </div>
        ))}
      </main>

      {/* Floating Cart Button (Sticky Action) */}
      <div
        className={`fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent z-50 transform transition-all duration-200 ${totalItems > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}
      >
        <div className="max-w-md mx-auto">
          <Button
            variant="accent"
            size="lg"
            className="w-full shadow-elevated h-14 text-lg"
            onClick={() => setShowCart(true)}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <span>{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
            </div>
            <span className="ml-auto font-bold">${total.toFixed(2)}</span>
            <div className="ml-2 pl-2 border-l border-primary-foreground/20 text-sm font-normal">View Cart</div>
          </Button>
        </div>
      </div>

      {/* Item Customization Modal */}
      {selectedItem && (
        <ItemCustomizationModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Cart Sheet */}
      {showCart && (
        <CartSheet
          onClose={() => setShowCart(false)}
          onPlaceOrder={handlePlaceOrder}
        />
      )}
    </div>
  );
}
