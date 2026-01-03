import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

export default function Register() {
    const navigate = useNavigate();
    const { toast, dismiss } = useToast();
    const [loading, setLoading] = useState(false);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [requiresEmailConfirmation, setRequiresEmailConfirmation] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
        if (error) setError(null);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        dismiss();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            toast({
                title: "Passwords do not match",
                variant: "destructive"
            });
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            toast({
                title: "Password too short",
                description: "Password must be at least 6 characters",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        full_name: formData.fullName,
                        phone: formData.phone,
                    }
                }
            });

            if (signUpError) throw signUpError;

            // Check if email confirmation is required
            if (data.session) {
                // Email confirmation disabled - user is automatically logged in
                toast({
                    title: "Account Created!",
                    description: "Welcome to TableTap! Setting up your profile...",
                });
                // Redirect to onboarding
                navigate('/onboarding', { replace: true });
            } else if (data.user && !data.session) {
                // Email confirmation required
                setRequiresEmailConfirmation(true);
                setRegistrationComplete(true);
            } else {
                // Unexpected state
                throw new Error("Registration failed. Please try again.");
            }

        } catch (err: any) {
            let errorMessage = err.message || "Could not create account.";

            // Handle common errors
            if (errorMessage.toLowerCase().includes("already registered") ||
                errorMessage.toLowerCase().includes("user already exists")) {
                errorMessage = "An account with this email already exists. Please sign in instead.";
            }

            setError(errorMessage);
            toast({
                title: "Registration Failed",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    // Show confirmation screen after successful registration (email confirmation required)
    if (registrationComplete && requiresEmailConfirmation) {
        return (
            <Card className="w-full border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
                <CardHeader className="space-y-1 text-center pb-6">
                    <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                        <CheckCircle2 className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Check Your Email</CardTitle>
                    <CardDescription className="text-base">
                        We've sent a verification link to
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="font-medium text-lg">{formData.email}</p>
                    <p className="text-muted-foreground text-sm">
                        Click the link in your email to verify your account and complete registration.
                    </p>
                    <div className="pt-4 space-y-2 text-sm text-muted-foreground">
                        <p>Didn't receive the email?</p>
                        <p>Check your spam folder or try registering again.</p>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 justify-center pb-8 pt-2">
                    <Link to="/auth/login" className="text-sm font-semibold text-primary hover:underline transition-all">
                        Back to Sign In
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full border-border/50 shadow-xl bg-card/50 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-6">
                <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
                <CardDescription className="text-base">Join TableTap to order smarter.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            placeholder="John Doe"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            onFocus={() => error && setError(null)}
                            autoComplete="name"
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={() => error && setError(null)}
                            autoComplete="email"
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Mobile Number (Optional)</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1234567890"
                            value={formData.phone}
                            onChange={handleChange}
                            autoComplete="tel"
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <PasswordInput
                            id="password"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => error && setError(null)}
                            autoComplete="new-password"
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <PasswordInput
                            id="confirmPassword"
                            placeholder="••••••••"
                            required
                            minLength={6}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onFocus={() => error && setError(null)}
                            autoComplete="new-password"
                            className="h-11"
                        />
                    </div>

                    {/* Inline error message */}
                    {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full h-11" size="lg" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Create Account
                    </Button>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 justify-center pb-8 pt-2">
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="font-semibold text-primary hover:underline">
                        Sign In
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
