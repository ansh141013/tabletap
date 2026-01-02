import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function Welcome() {
    return (
        <div className="flex flex-col items-center text-center space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <img src="/logo.png" alt="TableTap" className="h-12 w-auto mx-auto mb-4 lg:hidden" />
                <h1 className="text-3xl font-bold tracking-tight">TableTap</h1>
                <p className="text-muted-foreground mt-2 text-lg">Order smarter. Dine faster.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="w-full space-y-3"
            >
                <Link to="/auth/register" className="w-full block">
                    <Button size="lg" className="w-full font-semibold text-lg h-12">
                        Get Started
                    </Button>
                </Link>
                <Link to="/auth/login" className="w-full block">
                    <Button variant="outline" size="lg" className="w-full font-semibold text-lg h-12">
                        Already have an account? Sign In
                    </Button>
                </Link>
            </motion.div>
        </div>
    );
}
