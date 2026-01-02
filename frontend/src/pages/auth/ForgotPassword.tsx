import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPassword() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`, // Need a reset page ideally
            });

            if (error) throw error;
            setSent(true);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="text-center space-y-6">
                <h1 className="text-2xl font-bold">Check your email</h1>
                <p className="text-muted-foreground">
                    We have sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
                </p>
                <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                    Try another email
                </Button>
                <Link to="/auth/login" className="block text-sm text-muted-foreground hover:text-foreground">
                    Back to Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Link to="/auth/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
                </Link>
                <h1 className="text-2xl font-bold">Forgot Password ?</h1>
                <p className="text-muted-foreground">Enter your email to reset your password.</p>
            </div>

            <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Send Reset Link
                </Button>
            </form>
        </div>
    );
}
