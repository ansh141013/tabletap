import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Restaurant {
    id: string;
    name: string;
    slug: string;
    branding_color: string | null;
    logo_url: string | null;
}

interface RestaurantContextType {
    restaurant: Restaurant | null;
    isLoading: boolean;
    error: string | null;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                const restaurantId = import.meta.env.VITE_RESTAURANT_ID;

                if (!restaurantId) {
                    // Fallback or handle multi-tenant logic from URL in future
                    setError("No Restaurant ID configured");
                    setIsLoading(false);
                    return;
                }

                const { data, error } = await supabase
                    .from('restaurants')
                    .select('*')
                    .eq('id', restaurantId)
                    .single();

                if (error) throw error;
                setRestaurant(data);

                // Apply Theme
                if (data?.branding_color) {
                    applyTheme(data.branding_color);
                }

            } catch (err: any) {
                console.error('Error fetching restaurant:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRestaurant();
    }, []);

    const applyTheme = (color: string) => {
        if (!/^#[0-9A-F]{6}$/i.test(color)) return; // Simple hex validation

        const root = document.documentElement;

        // Convert hex to HSL for consistency with existing Tailwind variables if possible, 
        // OR just set the hex directly if the CSS variables support it. 
        // In index.css, variables like --accent are defined as HSL values (e.g., 142 76% 45%).
        // We need to convert Hex to HSL space-separated values.

        const hsl = hexToHSL(color);
        if (hsl) {
            root.style.setProperty('--accent', hsl);
            root.style.setProperty('--ring', hsl);
            // We can also set a lighter version for secondary/backgrounds if we want
        }
    };

    const hexToHSL = (H: string) => {
        // Convert hex to RGB first
        let r = 0, g = 0, b = 0;
        if (H.length === 4) {
            r = parseInt("0x" + H[1] + H[1]);
            g = parseInt("0x" + H[2] + H[2]);
            b = parseInt("0x" + H[3] + H[3]);
        } else if (H.length === 7) {
            r = parseInt("0x" + H[1] + H[2]);
            g = parseInt("0x" + H[3] + H[4]);
            b = parseInt("0x" + H[5] + H[6]);
        }
        // Then to HSL
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        if (delta === 0)
            h = 0;
        else if (cmax === r)
            h = ((g - b) / delta) % 6;
        else if (cmax === g)
            h = (b - r) / delta + 2;
        else
            h = (r - g) / delta + 4;

        h = Math.round(h * 60);
        if (h < 0) h += 360;

        l = (cmax + cmin) / 2;
        s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);

        return `${h} ${s}% ${l}%`;
    };

    return (
        <RestaurantContext.Provider value={{ restaurant, isLoading, error }}>
            {children}
        </RestaurantContext.Provider>
    );
}

export function useRestaurant() {
    const context = useContext(RestaurantContext);
    if (context === undefined) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
}
