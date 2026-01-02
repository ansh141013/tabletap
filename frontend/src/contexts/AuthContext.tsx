import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                // If profile doesn't exist (race condition with trigger), retry or ignore
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
                // Onboarding Check
                if (data && !data.username && !location.pathname.startsWith('/onboarding') && !location.pathname.startsWith('/auth')) {
                    // Redirect to onboarding if no username (and not already there)
                    // But allows public customer menu? 
                    // The constraint says: "Block all core app actions until username is set"
                    // Assuming customer menu doesn't need login, but if logged in, must onboard.
                    // For now, let's force onboarding if logged in.
                    navigate('/onboarding');
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut }}>
            {!loading ? children : <div className="h-screen w-full flex items-center justify-center">Loading...</div>}
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
