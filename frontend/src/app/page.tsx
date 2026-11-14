import Link from 'next/link';
import { ArrowRight, Shield, Heart, Sparkles, GitFork, BookOpen, Image as ImageIcon, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans selection:bg-amber-800 selection:text-white">
      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-800 to-amber-600 dark:from-amber-600 dark:to-amber-400 flex items-center justify-center text-white font-serif text-xl font-bold shadow-md">
            L
          </div>
          <span className="font-serif text-2xl font-bold tracking-tight">Legacy</span>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto py-20 space-y-8">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-300/50 dark:border-amber-800/50 text-amber-900 dark:text-amber-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Private Generational Heritage Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-[1.1]">
          Preserve your family&apos;s story for generations to come.
        </h1>

        <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 font-serif max-w-2xl leading-relaxed">
          More than names and dates. Store life stories, audio letters, high-res photo albums, and interactive family trees in an encrypted digital sanctuary.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/login">
            <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-amber-900/20">
              <span>Explore Investor Demo</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Create Family Workspace
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-left w-full">
          <div className="p-6 rounded-3xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800/80 backdrop-blur-md shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-800 dark:text-amber-300">
              <GitFork className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold">Interactive Family Tree</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Explore 4+ generations with parent, child, spouse, and sibling connections on an intuitive canvas.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800/80 backdrop-blur-md shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-800 dark:text-amber-300">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold">Media & Memory Archive</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Organize historical photos, voice notes, letters, and certificates into tagged family albums.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/70 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800/80 backdrop-blur-md shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-800 dark:text-amber-300">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold">Generational Vault</h3>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              Granular role-based privacy controls ensure your family heritage remains private and protected.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 dark:border-stone-800/80 py-8 px-6 text-center text-xs text-stone-500">
        <p>© 2026 Legacy Digital Inc. All rights reserved. Crafted for families worldwide.</p>
      </footer>
    </div>
  );
}
