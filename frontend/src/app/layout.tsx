import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Legacy - Private Family Heritage & Memory Vault',
  description: 'Preserve your family history, memories, stories, life timelines, and interactive family trees across generations.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
