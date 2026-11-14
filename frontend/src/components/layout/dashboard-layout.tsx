'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { SearchModal } from '../search-modal';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center space-y-3 font-serif">
        <div className="w-10 h-10 rounded-2xl bg-amber-800 text-white flex items-center justify-center font-bold text-xl animate-pulse">
          L
        </div>
        <p className="text-xs text-stone-400">Loading family vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onOpenSearch={() => setIsSearchOpen(true)} />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}
