/**
 * Full Screen Overlay
 * Mobile-friendly full-screen overlay with cancel button
 */

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface FullScreenOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCancel?: boolean;
  className?: string;
}

export function FullScreenOverlay({
  isOpen,
  onClose,
  title,
  children,
  showCancel = true,
  className = '',
}: FullScreenOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm md:hidden">
      {/* Header with Cancel Button */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-lg border-b border-violet-900/20">
        <div className="flex items-center justify-between h-14 px-4">
          {title && (
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          )}
          {showCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="ml-auto text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`h-[calc(100vh-3.5rem)] overflow-y-auto ${className}`}>
        {children}
      </div>
    </div>
  );
}
