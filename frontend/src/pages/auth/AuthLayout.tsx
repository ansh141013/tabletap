import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, Zap, QrCode } from 'lucide-react';

export default function AuthLayout() {
    return (
        <div className="min-h-screen w-full flex bg-background max-h-screen overflow-hidden">
            {/* Left Side: Brand & Benefits (60% Desktop) */}
            <div className="hidden lg:flex lg:w-[60%] relative bg-background items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-100 dark:from-green-950/30 dark:via-background dark:to-emerald-900/20" />

                {/* Abstract Shapes */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/10 rounded-full blur-[100px]" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10 max-w-xl text-center space-y-8"
                >
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 transform -rotate-6">
                                <span className="text-4xl">🍽️</span>
                            </div>
                        </div>
                        <h1 className="text-6xl font-black tracking-tight text-foreground">
                            TableTap
                        </h1>
                        <p className="text-2xl font-medium text-muted-foreground italic">
                            “Order smarter. Dine faster.”
                        </p>
                    </div>

                    <div className="grid gap-4 pt-8">
                        <BenefitItem
                            icon={QrCode}
                            title="Scan QR"
                            description="Point your camera at the table code"
                        />
                        <BenefitItem
                            icon={Zap}
                            title="Order instantly"
                            description="No waiting for menus or servers"
                        />
                        <BenefitItem
                            icon={Smartphone}
                            title="No app download"
                            description="Runs right in your mobile browser"
                        />
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Auth Form (40% Desktop) */}
            <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto bg-background">
                {/* Mobile Header (Hidden on Desktop) */}
                <div className="lg:hidden mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-bold mb-4">
                        <span>🍽️</span> TableTap
                    </div>
                    <h2 className="text-2xl font-bold">Welcome back</h2>
                </div>

                <div className="w-full max-w-[420px]">
                    <Outlet />
                </div>

                {/* Footer links for mobile or overall */}
                <footer className="mt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} TableTap. Dining Reimagined.</p>
                </footer>
            </div>
        </div >
    );
}

function BenefitItem({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <motion.div
            whileHover={{ x: 5 }}
            className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm shadow-sm"
        >
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
            </div>
            <div className="text-left">
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </motion.div>
    );
}
