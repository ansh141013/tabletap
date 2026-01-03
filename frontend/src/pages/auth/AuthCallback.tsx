import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

/**
 * Auth Callback Component
 * Handles OAuth redirects (Google, etc.) and email confirmation links.
 * This component processes the auth tokens from the URL and establishes a session.
 */
export default function AuthCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the auth code or tokens from URL (handled automatically by Supabase)
                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Auth callback error:', error);
                    setError(error.message);
                    // Redirect to login with error after delay
                    setTimeout(() => {
                        navigate('/auth/login', {
                            replace: true,
                            state: { error: error.message }
                        });
                    }, 2000);
                    return;
                }

                if (data.session) {
                    // Successfully authenticated
                    // Check if user needs onboarding
                    const { data: profile } = await supabase
                        .from('users')
                        .select('username')
                        .eq('id', data.session.user.id)
                        .single();

                    if (!profile?.username) {
                        // New user - send to onboarding
                        navigate('/onboarding', { replace: true });
                    } else {
                        // Existing user - send to dashboard
                        const redirectTo = searchParams.get('redirectTo');
                        navigate(redirectTo || '/dashboard', { replace: true });
                    }
                } else {
                    // No session - check for hash fragment (token in URL)
                    // Supabase should handle this automatically via onAuthStateChange
                    // Wait a moment for the auth state to update
                    const { data: { subscription } } = supabase.auth.onAuthStateChange(
                        async (event, session) => {
                            if (event === 'SIGNED_IN' && session) {
                                subscription.unsubscribe();

                                // Check if user needs onboarding
                                const { data: profile } = await supabase
                                    .from('users')
                                    .select('username')
                                    .eq('id', session.user.id)
                                    .single();

                                if (!profile?.username) {
                                    navigate('/onboarding', { replace: true });
                                } else {
                                    navigate('/dashboard', { replace: true });
                                }
                            }
                        }
                    );

                    // Timeout if no auth event received
                    setTimeout(() => {
                        subscription.unsubscribe();
                        if (!error) {
                            setError('Authentication timeout. Please try again.');
                            navigate('/auth/login', { replace: true });
                        }
                    }, 10000);
                }
            } catch (err: any) {
                console.error('Auth callback exception:', err);
                setError(err.message || 'Authentication failed');
                setTimeout(() => {
                    navigate('/auth/login', { replace: true });
                }, 2000);
            }
        };

        handleAuthCallback();
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background">
            <div className="text-center space-y-4">
                {error ? (
                    <>
                        <div className="text-destructive text-lg font-medium">
                            {error}
                        </div>
                        <p className="text-muted-foreground">
                            Redirecting to login...
                        </p>
                    </>
                ) : (
                    <>
                        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                        <h2 className="text-xl font-semibold">Completing sign in...</h2>
                        <p className="text-muted-foreground">
                            Please wait while we verify your account.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
