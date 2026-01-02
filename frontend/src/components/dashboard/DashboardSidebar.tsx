import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ClipboardList, UtensilsCrossed, BarChart3, Settings, ChefHat } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: ClipboardList, label: 'Orders', end: true },
  { to: '/dashboard/menu', icon: UtensilsCrossed, label: 'Menu' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function DashboardSidebar() {
  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col">
          <img src="/logo.png" alt="TableTap" className="h-8 w-fit mb-1" />
          <p className="text-xs text-muted-foreground">Restaurant Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Kitchen Display Link */}
      <div className="p-4 border-t border-border">
        <NavLink
          to="/kitchen"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <ChefHat className="h-5 w-5" />
          Kitchen Display
        </NavLink>
      </div>
    </aside>
  );
}
