import { useEffect, useState } from 'react';
import { supabase, RESTAURANT_ID } from '@/lib/supabase';
import { Category, MenuItem, AddOn } from '@/types/menu';

export function useMenu() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMenu() {
            if (!RESTAURANT_ID) {
                setError('Restaurant ID not configured');
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);

                // 1. Fetch Categories
                const { data: catsData, error: catsError } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('restaurant_id', RESTAURANT_ID)
                    .order('sort_order');

                if (catsError) throw catsError;

                // 2. Fetch Menu Items
                const { data: itemsData, error: itemsError } = await supabase
                    .from('menu_items')
                    .select('*')
                    .eq('restaurant_id', RESTAURANT_ID)
                    .eq('is_available', true);

                if (itemsError) throw itemsError;

                // 3. Fetch Modifiers (Add-ons)
                // We need to:
                // a. Get all modifiers linked to these menu items (menu_item_modifiers)
                // b. Get the modifier details (modifiers table) - optional if we just want options
                // c. Get the specific options (modifier_options table)

                // Get IDs of fetched items
                const itemIds = itemsData.map(i => i.id);

                const { data: mimData, error: mimError } = await supabase
                    .from('menu_item_modifiers')
                    .select('menu_item_id, modifier_id')
                    .in('menu_item_id', itemIds);

                if (mimError) throw mimError;

                const modifierIds = [...new Set(mimData?.map(m => m.modifier_id) || [])];

                let allOptions: any[] = [];
                let modifiersMap = new Map();

                if (modifierIds.length > 0) {
                    // Get Modifiers to know the group name
                    const { data: modData, error: modError } = await supabase
                        .from('modifiers')
                        .select('id, name')
                        .in('id', modifierIds);

                    if (modError) throw modError;
                    modData?.forEach(m => modifiersMap.set(m.id, m.name));

                    // Get Options
                    const { data: optData, error: optError } = await supabase
                        .from('modifier_options')
                        .select('*')
                        .in('modifier_id', modifierIds)
                        .eq('is_available', true);

                    if (optError) throw optError;
                    allOptions = optData || [];
                }

                // Map Categories
                const mappedCategories: Category[] = catsData.map(c => ({
                    id: c.id,
                    name: c.name,
                }));

                // Map Menu Items
                const mappedItems: MenuItem[] = itemsData.map(i => {
                    // Find modifiers for this item
                    const itemModIds = mimData?.filter(m => m.menu_item_id === i.id).map(m => m.modifier_id) || [];

                    // Allow flattening options into AddOns
                    const itemAddOns: AddOn[] = [];

                    itemModIds.forEach(modId => {
                        const groupName = modifiersMap.get(modId);
                        const options = allOptions.filter(o => o.modifier_id === modId);

                        options.forEach(opt => {
                            itemAddOns.push({
                                id: opt.id,
                                name: `${groupName ? groupName + ': ' : ''}${opt.name}`,
                                price: Number(opt.price_adjustment)
                            });
                        });
                    });

                    return {
                        id: i.id,
                        name: i.name,
                        description: i.description,
                        price: Number(i.price),
                        image: i.image_url,
                        category: i.category_id,
                        isVeg: (i.dietary_info as any)?.isVeg || false,
                        isAvailable: i.is_available,
                        addOns: itemAddOns,
                    };
                });

                setCategories(mappedCategories);
                setMenuItems(mappedItems);
            } catch (err: any) {
                console.error('Error fetching menu:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMenu();
    }, []);

    return { categories, menuItems, isLoading, error };
}
