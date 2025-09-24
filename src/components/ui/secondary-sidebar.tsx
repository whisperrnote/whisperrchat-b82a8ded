import React from 'react';
import { cn } from './utils';
import { Button } from './button';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

interface SecondarySidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SecondarySidebar({ className, isCollapsed, onToggle, children, ...props }: SecondarySidebarProps) {
  return (
    <div
      className={cn(
        'flex flex-col bg-card border-l border-border',
        isCollapsed ? 'w-16' : 'w-64',
        'transition-all duration-300 ease-in-out',
        className
      )}
      {...props}
    >
      <div className="flex-1 overflow-y-auto">{children}</div>
      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {isCollapsed ? <ChevronsLeft /> : <ChevronsRight />}
        </Button>
      </div>
    </div>
  );
}
