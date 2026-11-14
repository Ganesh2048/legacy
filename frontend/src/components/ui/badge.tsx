import * as React from 'react';
import { cn } from './button';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'amber' | 'emerald';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variants = {
    default: 'bg-stone-900 text-stone-50 dark:bg-stone-100 dark:text-stone-900',
    secondary: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200',
    outline: 'border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300',
    amber: 'bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/50 dark:border-amber-800/50',
    emerald: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/50 dark:border-emerald-800/50',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
