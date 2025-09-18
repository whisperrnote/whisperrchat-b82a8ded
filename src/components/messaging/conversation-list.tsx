import React, { useState, useEffect } from 'react';
import { Plus, Search, Lock, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
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
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Messages</h3>
          <Button 
            onClick={onNewConversation}
            size="sm"
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <h4 className="text-foreground font-medium">No conversations yet</h4>
            <p className="text-sm text-muted-foreground">Start a new conversation to get started</p>
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
      className={`flex items-center gap-3 p-4 cursor-pointer border-b border-border transition-colors hover:bg-accent/50 ${
        isSelected ? 'bg-accent border-r-2 border-r-primary' : ''
      }`}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
          {getInitials(participantName)}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-foreground truncate">
            {participantName}
          </h4>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{formatLastMessageTime(lastMessageTime)}</span>
            <Lock className="h-3 w-3 text-security" />
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm text-muted-foreground truncate">
            {conversation.lastMessage ? 'New message' : 'No messages yet'}
          </p>
          
          <div className="flex gap-1">
            {conversation.type === 'group' && (
              <Badge variant="outline" className="h-5 text-xs">
                <Users className="h-3 w-3 mr-1" />
                {conversation.participants.length}
              </Badge>
            )}
            
            {conversation.metadata.settings.blockchainAnchoringEnabled && (
              <Badge variant="secondary" className="h-5 text-xs">
                Anchored
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}