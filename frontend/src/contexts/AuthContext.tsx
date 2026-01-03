import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const fetchProfile = useCallback(async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // Profile might not exist yet (race condition with trigger)
                // or user just signed up via OAuth
                console.warn('Profile not found, may need onboarding:', error.message);
                setProfile(null);
                return null;
            }

            setProfile(data);
            return data;
        } catch (err) {
            console.error('Error fetching profile:', err);
            return null;
        }
    }, []);

    const checkOnboarding = useCallback((profileData: any) => {
        // Skip onboarding check for public routes
        const publicPaths = ['/auth', '/menu', '/order-status', '/onboarding'];
        const isPublicRoute = publicPaths.some(path => location.pathname.startsWith(path));

        if (isPublicRoute) return;

        // If logged in but no username, redirect to onboarding
        if (!profileData?.username) {
            navigate('/onboarding', { replace: true });
        }
    }, [location.pathname, navigate]);

    useEffect(() => {
        let mounted = true;

        // 1. Get initial session
        const initializeAuth = async () => {
            try {
                const { data: { session: initialSession }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error);
                    if (mounted) setLoading(false);
                    return;
                }

                if (mounted) {
                    setSession(initialSession);
                    setUser(initialSession?.user ?? null);

                    if (initialSession?.user) {
                        const profileData = await fetchProfile(initialSession.user.id);
                        checkOnboarding(profileData);
                    }
                    setLoading(false);
                }
            } catch (err) {
                console.error('Auth initialization error:', err);
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event: AuthChangeEvent, currentSession: Session | null) => {
                if (!mounted) return;

                console.log('Auth state changed:', event, currentSession?.user?.email);

                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    const profileData = await fetchProfile(currentSession.user.id);

                    // Handle specific auth events
                    if (event === 'SIGNED_IN') {
                        // User just signed in - check if they need onboarding
                        if (!profileData?.username) {
                            navigate('/onboarding', { replace: true });
                        } else if (location.pathname.startsWith('/auth')) {
                            // Redirect from auth pages to dashboard
                            navigate('/dashboard', { replace: true });
                        }
                    }
                } else {
                    setProfile(null);

                    if (event === 'SIGNED_OUT') {
                        // Clear any cached data and navigate to auth
                        navigate('/auth', { replace: true });
                    }
                }

                setLoading(false);
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [fetchProfile, checkOnboarding, navigate, location.pathname]);

    const signOut = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
            setProfile(null);
            navigate('/auth', { replace: true });
        } catch (err) {
            console.error('Sign out error:', err);
        } finally {
            setLoading(false);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
            {!loading ? (
                children
            ) : (
                <div className="h-screen w-full flex items-center justify-center bg-background">
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
