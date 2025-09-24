import React from 'react';
import { cn } from './utils';

export function BottomBar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4',
        'md:hidden',
        className
      )}
      {...props}
    />
  );
}
