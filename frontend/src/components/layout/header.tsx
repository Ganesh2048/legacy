'use client';

import React, { useState } from 'react';
import { Search, Bell, Moon, Sun, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import Link from 'next/link';

export function Header({ onOpenSearch }: { onOpenSearch?: () => void }) {
  const { theme, setTheme } = useTheme();
  const { user, logout, currentFamily } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 border-b border-stone-200/80 dark:border-stone-800/80 bg-white/60 dark:bg-stone-950/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Trigger Bar */}
      <div className="flex items-center space-x-4 flex-1 max-w-md">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-stone-100 dark:bg-stone-900/80 text-stone-500 dark:text-stone-400 text-xs border border-stone-200/80 dark:border-stone-800/80 hover:border-amber-700/40 transition-all text-left group"
        >
          <Search className="w-4 h-4 text-stone-400 group-hover:text-amber-600 transition-colors" />
          <span>Search people, places, life events, albums...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-stone-300 dark:border-stone-800 bg-stone-200/50 dark:bg-stone-800 px-1.5 font-mono text-[10px] font-medium opacity-100">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-600 ring-2 ring-white dark:ring-stone-950" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                <span className="font-serif font-semibold text-sm text-stone-900 dark:text-stone-100">
                  Notifications
                </span>
                <Badge variant="amber">2 New</Badge>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-stone-800 dark:text-stone-200">
                  <p className="font-semibold text-amber-900 dark:text-amber-300">Upcoming Birthday 🎉</p>
                  <p className="mt-0.5 opacity-80">Robert Sterling turns 68 on June 22nd!</p>
                </div>
                <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200">
                  <p className="font-semibold">New Memory Added</p>
                  <p className="mt-0.5 opacity-80">Julian added 3 photos to Cape Cod Cottage.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 pl-2 focus:outline-none"
          >
            <Avatar src={user?.avatarUrl} alt={user?.fullName} size="sm" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800">
                <p className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                  {user?.fullName}
                </p>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                  {user?.email}
                </p>
              </div>
              <Link
                href="/settings"
                onClick={() => setShowUserMenu(false)}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Account Settings</span>
              </Link>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
