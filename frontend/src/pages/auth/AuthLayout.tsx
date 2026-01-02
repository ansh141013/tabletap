import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, QrCode, Zap, Smartphone } from 'lucide-react';

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
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-10 max-w-xl"
                >
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-5xl">🍽️</span>
                            {/* Ideally use actual SVG Logo if available, fallback to emoji for now as per previous file */}
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight text-foreground mb-4">
                            Order smarter. <br />
                            <span className="text-primary">Dine faster.</span>
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Experience the future of dining with TableTap.
                            Seamless ordering, instant checkout, and no app downloads required.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <BenefitItem icon={QrCode} title="Scan QR Code" description="Simply scan the code at your table." />
                        <BenefitItem icon={Zap} title="Order Instantly" description="Browse the menu and order in seconds." />
                        <BenefitItem icon={Smartphone} title="No App Download" description="Everything works directly in your browser." />
                    </div>
                </motion.div>
            </div>

            {/* Right Side: Auth Form (40% Desktop) */}
            <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-6 lg:p-12 overflow-y-auto bg-background">
                <div className="w-full max-w-[420px] space-y-6">
                    {/* Mobile Header (Logo visible only on mobile) */}
                    <div className="lg:hidden text-center mb-8">
                        <span className="text-4xl">🍽️</span>
                        <h2 className="text-2xl font-bold mt-2">TableTap</h2>
                    </div>

                    <Outlet />
                </div>

                <footer className="mt-8 text-center text-xs text-muted-foreground lg:hidden">
                    &copy; 2025 TableTap. All rights reserved.
                </footer>
            </div>
        </div>
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
            <div>
                <h3 className="font-semibold text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
        </motion.div>
    );
}
