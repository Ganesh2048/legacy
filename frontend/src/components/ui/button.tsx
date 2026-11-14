import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] rounded-xl';

    const variants = {
      default:
        'bg-amber-800 text-amber-50 hover:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-700 dark:text-stone-950 shadow-sm',
      secondary:
        'bg-stone-200 text-stone-900 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700',
      outline:
        'border border-stone-300 dark:border-stone-800 bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200',
      ghost:
        'bg-transparent hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300',
      danger:
        'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-10 px-4 text-sm gap-2',
      lg: 'h-12 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
