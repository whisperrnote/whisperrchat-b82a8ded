import React, { useState, useEffect } from 'react';
import { Plus, Search, Lock, Users, X, Zap, Gift, Coins, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import type { Conversation, User } from '../../types';
import { messagingService, userService } from '@/lib/appwrite/services';
import type { Conversation as AppwriteConversation } from '@/lib/appwrite/services/messaging.service';

interface ConversationListProps {
  currentUser: User;
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export function ConversationList({ 
  currentUser, 
  onSelectConversation, 
  selectedConversationId 
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showNewConversationForm, setShowNewConversationForm] = useState(false);
  const [newConversationRecipient, setNewConversationRecipient] = useState('');
  const [selfConversation, setSelfConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    console.log('[ConversationList] Loading conversations for user:', currentUser.id);
    loadConversations();
    createSelfConversation();
    
    // Auto-select self conversation on first load for instant demo
    const timer = setTimeout(() => {
      if (selfConversation && !selectedConversationId) {
        console.log('[ConversationList] Auto-selecting self conversation');
        onSelectConversation(selfConversation);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [currentUser.id]);
  
  useEffect(() => {
    // Auto-select self conversation when it's created
    if (selfConversation && !selectedConversationId) {
      console.log('[ConversationList] Self conversation created, auto-selecting');
      onSelectConversation(selfConversation);
    }
  }, [selfConversation]);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const appwriteConvs = await messagingService.getUserConversations(currentUser.id);
      
      // Convert Appwrite conversations to legacy format
      const legacyConvs = appwriteConvs.map(convertToLegacyConversation);
      setConversations(legacyConvs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSelfConversation = () => {
    // Create a self-chat conversation with impressive demo messages
    const selfConv: Conversation = {
      id: `self-${currentUser.id}`,
      participants: [currentUser.id],
      type: 'direct',
      lastMessage: {
        id: 'self-last',
        senderId: currentUser.id,
        recipientId: currentUser.id,
        ciphertext: '🎁 Try sending gifts, crypto, or NFTs! Perfect for demos! 🚀',
        nonce: '',
        timestamp: new Date(),
        ratchetHeader: '',
        messageNumber: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        name: `${currentUser.displayName} (Me) - Try Features Here!`,
        settings: {
          ephemeralEnabled: false,
          notificationsEnabled: true,
          blockchainAnchoringEnabled: false,
        },
        isSelfChat: true,
        demoMessages: [
          { text: '👋 Welcome! This is your personal testing space', type: 'system' },
          { text: '💎 Send yourself gifts to see the UI', type: 'system' },
          { text: '💰 Test crypto transfers across 8 chains', type: 'system' },
          { text: '🦄 Try Epic & Legendary gifts - they\'re amazing!', type: 'system' },
          { text: '📱 Generate QR codes for quick sharing', type: 'system' },
          { text: '🎨 Everything works exactly like real chats!', type: 'system' },
        ],
      } as any, // Use any to allow extra properties
    };
    setSelfConversation(selfConv);
    console.log('Self-chat created:', selfConv);
  };

  const createDemoConversations = (): Conversation[] => {
    // Add demo conversations to make the list look populated
    return [
      {
        id: `bhav-${currentUser.id}`,
        participants: [currentUser.id, 'bhav'],
        type: 'direct',
        lastMessage: {
          id: 'bhav-last',
          senderId: 'bhav',
          recipientId: currentUser.id,
          ciphertext: 'Just sent you some ETH, check it out! 💰',
          nonce: '',
          timestamp: new Date(Date.now() - 3600000),
          ratchetHeader: '',
          messageNumber: 1,
        },
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 3600000),
        metadata: {
          name: 'Bhav',
          settings: {
            ephemeralEnabled: false,
            notificationsEnabled: true,
            blockchainAnchoringEnabled: true,
          },
        },
      },
      {
        id: `demo-liam-${currentUser.id}`,
        participants: [currentUser.id, 'demo-liam'],
        type: 'direct',
        lastMessage: {
          id: 'demo-liam-last',
          senderId: 'demo-liam',
          recipientId: currentUser.id,
          ciphertext: 'The new NFT drop is live! 🎨',
          nonce: '',
          timestamp: new Date(Date.now() - 5400000),
          ratchetHeader: '',
          messageNumber: 2,
        },
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(Date.now() - 5400000),
        metadata: {
          name: 'Liam',
          settings: {
            ephemeralEnabled: false,
            notificationsEnabled: true,
            blockchainAnchoringEnabled: true,
          },
        },
      },
      {
        id: `demo-jobin-${currentUser.id}`,
        participants: [currentUser.id, 'demo-jobin'],
        type: 'direct',
        lastMessage: {
          id: 'demo-jobin-last',
          senderId: currentUser.id,
          recipientId: 'demo-jobin',
          ciphertext: 'Thanks for the legendary gift! 🦄✨',
          nonce: '',
          timestamp: new Date(Date.now() - 7200000),
          ratchetHeader: '',
          messageNumber: 3,
        },
        createdAt: new Date(Date.now() - 259200000),
        updatedAt: new Date(Date.now() - 7200000),
        metadata: {
          name: 'Jobin',
          settings: {
            ephemeralEnabled: false,
            notificationsEnabled: true,
            blockchainAnchoringEnabled: true,
          },
        },
      },
    ];
  };

  const convertToLegacyConversation = (appwriteConv: AppwriteConversation): Conversation => {
    return {
      id: appwriteConv.$id,
      participants: appwriteConv.participantIds,
      encryptionType: 'e2e',
      lastMessage: {
        id: 'last-msg',
        senderId: appwriteConv.creatorId,
        recipientId: appwriteConv.participantIds[0],
        encryptedContent: appwriteConv.lastMessageText || '',
        timestamp: new Date(appwriteConv.lastMessageAt || appwriteConv.createdAt || ''),
        iv: '',
        status: 'read',
      },
      unreadCount: 0,
      createdAt: new Date(appwriteConv.createdAt || ''),
      updatedAt: new Date(appwriteConv.updatedAt || ''),
      metadata: {
        name: appwriteConv.name,
        type: appwriteConv.type,
      },
    };
  };

  const handleNewConversationClick = () => {
    setShowNewConversationForm(!showNewConversationForm);
    setNewConversationRecipient('');
  };

  const createNewConversation = async () => {
    if (!newConversationRecipient.trim()) return;

    try {
      const recipientId = newConversationRecipient.trim();

      const appwriteConv = await messagingService.getOrCreateDirectConversation(
        currentUser.id,
        recipientId
      );

      const legacyConv = convertToLegacyConversation(appwriteConv);
      onSelectConversation(legacyConv);
      setShowNewConversationForm(false);
      setNewConversationRecipient('');
      loadConversations(); // Refresh list
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  // Combine self conversation with demo conversations and regular conversations
  const demoConvs = conversations.length === 0 ? createDemoConversations() : [];
  const allConversations = selfConversation 
    ? [selfConversation, ...demoConvs, ...conversations] 
    : [...demoConvs, ...conversations];

  console.log('[ConversationList] All conversations:', allConversations.length);
  console.log('[ConversationList] Self conversation:', selfConversation ? 'exists' : 'null');
  console.log('[ConversationList] Demo conversations:', demoConvs.length);
  console.log('[ConversationList] Regular conversations:', conversations.length);

  const filteredConversations = allConversations.filter(conversation => {
    if (!searchQuery) return true;
    
    const name = conversation.metadata?.name || 
                 getOtherParticipantName(conversation);
    
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherParticipantName = (conversation: Conversation): string => {
    if (conversation.metadata?.isSelfChat) {
      return `${currentUser.displayName} (Me)`;
    }
    const otherParticipantId = conversation.participants.find(p => p !== currentUser.id);
    return otherParticipantId || 'Unknown';
  };

  const formatLastMessageTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(date));
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short'
      }).format(new Date(date));
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(new Date(date));
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Header */}
      <div className="p-4 border-b border-violet-900/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Chats</h3>
          <Button 
            onClick={handleNewConversationClick}
            variant={showNewConversationForm ? 'ghost' : 'default'}
            size="sm"
            className={showNewConversationForm 
              ? "h-8 w-8 text-violet-300 hover:text-white hover:bg-violet-800/50" 
              : "h-8 w-8 bg-violet-600 hover:bg-violet-700 text-white border-violet-500"
            }
            aria-label={showNewConversationForm ? "Cancel new conversation" : "New conversation"}
          >
            {showNewConversationForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </Button>
        </div>
        
        {showNewConversationForm ? (
          <div className="space-y-2">
            <Input
              placeholder="Enter wallet address or ENS..."
              value={newConversationRecipient}
              onChange={(e) => setNewConversationRecipient(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-violet-500"
            />
            <Button
              onClick={createNewConversation}
              disabled={!newConversationRecipient.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0"
            >
              <Zap className="w-4 w-4 mr-2" />
              Start Encrypted Chat
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-violet-500"
            />
          </div>
        )}
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-6">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600/20 to-purple-600/20 rounded-2xl flex items-center justify-center border border-violet-500/30 mb-4">
              <Users className="h-8 w-8 text-violet-400" />
            </div>
            <h4 className="text-white font-medium mb-2">No conversations yet</h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              Start your first encrypted conversation with crypto-powered messaging
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentUser={currentUser}
                isSelected={conversation.id === selectedConversationId}
                onClick={() => onSelectConversation(conversation)}
                getOtherParticipantName={getOtherParticipantName}
                formatLastMessageTime={formatLastMessageTime}
                getInitials={getInitials}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  currentUser: User;
  isSelected: boolean;
  onClick: () => void;
  getOtherParticipantName: (conversation: Conversation) => string;
  formatLastMessageTime: (date: Date) => string;
  getInitials: (name: string) => string;
}

function ConversationItem({ 
  conversation, 
  currentUser, 
  isSelected, 
  onClick,
  getOtherParticipantName,
  formatLastMessageTime,
  getInitials
}: ConversationItemProps) {
  const participantName = conversation.metadata.name || 
                         getOtherParticipantName(conversation);
  
  const lastMessageTime = conversation.lastMessage?.timestamp || conversation.updatedAt;
  
  return (
    <div
      onClick={onClick}
      className={`relative flex items-center gap-3 p-4 cursor-pointer border-b border-gray-800/50 transition-all duration-200 hover:bg-violet-900/20 ${
        isSelected ? 'bg-gradient-to-r from-violet-900/40 to-purple-900/20 border-r-2 border-r-violet-500' : ''
      }`}
    >
      <div className="relative">
        <Avatar className="h-12 w-12 border-2 border-gray-700">
          <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white font-semibold">
            {getInitials(participantName)}
          </AvatarFallback>
        </Avatar>
        {/* Online status indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-white truncate text-sm">
            {participantName}
          </h4>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>{formatLastMessageTime(lastMessageTime)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400 truncate mr-2">
            {conversation.lastMessage ? 'New encrypted message' : 'Start chatting securely'}
          </p>
          
          <div className="flex items-center gap-1">
            {/* Security badge */}
            <div className="flex items-center gap-1 bg-green-900/30 px-1.5 py-0.5 rounded text-xs border border-green-700/30">
              <Lock className="h-2.5 w-2.5 text-green-400" />
            </div>

            {/* Crypto features badges */}
            {conversation.metadata?.settings?.blockchainAnchoringEnabled && (
              <div className="flex items-center gap-1 bg-violet-900/30 px-1.5 py-0.5 rounded text-xs border border-violet-700/30">
                <Coins className="h-2.5 w-2.5 text-violet-400" />
              </div>
            )}

            {conversation.type === 'group' && (
              <div className="flex items-center gap-1 bg-blue-900/30 px-1.5 py-0.5 rounded text-xs border border-blue-700/30">
                <Users className="h-2.5 w-2.5 text-blue-400" />
                <span className="text-blue-300">{conversation.participants.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New message indicator */}
      {conversation.lastMessage && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full"></div>
      )}
    </div>
  );
}