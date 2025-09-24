import React from 'react';
import { cn } from './utils';
import { Button } from './button';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function NewSidebar({ className, isCollapsed, onToggle, children, ...props }: SidebarProps) {
  return (
    <div
      className={cn(
        'flex flex-col bg-card border-r border-border',
        isCollapsed ? 'w-16' : 'w-64',
        'transition-all duration-300 ease-in-out',
        className
      )}
      {...props}
    >
      <div className="flex-1 overflow-y-auto">{children}</div>
      <div className="p-4 border-t border-border">
        <Button variant="ghost" size="icon" onClick={onToggle}>
          {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
        </Button>
      </div>
    </div>
  );
}
