import React, { useState } from 'react';
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
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let error;
            if (loginMethod === 'email') {
                const res = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                error = res.error;
            } else {
                // Phone login logic
                const res = await supabase.auth.signInWithOtp({
                    phone: phone,
                });
                error = res.error;

                if (!error) {
                    toast({
                        title: "OTP Sent",
                        description: "Check your phone for the code. (OTP Flow partially implemented)",
                    });
                    setLoading(false);
                    return;
                }
            }

            if (error) {
                throw error;
            }

            // Check for redirect URL
            const redirectTo = searchParams.get('redirectTo');
            navigate(redirectTo || '/dashboard');
        } catch (error: any) {
            let errorMessage = error.message || "Could not sign in.";

            // Helpful message for unverified emails
            if (errorMessage.includes("Email not confirmed")) {
                errorMessage = "Please verify your email address before logging in. Check your inbox for the confirmation link.";
            }

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
                <Button variant="outline" className="w-full relative h-11 hover:bg-muted/50 transition-colors" type="button">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="absolute left-4 h-5 w-5" alt="Google" />
                    <span className="ml-2 font-medium">Continue with Google</span>
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
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <PasswordInput
                                        id="password"
                                        placeholder="••••••••"
                                        required={loginMethod === 'email'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-11"
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
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="h-11"
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

                        <Button
                            type="submit"
                            className="w-full h-11 text-base font-semibold active-scale"
                            size="lg"
                            disabled={loading || (loginMethod === 'email' && (!email || !password)) || (loginMethod === 'phone' && !phone)}
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
