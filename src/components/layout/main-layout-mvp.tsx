/**
 * Clean MVP Main Layout
 * Simple, functional, accessible
 */

import { useState } from 'react';
import { 
  MessageSquare,
  User,
  Users,
  Phone,
  Bookmark,
  Settings,
  UserPlus,
  Wallet,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAppwrite } from '@/contexts/AppwriteContext';
import { ConversationList } from '../messaging/conversation-list';
import { ChatInterface } from '../messaging/chat-interface';
import { NewChatModal } from '../messaging/new-chat-modal';
import { SettingsOverlay } from '../settings/settings-overlay';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Topbar } from './topbar';
import type { Conversation } from '../../types';

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
}

const leftSidebarItems: SidebarItem[] = [
  { id: 'chats', label: 'Chats', icon: MessageSquare },
  { id: 'groups', label: 'Groups', icon: Users },
  { id: 'contacts', label: 'Contacts', icon: UserPlus },
  { id: 'calls', label: 'Calls', icon: Phone },
  { id: 'saved', label: 'Saved', icon: Bookmark },
];

const rightSidebarItems: SidebarItem[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface MainLayoutProps {
  currentUser: any;
  onLogin: () => void;
  onLogout?: () => void;
}

export function MainLayout({ currentUser, onLogin, onLogout }: MainLayoutProps) {
  const { currentAccount, currentUser: appwriteUser, isAuthenticated } = useAppwrite();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('chats');
  const [activeRightTab, setActiveRightTab] = useState('profile');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasSelfChat, setHasSelfChat] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSidebarItemClick = (id: string, isRight: boolean) => {
    if (isRight) {
      setActiveRightTab(id);
      setRightSidebarOpen(true);
      
      // Open overlays for specific items
      if (id === 'settings') {
        setShowSettings(true);
      }
    } else {
      setActiveLeftTab(id);
      setLeftSidebarOpen(true);
    }
  };

  // Create user object for legacy components - use currentAccount OR appwriteUser
  const user = currentAccount || appwriteUser ? {
    id: (currentAccount?.$id || appwriteUser?.id) as string,
    displayName: currentAccount?.name || appwriteUser?.name || 'User',
    identity: {
      id: (currentAccount?.$id || appwriteUser?.id) as string,
      publicKey: '',
      identityKey: '',
      signedPreKey: '',
      oneTimePreKeys: [],
    },
    createdAt: currentAccount?.$createdAt ? new Date(currentAccount.$createdAt) : new Date(),
    lastSeen: currentAccount?.$createdAt ? new Date(currentAccount.$createdAt) : new Date(),
  } : null;

  console.log('[MainLayout] User object:', user);
  console.log('[MainLayout] isAuthenticated:', isAuthenticated);

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      <Topbar
        currentUser={user}
        onConnect={onLogin}
        onLogout={onLogout}
        onOpenSettings={() => setShowSettings(true)}
        onOpenNewChat={() => setShowNewChat(true)}
        onOpenSearch={() => {}}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Icon Sidebar */}
        <div className="w-16 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-4 gap-2">
          {leftSidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleSidebarItemClick(item.id, false)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center relative transition-colors ${
                activeLeftTab === item.id
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
              {item.badge && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>

        {/* Left Content Panel */}
        {leftSidebarOpen && (
          <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white capitalize">{activeLeftTab}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLeftSidebarOpen(false)}
                className="md:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeLeftTab === 'chats' && user && (
                <ConversationList
                  currentUser={user}
                  onSelectConversation={setSelectedConversation}
                  selectedConversationId={selectedConversation?.id}
                />
              )}
              
              {activeLeftTab === 'groups' && (
                <div className="p-4 text-center text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Groups feature coming soon</p>
                </div>
              )}
              
              {activeLeftTab === 'contacts' && (
                <div className="p-4 text-center text-gray-400">
                  <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Contacts feature coming soon</p>
                </div>
              )}
              
              {activeLeftTab === 'calls' && (
                <div className="p-4 text-center text-gray-400">
                  <Phone className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Calls feature coming soon</p>
                </div>
              )}
              
              {activeLeftTab === 'saved' && (
                <div className="p-4 text-center text-gray-400">
                  <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Saved messages coming soon</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-black">
          {user && selectedConversation ? (
            <ChatInterface
              conversation={selectedConversation}
              currentUser={user}
              onClose={() => setSelectedConversation(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {isAuthenticated ? 'Select a chat to start messaging' : 'Welcome to Tenchat'}
                </h2>
                <p className="text-gray-400">
                  {isAuthenticated 
                    ? 'Choose a conversation from the sidebar'
                    : 'Connect your wallet to get started'
                  }
                </p>
                {isAuthenticated && (
                  <Button
                    onClick={() => setShowNewChat(true)}
                    className="bg-gradient-to-r from-violet-600 to-purple-600"
                  >
                    Start New Chat
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Content Panel */}
        {rightSidebarOpen && (
          <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white capitalize">{activeRightTab}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setRightSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeRightTab === 'profile' && (currentAccount || appwriteUser) && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white text-2xl">
                        {getInitials(currentAccount?.name || appwriteUser?.name || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold text-white">
                      {currentAccount?.name || appwriteUser?.name || 'User'}
                    </h3>
                    {currentAccount?.email && (
                      <p className="text-gray-400">{currentAccount.email}</p>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="outline"
                    className="w-full"
                  >
                    Edit Profile
                  </Button>
                </div>
              )}
              
              {activeRightTab === 'wallet' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Wallet className="w-16 h-16 mx-auto mb-4 text-violet-400" />
                    <h3 className="text-lg font-semibold text-white mb-2">Wallet</h3>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Balance</p>
                    <p className="text-2xl font-bold text-white">$0.00</p>
                  </div>
                  <p className="text-center text-gray-400 text-sm">
                    Wallet features coming soon
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right Icon Sidebar */}
        <div className="w-16 bg-gray-950 border-l border-gray-800 flex flex-col items-center py-4 gap-2">
          {rightSidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleSidebarItemClick(item.id, true)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                activeRightTab === item.id && rightSidebarOpen
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      <NewChatModal
        open={showNewChat}
        onOpenChange={setShowNewChat}
        currentUserId={user?.id || ''}
        currentUsername={currentAccount?.name || appwriteUser?.name}
        onChatCreated={(conversationId) => {
          // Create and select a demo conversation immediately
          const demoConv: Conversation = {
            id: conversationId,
            participants: [user?.id || '', 'demo-user'],
            type: 'direct',
            lastMessage: {
              id: 'demo-last',
              senderId: user?.id || '',
              recipientId: 'demo-user',
              ciphertext: '🚀 Demo chat ready! Try sending gifts, crypto, or NFTs!',
              nonce: '',
              timestamp: new Date(),
              ratchetHeader: '',
              messageNumber: 0,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              name: `Demo Chat - ${conversationId.split('-')[1] || 'User'}`,
              settings: {
                ephemeralEnabled: false,
                notificationsEnabled: true,
                blockchainAnchoringEnabled: false,
              },
              isDemo: true,
            } as any,
          };
          console.log('[MainLayout] Creating demo conversation:', demoConv);
          setSelectedConversation(demoConv);
          setShowNewChat(false);
        }}
      />
      
      <SettingsOverlay
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
}
