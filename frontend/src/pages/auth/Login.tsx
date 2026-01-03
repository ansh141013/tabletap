import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Loader2, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Login() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast, dismiss } = useToast();
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
    const [error, setError] = useState<string | null>(null);

    // Clear error when inputs change
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (error) setError(null);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) setError(null);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
        if (error) setError(null);
    };

    // Check for existing session on mount
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                const redirectTo = searchParams.get('redirectTo');
                navigate(redirectTo || '/dashboard', { replace: true });
            }
        };
        checkSession();
    }, [navigate, searchParams]);

    // Handle Google OAuth
    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) throw error;
            // OAuth will redirect - no action needed here
        } catch (err: any) {
            setGoogleLoading(false);
            setError(err.message || "Could not sign in with Google.");
            toast({
                title: "Google Sign-In Failed",
                description: err.message || "Could not sign in with Google.",
                variant: "destructive"
            });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        dismiss(); // Clear any existing toasts

        try {
            let authError;
            if (loginMethod === 'email') {
                const res = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                authError = res.error;

                if (!authError && res.data.session) {
                    // Successfully authenticated - redirect
                    const redirectTo = searchParams.get('redirectTo');
                    navigate(redirectTo || '/dashboard', { replace: true });
                    return;
                }
            } else {
                // Phone login logic (OTP)
                const res = await supabase.auth.signInWithOtp({
                    phone: phone,
                });
                authError = res.error;

                if (!authError) {
                    toast({
                        title: "OTP Sent",
                        description: "Check your phone for the verification code.",
                    });
                    setLoading(false);
                    return;
                }
            }

            if (authError) {
                throw authError;
            }
        } catch (err: any) {
            let errorMessage = err.message || "Could not sign in.";

            // Provide helpful messages for common errors
            if (errorMessage.toLowerCase().includes("email not confirmed")) {
                errorMessage = "Please verify your email address before logging in. Check your inbox for the confirmation link.";
            } else if (errorMessage.toLowerCase().includes("invalid login credentials") ||
                errorMessage.toLowerCase().includes("invalid credentials")) {
                errorMessage = "Invalid email or password. Please check your credentials and try again.";
            } else if (errorMessage.toLowerCase().includes("user not found")) {
                errorMessage = "No account found with this email. Please create an account first.";
            }

            setError(errorMessage);
            toast({
                title: "Login Failed",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-8">
                <CardTitle className="text-2xl font-bold tracking-tight">Welcome to TableTap</CardTitle>
                <CardDescription className="text-base">Sign in to continue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Social Auth */}
                <Button
                    variant="outline"
                    className="w-full relative h-11 hover:bg-muted/50 transition-colors"
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading || loading}
                >
                    {googleLoading ? (
                        <Loader2 className="absolute left-4 h-5 w-5 animate-spin" />
                    ) : (
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="absolute left-4 h-5 w-5" alt="Google" />
                    )}
                    <span className="ml-2 font-medium">
                        {googleLoading ? 'Connecting...' : 'Continue with Google'}
                    </span>
                </Button>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
                    </div>
                </div>

                <div className="w-full">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {loginMethod === 'email' ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@example.com"
                                        required={loginMethod === 'email'}
                                        value={email}
                                        onChange={handleEmailChange}
                                        onFocus={() => error && setError(null)}
                                        className={`h-11 ${error ? 'border-destructive' : ''}`}
                                        autoComplete="email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <PasswordInput
                                        id="password"
                                        placeholder="••••••••"
                                        required={loginMethod === 'email'}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        onFocus={() => error && setError(null)}
                                        className={`h-11 ${error ? 'border-destructive' : ''}`}
                                        autoComplete="current-password"
                                    />
                                </div>
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => setLoginMethod('phone')}
                                        className="text-sm text-primary hover:underline font-medium"
                                    >
                                        Use mobile number (OTP)
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Mobile Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="+1 234 567 8900"
                                        required={loginMethod === 'phone'}
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        onFocus={() => error && setError(null)}
                                        className={`h-11 ${error ? 'border-destructive' : ''}`}
                                        autoComplete="tel"
                                    />
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Smartphone className="h-3 w-3" />
                                        We'll send you a One Time Password (OTP).
                                    </p>
                                </div>
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => setLoginMethod('email')}
                                        className="text-sm text-primary hover:underline font-medium"
                                    >
                                        Use email and password
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Inline error message */}
                        {error && (
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold active-scale"
                            size="lg"
                            disabled={loading || googleLoading || (loginMethod === 'email' && (!email || !password)) || (loginMethod === 'phone' && !phone)}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loginMethod === 'email' ? 'Continue' : 'Send Code'}
                        </Button>
                    </form>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 justify-center pb-8 pt-0">
                <Link to="/auth/register" className="text-sm font-semibold text-primary hover:underline transition-all">
                    Create a new account
                </Link>
                <Link to="/auth/forgot-password" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Forgot password?
                </Link>
            </CardFooter>
        </Card>
    );
}
