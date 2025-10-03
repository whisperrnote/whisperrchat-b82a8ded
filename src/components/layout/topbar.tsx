import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '../ui/dropdown-menu';
import { 
  LogOut, 
  Settings, 
  Wallet, 
  Copy, 
  Check, 
  ChevronDown,
  Search,
  Plus,
  MessageSquarePlus,
  UserPlus,
  Users,
} from 'lucide-react';
import type { User } from '../../types';
import { useAppwrite } from '@/contexts/AppwriteContext';
import { toast } from 'sonner';

interface TopbarProps {
  currentUser: User | null;
  onConnect?: () => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onOpenNewChat?: () => void;
  onOpenSearch?: () => void;
}

export function Topbar({ currentUser, onConnect, onLogout, onOpenSettings, onOpenNewChat, onOpenSearch }: TopbarProps) {
  const { currentAccount } = useAppwrite();
  const [copied, setCopied] = useState(false);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const walletAddress = currentAccount?.prefs?.walletEth as string | undefined;
  const shortWallet = walletAddress 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : currentAccount?.name 
      ? currentAccount.name.slice(0, 10)
      : 'User';

  const handleCopyWallet = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Wallet address copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    if (onLogout) {
      await onLogout();
      toast.success('Disconnected successfully');
    }
  };

  return (
    <div className="w-full border-b border-violet-900/20 bg-gradient-to-r from-gray-950 via-black to-gray-950">
      <div className="h-14 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3 select-none">
          <div className="text-base md:text-lg font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
            TenChat
          </div>
          <Badge variant="secondary" className="bg-violet-900/30 text-violet-300 border-violet-700/30 text-xs">
            Beta
          </Badge>
        </div>

        {/* Center - Search Bar (when authenticated) */}
        {currentUser && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search messages, users..."
                onClick={onOpenSearch}
                readOnly
                className="w-full pl-10 pr-4 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500 cursor-pointer hover:bg-gray-900/70 focus:bg-gray-900"
              />
            </div>
          </div>
        )}

        {/* Right Side */}
        {!currentUser ? (
          <Button
            onClick={onConnect}
            className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 text-sm md:text-base h-9 md:h-10 px-4 md:px-6"
          >
            Connect
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={onOpenSearch}
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* New Chat Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={onOpenNewChat}
            >
              <Plus className="w-5 h-5" />
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 px-2 md:px-3 h-9 hover:bg-gray-800/60 text-white"
                >
                  <Avatar className="h-7 w-7 border border-violet-500/40">
                    <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-xs">
                      {getInitials(currentUser.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex items-center gap-1">
                    <span className="text-sm font-medium">{shortWallet}</span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800 text-white">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser.displayName}
                    </p>
                    {walletAddress && (
                      <p className="text-xs leading-none text-gray-400 font-mono">
                        {shortWallet}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-800" />
                
                {walletAddress && (
                  <DropdownMenuItem 
                    onClick={handleCopyWallet}
                    className="hover:bg-gray-800 cursor-pointer"
                  >
                    {copied ? (
                      <Check className="mr-2 h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="mr-2 h-4 w-4" />
                    )}
                    <span>Copy Wallet Address</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuItem 
                  onClick={onOpenSettings}
                  className="hover:bg-gray-800 cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-gray-800" />
                
                <DropdownMenuItem 
                  onClick={handleDisconnect}
                  className="hover:bg-gray-800 cursor-pointer text-red-400 focus:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Disconnect</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
