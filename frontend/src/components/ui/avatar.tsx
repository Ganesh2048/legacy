import * as React from 'react';
import { cn } from './button';

export function Avatar({
  src,
  alt = 'Avatar',
  fallback,
  className,
  size = 'md',
}: {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const [hasError, setHasError] = React.useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-24 h-24 text-2xl',
  };

  const getInitials = (name?: string) => {
    if (!name) return 'L';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden rounded-full border border-amber-900/10 dark:border-amber-100/10 shadow-sm bg-amber-100 dark:bg-stone-800 font-serif font-bold text-amber-900 dark:text-amber-200 justify-center items-center',
        sizes[size],
        className,
      )}
    >
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{fallback || getInitials(alt)}</span>
      )}
    </div>
  );
}
