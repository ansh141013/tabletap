import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Sparkles, ChefHat, Moon, Sun, Coffee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Steps
// Steps

const STEPS = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'username', title: 'Profile' },
    { id: 'theme', title: 'Theme' },
    { id: 'preferences', title: 'Preferences' },
    { id: 'about', title: 'About' },
    { id: 'complete', title: 'Ready' }
];

export default function OnboardingWizard() {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [saving, setSaving] = useState(false);

    // Form State
    const [username, setUsername] = useState('');
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [theme, setTheme] = useState('classic');
    const [preferences, setPreferences] = useState({
        isVeg: false,
        isVegan: false,
        spicyLover: false,
        sweetTooth: false
    });
    const [about, setAbout] = useState('');

    // Initial Load
    useEffect(() => {
        if (profile?.username) {
            setUsername(profile.username);
            // If username already set, maybe jump? 
            // But for now, let them iterate if they are in this flow.
        }
    }, [profile]);

    // Username Check
    useEffect(() => {
        const checkUsername = async () => {
            if (username.length < 4) {
                setUsernameAvailable(null);
                return;
            }
            // Simple regex check first
            if (!/^[a-z0-9_]{4,}$/.test(username)) {
                setUsernameAvailable(false);
                return;
            }

            try {
                const { data, error } = await supabase.rpc('check_username_availability', {
                    p_username: username
                });

                if (error) {
                    console.error("Availability check failed:", error);
                    setUsernameAvailable(false); // Play safe
                    return;
                }

                setUsernameAvailable(data); // data is boolean
            } catch (err) {
                setUsernameAvailable(false);
            }
        };

        const timeout = setTimeout(checkUsername, 500);
        return () => clearTimeout(timeout);
    }, [username, user]);

    const handleNext = () => {
        setCurrentStep(prev => prev + 1);
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('users')
                .update({
                    username,
                    theme,
                    preferences: { ...preferences, about }
                })
                .eq('id', user?.id);

            if (error) throw error;

            // Move to completion screen
            setCurrentStep(prev => prev + 1);
        } catch (err: any) {
            toast({
                title: "Error saving profile",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const handleStartOrdering = () => {
        // 1. Force reload or Theme context update to apply theme globally? 
        // For now, redirect to dashboard or customer menu?
        // "Start Ordering" implies Customer Menu usually.
        navigate('/dashboard');
    };

    const renderStep = () => {
        switch (STEPS[currentStep].id) {
            case 'welcome':
                return (
                    <div className="text-center space-y-6 animate-fade-in">
                        <img src="/logo.png" alt="TableTap" className="h-20 w-auto mx-auto mb-4" />
                        <h1 className="text-3xl font-bold">Welcome to TableTap!</h1>
                        <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                            We're excited to have you on board. Let's get your profile set up so you can dine smarter.
                        </p>
                        <Button size="lg" className="w-full max-w-sm" onClick={handleNext}>
                            Continue
                        </Button>
                    </div>
                );

            case 'username':
                return (
                    <div className="space-y-6 animate-fade-in max-w-sm mx-auto">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">What should we call you?</h2>
                            <p className="text-muted-foreground">Choose a unique username for your profile.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <div className="relative">
                                <Input
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                                    placeholder="cool_diner"
                                    className={cn(
                                        usernameAvailable === true && "border-success focus-visible:ring-success",
                                        usernameAvailable === false && "border-destructive focus-visible:ring-destructive"
                                    )}
                                />
                                {usernameAvailable === true && <Check className="absolute right-3 top-3 h-4 w-4 text-success" />}
                            </div>
                            <p className={`text-xs ${usernameAvailable === false ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {usernameAvailable === false
                                    ? "Username taken or invalid (min 4 chars, a-z, 0-9, _)"
                                    : "This will be your unique handle on TableTap."}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <Button variant="ghost" className="flex-1" onClick={() => setCurrentStep(prev => prev - 1)}>
                                Back
                            </Button>
                            <Button className="flex-1" size="lg" disabled={!usernameAvailable} onClick={handleNext}>
                                Next
                            </Button>
                        </div>
                    </div>
                );

            case 'theme':
                return (
                    <div className="space-y-6 animate-fade-in max-w-md mx-auto">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Choose your vibe</h2>
                            <p className="text-muted-foreground">Select a theme that matches your style.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'classic', name: 'Classic', icon: Coffee, class: 'bg-zinc-900 border-zinc-800 text-white' },
                                { id: 'light', name: 'Light & Fresh', icon: Sun, class: 'bg-white border-zinc-200 text-zinc-900' },
                                { id: 'theme-warm', name: 'Warm & Cozy', icon: Sparkles, class: 'bg-orange-50 border-orange-200 text-orange-900' },
                                { id: 'dark', name: 'Dark Mode', icon: Moon, class: 'bg-slate-950 border-slate-800 text-slate-50' }
                            ].map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => {
                                        setTheme(t.id);
                                        // Apply theme immediately for preview
                                        const root = window.document.documentElement;
                                        root.classList.remove('light', 'dark', 'theme-warm');

                                        if (t.id === 'dark') {
                                            root.classList.add('dark');
                                        } else if (t.id === 'theme-warm') {
                                            root.classList.add('theme-warm');
                                        } else {
                                            if (t.id === 'classic') root.classList.add('dark'); // Assuming classic is dark
                                        }
                                    }}
                                    className={cn(
                                        "cursor-pointer rounded-xl border-2 p-4 text-center transition-all hover:scale-105",
                                        t.class,
                                        theme === t.id ? "ring-2 ring-primary border-primary shadow-elevated" : "opacity-80 hover:opacity-100"
                                    )}
                                >
                                    <t.icon className="h-6 w-6 mx-auto mb-2" />
                                    <span className="font-semibold">{t.name}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <Button variant="ghost" className="flex-1" onClick={() => setCurrentStep(prev => prev - 1)}>
                                Back
                            </Button>
                            <Button className="flex-1" size="lg" onClick={handleNext}>
                                Next
                            </Button>
                        </div>
                    </div>
                );

            case 'preferences':
                return (
                    <div className="space-y-6 animate-fade-in max-w-md mx-auto">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Personalize your menu</h2>
                            <p className="text-muted-foreground">Tell us what you like to eat.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'isVeg', label: 'Vegetarian', icon: '🥗' },
                                { key: 'isVegan', label: 'Vegan', icon: '🌱' },
                                { key: 'spicyLover', label: 'Spicy Lover', icon: '🌶️' },
                                { key: 'sweetTooth', label: 'Sweet Tooth', icon: '🍰' },
                            ].map((pref: any) => (
                                <div
                                    key={pref.key}
                                    onClick={() => setPreferences(p => ({ ...p, [pref.key]: !p[pref.key as keyof typeof preferences] }))}
                                    className={cn(
                                        "cursor-pointer rounded-xl border p-4 flex items-center gap-3 transition-colors",
                                        preferences[pref.key as keyof typeof preferences]
                                            ? "bg-primary/10 border-primary text-primary"
                                            : "hover:bg-muted"
                                    )}
                                >
                                    <span className="text-2xl">{pref.icon}</span>
                                    <span className="font-medium">{pref.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <Button variant="ghost" className="flex-1" onClick={() => setCurrentStep(prev => prev - 1)}>Back</Button>
                            <Button className="flex-1" onClick={handleNext}>Next</Button>
                        </div>
                    </div>
                );

            case 'about':
                return (
                    <div className="space-y-6 animate-fade-in max-w-sm mx-auto">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">Anything else?</h2>
                            <p className="text-muted-foreground">Any allergies or special requests we should know?</p>
                        </div>

                        <div className="space-y-2">
                            <Input
                                placeholder="e.g. No onions, Allergies to nuts..."
                                value={about}
                                onChange={e => setAbout(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button variant="ghost" className="flex-1" onClick={() => setCurrentStep(prev => prev - 1)}>Back</Button>
                            <Button className="flex-1" size="lg" onClick={handleFinish} disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Finish Setup
                            </Button>
                        </div>
                    </div>
                );

            case 'complete':
                return (
                    <div className="text-center space-y-6 animate-fade-in py-6">
                        <div className="relative mx-auto w-20 h-20">
                            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                            <div className="relative bg-background rounded-full p-4 border-2 border-primary shadow-elevated flex items-center justify-center">
                                <span className="text-4xl">🎉</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold">You're all set!</h2>
                            <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                                Your table is ready. Here is a sneak peek of your personalized pick:
                            </p>
                        </div>

                        {/* UI Preview Card */}
                        <div className="max-w-xs mx-auto text-left transform rotate-1 hover:rotate-0 transition-transform duration-300">
                            <div className="bg-card text-card-foreground rounded-xl shadow-soft border overflow-hidden relative group">
                                <div className="absolute top-2 right-2 z-10">
                                    <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                                        Recommended for you
                                    </span>
                                </div>
                                <div className="h-32 bg-muted relative">
                                    <div className="absolute inset-0 flex items-center justify-center text-4xl">🍔</div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg">TableTap Special Burger</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        Juicy patty with {preferences.spicyLover ? "extra jalapeños" : "fresh lettuce"}, {preferences.isVeg ? "plant-based cheese" : "cheddar"}, and secret sauce.
                                    </p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="font-bold text-lg">$12.99</span>
                                        <Button size="sm" variant="secondary">Add</Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button size="lg" className="w-full max-w-xs shadow-elevated" onClick={handleStartOrdering} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Start Ordering"}
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
            {/* Progress Bar (Optional) */}
            {currentStep > 0 && currentStep < 5 && (
                <div className="fixed top-0 left-0 right-0 h-1 bg-muted">
                    <div
                        className="h-full bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${(currentStep / 5) * 100}%` }}
                    />
                </div>
            )}

            <div className="w-full max-w-xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
