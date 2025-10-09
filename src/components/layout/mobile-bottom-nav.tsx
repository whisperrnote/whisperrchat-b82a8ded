/**
 * Mobile Bottom Navigation
 * Replaces sidebars on mobile devices
 */

import React from 'react';
import { 
  MessageSquare, 
  Users,
  Wallet,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';

interface MobileBottomNavProps {
  activeTab: 'chats' | 'contacts' | 'wallet' | 'settings' | 'more';
  onTabChange: (tab: 'chats' | 'contacts' | 'wallet' | 'settings' | 'more') => void;
  unreadCount?: number;
  onOpenProfile?: () => void;
  onOpenSecurity?: () => void;
  onOpenStats?: () => void;
  onOpenNewChat?: () => void;
  onOpenNewContact?: () => void;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  unreadCount = 0,
  onOpenProfile,
  onOpenSecurity,
  onOpenStats,
  onOpenNewChat,
  onOpenNewContact,
}: MobileBottomNavProps) {
  const NavButton = ({ 
    icon: Icon, 
    label, 
    active, 
    onClick, 
    badge,
  }: {
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick: () => void;
    badge?: number;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 py-2 px-1 relative transition-colors ${
        active 
          ? 'text-violet-400' 
          : 'text-gray-400 hover:text-gray-300'
      }`}
    >
      <div className="relative">
        <Icon className="w-6 h-6" />
        {badge && badge > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-white text-[10px] border-0"
          >
            {badge > 99 ? '99+' : badge}
          </Badge>
        )}
      </div>
      <span className="text-[10px] mt-1 font-medium">{label}</span>
      {active && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-violet-400 rounded-full" />
      )}
    </button>
  );

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-violet-900/20">
      <div className="flex items-center justify-around h-16 pb-safe">
        <NavButton
          icon={MessageSquare}
          label="Chats"
          active={activeTab === 'chats'}
          onClick={() => onTabChange('chats')}
          badge={unreadCount}
        />
        
        <NavButton
          icon={Users}
          label="Contacts"
          active={activeTab === 'contacts'}
          onClick={() => onTabChange('contacts')}
        />
        
        <NavButton
          icon={Wallet}
          label="Wallet"
          active={activeTab === 'wallet'}
          onClick={() => onTabChange('wallet')}
        />
        
        <NavButton
          icon={Settings}
          label="Settings"
          active={activeTab === 'settings'}
          onClick={() => onTabChange('settings')}
        />
        
        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 transition-colors ${
                activeTab === 'more' 
                  ? 'text-violet-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <MoreHorizontal className="w-6 h-6" />
              <span className="text-[10px] mt-1 font-medium">More</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            side="top"
            className="w-48 bg-gray-900 border-gray-800 text-white mb-2"
          >
            <DropdownMenuItem onClick={onOpenProfile} className="hover:bg-gray-800 cursor-pointer">
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenSecurity} className="hover:bg-gray-800 cursor-pointer">
              Security Status
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenStats} className="hover:bg-gray-800 cursor-pointer">
              Activity Stats
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem onClick={onOpenNewChat} className="hover:bg-gray-800 cursor-pointer">
              New Chat
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenNewContact} className="hover:bg-gray-800 cursor-pointer">
              Add Contact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
