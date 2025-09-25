// @generated whisperrchat-tool: conversation-list hash: initial DO NOT EDIT DIRECTLY
// Conversation list component

import React, { useState, useEffect } from 'react';
import { Plus, Search, Lock, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Conversation, User } from '../../types';
import { messagingService } from '../../services';

interface ConversationListProps {
  currentUser: User;
  onSelectConversation: (conversation: Conversation) => void;
  onNewConversation: () => void;
  selectedConversationId?: string;
}

export function ConversationList({ 
  currentUser, 
  onSelectConversation, 
  onNewConversation,
  selectedConversationId 
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadConversations();

    // Listen for conversation updates
    const handleConversationCreated = (conversation: Conversation) => {
      setConversations(prev => [conversation, ...prev]);
    };

    const handleConversationUpdated = (conversation: Conversation) => {
      setConversations(prev => 
        prev.map(c => c.id === conversation.id ? conversation : c)
      );
    };

    messagingService.on('conversation:created', handleConversationCreated);
    messagingService.on('conversation:updated', handleConversationUpdated);

    return () => {
      messagingService.off('conversation:created', handleConversationCreated);
      messagingService.off('conversation:updated', handleConversationUpdated);
    };
  }, []);

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const convs = await messagingService.getConversations();
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conversation => {
    if (!searchQuery) return true;
    
    const name = conversation.metadata.name || 
                 getOtherParticipantName(conversation);
    
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherParticipantName = (conversation: Conversation): string => {
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h1>Messages</h1>
          <Button onClick={onNewConversation} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500">
            <Users className="w-8 h-8 mb-2" />
            <p>No conversations yet</p>
            <p className="text-sm">Start a new conversation to get started</p>
          </div>
        ) : (
          <div className="divide-y">
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
      </ScrollArea>
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
      className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={conversation.metadata.avatar} />
          <AvatarFallback>
            {getInitials(participantName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="truncate">{participantName}</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {formatLastMessageTime(lastMessageTime)}
              </span>
              <Lock className="w-3 h-3 text-green-500" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 truncate">
              {conversation.lastMessage ? 'New message' : 'No messages yet'}
            </p>
            
            <div className="flex items-center space-x-1">
              {conversation.type === 'group' && (
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  {conversation.participants.length}
                </Badge>
              )}
              
              {conversation.metadata.settings.blockchainAnchoringEnabled && (
                <Badge variant="secondary" className="text-xs">
                  Anchored
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}