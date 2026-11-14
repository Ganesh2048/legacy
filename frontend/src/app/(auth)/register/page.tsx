'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      await register(email, password, fullName);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Create Your Family Vault
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            Preserve your legacy across generations starting today
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
                Full Name
              </label>
              <Input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Eleanor Sterling"
              />
            </div>

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
              <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                Password
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Get Started'}
            </Button>
          </form>

          <div className="text-center text-xs text-stone-500 dark:text-stone-400">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-amber-800 dark:text-amber-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
