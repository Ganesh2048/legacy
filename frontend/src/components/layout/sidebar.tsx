'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GitFork,
  Users,
  Image as ImageIcon,
  Clock,
  Settings,
  Search,
  PlusCircle,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { cn } from '../ui/button';
import { useAuth } from '@/lib/auth-context';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Family Tree', href: '/tree', icon: GitFork },
  { name: 'Memories & Media', href: '/memories', icon: ImageIcon },
  { name: 'Life Timeline', href: '/timeline', icon: Clock },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { currentFamily, families, setCurrentFamily } = useAuth();

  return (
    <aside
      className={cn(
        'w-64 border-r border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-950/50 backdrop-blur-xl flex flex-col justify-between p-4 min-h-screen',
        className,
      )}
    >
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-800 to-amber-600 dark:from-amber-600 dark:to-amber-400 flex items-center justify-center text-white font-serif text-xl font-bold shadow-md shadow-amber-900/20">
            L
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 block">
              Legacy
            </span>
            <span className="text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400 font-semibold block">
              Heritage Platform
            </span>
          </div>
        </div>

        {/* Family Switcher Dropdown */}
        {families.length > 0 && (
          <div className="px-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1.5 block">
              Family Workspace
            </label>
            <select
              value={currentFamily?.id || ''}
              onChange={(e) => {
                const selected = families.find((f) => f.id === e.target.value);
                if (selected) setCurrentFamily(selected);
              }}
              className="w-full h-9 rounded-xl border border-stone-300 dark:border-stone-800 bg-white dark:bg-stone-900 px-3 text-xs font-medium text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
            >
              {families.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/50 dark:hover:bg-stone-900 hover:text-stone-900 dark:hover:text-stone-100',
                )}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 transition-transform group-hover:scale-110',
                    isActive ? 'text-amber-800 dark:text-amber-400' : 'text-stone-400 dark:text-stone-500',
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-900/10 border border-amber-500/20 text-xs text-stone-700 dark:text-stone-300 space-y-2">
        <div className="flex items-center space-x-1.5 font-semibold text-amber-900 dark:text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Generational Security</span>
        </div>
        <p className="text-[11px] leading-relaxed opacity-80">
          Your family memories are end-to-end encrypted and preserved forever.
        </p>
      </div>
    </aside>
  );
}
