// @generated whisperrchat-tool: conversation-list hash: initial DO NOT EDIT DIRECTLY
// Conversation list component

import { useState, useEffect } from 'react';
import { Plus, Search, Lock, Users } from 'lucide-react';
import { Box, Typography, TextField, Card, CardContent, Avatar, Chip, List, ListItem, ListItemAvatar, ListItemText, IconButton } from '@mui/material';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: 'white' }}>Messages</Typography>
          <IconButton 
            onClick={onNewConversation} 
            size="small"
            sx={{ 
              bgcolor: '#8b5cf6', 
              color: 'white',
              '&:hover': { bgcolor: '#7c3aed' }
            }}
          >
            <Plus style={{ fontSize: 16 }} />
          </IconButton>
        </Box>
        
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <Search style={{ color: 'rgba(255,255,255,0.5)', marginRight: 8, fontSize: 16 }} />
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              color: 'white',
              '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.5)' },
              '&:hover fieldset': { borderColor: '#8b5cf6' },
              '& input::placeholder': { color: 'rgba(255,255,255,0.5)' }
            }
          }}
        />
      </Box>

      {/* Conversations */}
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <Box sx={{ 
              animation: 'spin 1s linear infinite',
              width: 32,
              height: 32,
              border: '2px solid transparent',
              borderTop: '2px solid #8b5cf6',
              borderRadius: '50%'
            }} />
          </Box>
        ) : filteredConversations.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', textAlign: 'center' }}>
            <Users style={{ color: 'rgba(255,255,255,0.5)', fontSize: 32, marginBottom: 8 }} />
            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)' }}>No conversations yet</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>Start a new conversation to get started</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
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
          </List>
        )}
      </Box>
    </Box>
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
    <ListItem
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        bgcolor: isSelected ? 'rgba(139, 92, 246, 0.2)' : 'transparent',
        borderRight: isSelected ? '3px solid #8b5cf6' : 'none',
        '&:hover': {
          bgcolor: 'rgba(139, 92, 246, 0.1)'
        },
        transition: 'all 0.2s'
      }}
    >
      <ListItemAvatar>
        <Avatar 
          src={conversation.metadata.avatar}
          sx={{ bgcolor: '#8b5cf6' }}
        >
          {getInitials(participantName)}
        </Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle1" sx={{ color: 'white', fontWeight: 500 }}>
              {participantName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                {formatLastMessageTime(lastMessageTime)}
              </Typography>
              <Lock style={{ color: '#10b981', fontSize: 12 }} />
            </Box>
          </Box>
        }
        secondary={
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              {conversation.lastMessage ? 'New message' : 'No messages yet'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {conversation.type === 'group' && (
                <Chip 
                  icon={<Users style={{ fontSize: 12 }} />}
                  label={conversation.participants.length}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    borderColor: 'rgba(139, 92, 246, 0.5)', 
                    color: 'white' 
                  }}
                />
              )}
              
              {conversation.metadata.settings.blockchainAnchoringEnabled && (
                <Chip 
                  label="Anchored"
                  size="small"
                  sx={{ 
                    height: 20, 
                    fontSize: '0.7rem',
                    bgcolor: 'rgba(139, 92, 246, 0.3)', 
                    color: 'white' 
                  }}
                />
              )}
            </Box>
          </Box>
        }
      />
    </ListItem>
  );
}