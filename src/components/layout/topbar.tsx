import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Wallet, UserPlus, LogOut } from 'lucide-react';
import type { User } from '../../types';

interface TopbarProps {
  currentUser: User | null;
  onConnectWallet: () => void;
  onLogout?: () => void;
}

export function Topbar({ currentUser, onConnectWallet, onLogout }: TopbarProps) {
  const [openUsernameDialog, setOpenUsernameDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitUsername = async () => {
    const name = username.trim();
    if (!name) return;
    setIsSubmitting(true);
    onConnectWallet();
    setOpenUsernameDialog(false);
    setUsername('');
    setIsSubmitting(false);
  };

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
        <div className="flex items-center gap-3 select-none">
          <div className="text-lg font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
            TenChat
          </div>
          <Badge variant="secondary" className="bg-violet-900/30 text-violet-300 border-violet-700/30">Beta</Badge>
        </div>

        {!currentUser ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setOpenUsernameDialog(true)}
              variant="ghost"
              className="text-violet-300 hover:text-white hover:bg-violet-800/50"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Set Username
            </Button>
            <Button
              onClick={onConnectWallet}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-violet-500/40">
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-xs">
                  {getInitials(currentUser.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm text-white font-medium">{currentUser.displayName}</div>
              {isGuest && (
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-zinc-700/50">Guest</Badge>
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

      <Dialog open={openUsernameDialog} onOpenChange={setOpenUsernameDialog}>
        <DialogContent className="bg-gradient-to-br from-black via-zinc-900 to-violet-900/20 border-violet-500/20 backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Choose a username</DialogTitle>
            <DialogDescription className="text-zinc-300">
              Use TenChat without a wallet by picking a display name.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="e.g. alex, moonrider"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-violet-500"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setOpenUsernameDialog(false)}
                className="text-zinc-300 hover:text-white hover:bg-zinc-800/60"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitUsername}
                disabled={!username.trim() || isSubmitting}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
