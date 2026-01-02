-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Restaurants policies
CREATE POLICY "Anyone can view restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Owners can update their restaurants" ON public.restaurants FOR ALL USING (auth.uid() = owner_id);

-- Categories policies
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Owners can manage categories" ON public.categories FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.restaurants
        WHERE id = categories.restaurant_id AND owner_id = auth.uid()
    )
);

-- Menu Items policies
CREATE POLICY "Anyone can view menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Owners can manage menu items" ON public.menu_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.categories c
        JOIN public.restaurants r ON r.id = c.restaurant_id
        WHERE c.id = menu_items.category_id AND r.owner_id = auth.uid()
    )
);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can view their restaurant orders" ON public.orders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.restaurants
        WHERE id = orders.restaurant_id AND owner_id = auth.uid()
    )
);
CREATE POLICY "Owners can update their restaurant orders" ON public.orders FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.restaurants
        WHERE id = orders.restaurant_id AND owner_id = auth.uid()
    )
);

-- Order Items policies
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE id = order_items.order_id AND user_id = auth.uid()
    )
);
CREATE POLICY "Users can create their own order items" ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE id = order_items.order_id AND user_id = auth.uid()
    )
);
