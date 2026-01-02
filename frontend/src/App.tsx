import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './pages/auth/AuthLayout';
import Login from './pages/auth/Login';
import { Toaster } from '@/components/ui/toaster';

// Placeholder components for routes that might not be restored yet
const DashboardPlaceholder = () => <div className="p-8">Dashboard (Restoring...)</div>;
const RegisterPlaceholder = () => <div className="p-8">Register (Restoring...)</div>;

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Navigate to="/auth/login" replace />} />

                <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<RegisterPlaceholder />} />
                </Route>

                <Route path="/dashboard" element={<DashboardPlaceholder />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
            <Toaster />
        </>
    );
}

export default App;
