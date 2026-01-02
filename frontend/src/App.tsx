import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Auth Pages
import AuthLayout from "./pages/auth/AuthLayout";
import Welcome from "./pages/auth/Welcome";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import OnboardingWizard from "./pages/onboarding/OnboardingWizard";

// Customer Pages
import CustomerMenu from "./pages/CustomerMenu";
import OrderStatus from "./pages/OrderStatus";

// Dashboard Pages
import DashboardLayout from "./pages/DashboardLayout";
import OrdersDashboard from "./pages/OrdersDashboard";
import MenuManagement from "./pages/MenuManagement";
import Analytics from "./pages/Analytics";
import DashboardSettings from "./pages/DashboardSettings";

// Kitchen
import KitchenDisplay from '@/pages/KitchenDisplay';
import OrderStatusPage from '@/pages/OrderStatus';

import NotFound from "./pages/NotFound";

import { RestaurantProvider } from "@/contexts/RestaurantContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <RestaurantProvider>
          <AuthProvider>
            <CartProvider>
              <OrderProvider>
                <Toaster />
                <Sonner />

                <Routes>
                  {/* Auth Routes */}
                  <Route path="/auth" element={<AuthLayout />}>
                    <Route index element={<Welcome />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    {/* <Route path="reset-password" element={<ResetPassword />} /> */}
                  </Route>

                  {/* Onboarding */}
                  <Route path="/order-status" element={<OrderStatusPage />} />
                  <Route path="/onboarding" element={<OnboardingWizard />} />

                  {/* Customer Routes (Public for now, or protected?) */}
                  <Route path="/" element={<Navigate to="/auth" replace />} /> {/* Default to Auth for now, or Menu */}
                  {/* Let's make Root -> Menu for convenience, or Auth if we want to force login? 
                        User prompt: "Screen 1: Welcome... App logo... " implies Auth first.
                        Okay, let's Redirect Root to /auth for this "App" experience. 
                    */}
                  <Route path="/menu" element={<CustomerMenu />} /> {/* Allow direct access to menu if needed */}
                  <Route path="/order-status" element={<OrderStatus />} />

                  {/* Dashboard Routes (Protected) */}
                  <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<OrdersDashboard />} />
                    <Route path="menu" element={<MenuManagement />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<DashboardSettings />} />
                  </Route>

                  {/* Kitchen Display */}
                  <Route path="/kitchen" element={<KitchenDisplay />} />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>

              </OrderProvider>
            </CartProvider>
          </AuthProvider>
        </RestaurantProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
