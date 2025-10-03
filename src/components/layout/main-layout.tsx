import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  LogOut, 
  Plus, 
  Search,
  Wallet,
  DollarSign,
  Zap,
  TrendingUp,
  Lock,
  Coins,
  Send,
  Gift,
  BarChart3,
  Anchor,
  Key,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { ConversationList } from '../messaging/conversation-list';
import { ChatInterface } from '../messaging/chat-interface';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import type { User, Conversation } from '../../types';
import { Topbar } from './topbar';
import { SettingsOverlay } from '../settings/settings-overlay';

interface MainLayoutProps {
  currentUser: User | null;
  onLogin: () => void;
  onLogout?: () => void;
}

export function MainLayout({ currentUser, onLogin, onLogout }: MainLayoutProps) {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showSettings, setShowSettings] = useState(false);


  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const mockWalletData = {
    balance: 1247.89,
    address: '0x742d35Cc6634C0532925a3b8D4C2468bB3Ff16B2',
    recentTransactions: [
      { type: 'received', amount: 50, from: 'alice.eth', time: '2m ago' },
      { type: 'sent', amount: 25, to: 'bob.eth', time: '1h ago' },
      { type: 'gift', amount: 10, to: 'charlie.eth', time: '3h ago' }
    ]
  };

  return (
    <>
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="h-screen bg-black text-white flex flex-col">
          <Topbar
            currentUser={currentUser}
            onConnect={onLogin}
            onLogout={onLogout}
          />
          <div className="flex-1 flex flex-col md:flex-row">
          {/* Left Sidebar - Crypto Dashboard + Conversations */}
          <div className={`${currentUser && selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-gradient-to-b from-black via-gray-900 to-black border-r border-violet-900/20 flex-col`}>
            {currentUser ? (
              <>
                {/* Crypto Status Header */}
                <Card className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 border-violet-700/30 m-4 mb-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10 border-2 border-violet-400">
                            <AvatarFallback className="bg-violet-600 text-white font-bold">
                              {getInitials(currentUser.displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black flex items-center justify-center">
                            <Wallet className="w-2 h-2 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-white font-semibold truncate">
                            {currentUser.displayName}
                          </h2>
                          <div className="flex items-center gap-1 text-violet-300 text-xs">
                            <Shield className="w-3 h-3" />
                            <span>Encrypted</span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-violet-300 hover:text-white hover:bg-violet-800/50"
                        onClick={() => setShowSettings(true)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Wallet Balance */}
                    <div className="space-y-2 pt-2 border-t border-violet-700/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-300">Portfolio</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 px-2 text-violet-300 hover:text-white"
                          onClick={() => setShowBalance(!showBalance)}
                        >
                          {showBalance ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </Button>
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {showBalance ? `$${mockWalletData.balance.toLocaleString()}` : '••••••'}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">+12.5%</span>
                        <span className="text-gray-400">24h</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                {/* Quick Actions */}
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white border-violet-500">
                      <Send className="w-3 h-3 mr-1" />
                      Send
                    </Button>
                    <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white border-pink-500">
                      <Gift className="w-3 h-3 mr-1" />
                      Gift
                    </Button>
                    <Button size="sm" className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Stats
                    </Button>
                  </div>
                </div>

                {/* Security Status */}
                <div className="px-4 pb-4">
                  <Card className="bg-gray-900/50 border-gray-700/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">Security</span>
                        <Badge variant="secondary" className="bg-green-900/30 text-green-400 border-green-700/30">
                          <Lock className="w-3 h-3 mr-1" />
                          E2EE
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Keys Active</span>
                          <span className="text-green-400">✓</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Blockchain Anchor</span>
                          <span className="text-violet-400">✓</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Separator className="mx-4 bg-violet-900/30" />

                {/* Conversation list */}
                <div className="flex-1 overflow-hidden mt-2">
                  <ConversationList
                    currentUser={currentUser}
                    onSelectConversation={handleSelectConversation}
                    selectedConversationId={selectedConversation?.id}
                  />
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center mb-3">
                    <Wallet className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">Welcome to TenChat</h2>
                <p className="text-gray-400 mb-2 text-sm leading-relaxed">
                  Start by setting a username or connecting a wallet.
                </p>
                <p className="text-xs text-gray-500">
                  Use the top bar to Set Username or Connect Wallet.
                </p>
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className={`${currentUser && !selectedConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-gradient-to-br from-gray-950 via-black to-gray-950`}>
            {currentUser && selectedConversation ? (
              <ChatInterface
                conversation={selectedConversation}
                currentUser={currentUser}
                onClose={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
                <div className="text-center space-y-6 max-w-lg px-2">
                  <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-3xl flex items-center justify-center border border-violet-500/30">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center border-2 border-black">
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -left-2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center border-2 border-black">
                      <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-white via-violet-200 to-purple-200 bg-clip-text text-transparent">
                    TenChat
                  </h1>
                  
                  <p className="text-lg sm:text-xl text-gray-300 leading-relaxed">
                    The future of secure messaging meets crypto.
                    <span className="block text-violet-300 mt-2">Send messages, gifts, and value—all encrypted.</span>
                  </p>
                  
                  {currentUser ? (
                    <div className="space-y-4 pt-4">
                      <p className="text-gray-400">
                        Select a conversation or start a new one to begin chatting
                      </p>
                      <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-green-400" />
                          <span>E2E Encrypted</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Anchor className="w-4 h-4 text-violet-400" />
                          <span>Blockchain Secured</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Gift className="w-4 h-4 text-pink-400" />
                          <span>Crypto Gifts</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-4">
                      <p className="text-gray-400">
                        Connect your wallet to access encrypted messaging with crypto features
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Lock className="w-4 h-4 text-violet-400" />
                          <span>End-to-end encryption</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span>Crypto payments</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Gift className="w-4 h-4 text-pink-400" />
                          <span>Digital gifts</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Anchor className="w-4 h-4 text-blue-400" />
                          <span>Blockchain verified</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-gray-900 border-gray-700 text-white">
        <ContextMenuItem className="hover:bg-gray-800" onClick={() => window.location.reload()}>
          Reload
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-gray-700" />
        <ContextMenuItem disabled className="text-gray-500">
          TenChat v0.1.0
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
    
    {/* Settings Overlay */}
    <SettingsOverlay 
      open={showSettings} 
      onOpenChange={setShowSettings} 
    />
    </>
  );
}
