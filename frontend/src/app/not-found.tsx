import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6 text-center space-y-4 font-serif">
      <div className="w-12 h-12 rounded-2xl bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-2xl">
        L
      </div>
      <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-100">
        404 • Record Not Found
      </h1>
      <p className="text-xs text-stone-500 max-w-sm">
        The family heritage page or record you are searching for does not exist in this vault.
      </p>
      <Link href="/dashboard">
        <Button>Return to Family Dashboard</Button>
      </Link>
    </div>
  );
}
