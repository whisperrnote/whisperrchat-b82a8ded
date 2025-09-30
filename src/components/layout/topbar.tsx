import React from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { LogOut } from 'lucide-react';
import type { User } from '../../types';

interface TopbarProps {
  currentUser: User | null;
  onConnect?: () => void;
  onLogout?: () => void;
}

export function Topbar({ currentUser, onConnect, onLogout }: TopbarProps) {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isGuest = currentUser ? currentUser.id.startsWith('anon:') : false;

  return (
    <div className="w-full border-b border-violet-900/20 bg-gradient-to-r from-gray-950 via-black to-gray-950">
      <div className="h-14 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-3 select-none">
          <div className="text-base md:text-lg font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
            TenChat
          </div>
          <Badge variant="secondary" className="bg-violet-900/30 text-violet-300 border-violet-700/30 text-xs">Beta</Badge>
        </div>

        {!currentUser ? (
          <Button
            onClick={onConnect}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 text-sm md:text-base h-9 md:h-10 px-4 md:px-6"
          >
            Connect
          </Button>
        ) : (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-violet-500/40">
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-xs">
                  {getInitials(currentUser.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-sm text-white font-medium">{currentUser.displayName}</div>
              {isGuest && (
                <Badge variant="secondary" className="hidden sm:inline-flex bg-zinc-800 text-zinc-300 border-zinc-700/50 text-xs">Guest</Badge>
              )}
            </div>
            {onLogout && (
              <Button
                onClick={onLogout}
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white hover:bg-zinc-800/60"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
