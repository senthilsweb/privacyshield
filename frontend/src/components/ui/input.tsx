import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition-colors placeholder:text-zinc-400 focus-ring disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';
