'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('eleanor.sterling@example.com');
    setPassword('SecretPassword123!');
    try {
      setIsLoading(true);
      setError(null);
      await login('eleanor.sterling@example.com', 'SecretPassword123!');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-800 to-amber-600 dark:from-amber-600 dark:to-amber-400 items-center justify-center text-white font-serif text-2xl font-bold shadow-lg shadow-amber-900/20">
            L
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Welcome back to Legacy
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Sign in to access your family heritage vault
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-3xl bg-white/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-stone-800/80 shadow-xl backdrop-blur-xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Email Address
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-medium text-stone-700 dark:text-stone-300">
                  Password
                </label>
                <a href="#" className="text-amber-800 dark:text-amber-400 hover:underline">
                  Forgot?
                </a>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 dark:border-stone-800 w-full" />
            <span className="bg-white dark:bg-stone-900 px-3 text-[11px] text-stone-400 font-mono uppercase tracking-wider absolute">
              or Investor Demo
            </span>
          </div>

          {/* Quick Demo Login Shortcut */}
          <Button
            type="button"
            variant="outline"
            onClick={handleDemoLogin}
            className="w-full h-11 border-amber-500/30 text-amber-900 dark:text-amber-300 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50"
            disabled={isLoading}
          >
            <Sparkles className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
            <span>Login with Investor Demo Account</span>
          </Button>

          <div className="text-center text-xs text-stone-500 dark:text-stone-400">
            Don&apos;t have a workspace?{' '}
            <Link href="/register" className="font-semibold text-amber-800 dark:text-amber-400 hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
