// @generated whisperrchat-tool: chat-interface hash: initial DO NOT EDIT DIRECTLY
// Main chat interface component

import { useState, useEffect, useRef } from 'react';
import { Send, Lock, Shield, Anchor } from 'lucide-react';
import { Paper, Box, Typography, IconButton, TextField, Chip, Tooltip } from '@mui/material';
import type { DecryptedMessage, EncryptedMessage, Conversation, User } from '../../types';
import { messagingService } from '../../services';

interface ChatInterfaceProps {
  conversation: Conversation;
  currentUser: User;
  onClose: () => void;
}

export function ChatInterface({ conversation, currentUser, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [encryptedMessages, setEncryptedMessages] = useState<EncryptedMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Listen for new messages
    const handleNewMessage = (encryptedMsg: EncryptedMessage) => {
      if (encryptedMsg.recipientId === currentUser.id || 
          encryptedMsg.senderId === currentUser.id) {
        decryptAndAddMessage(encryptedMsg);
      }
    };

    messagingService.on('message:sent', handleNewMessage);
    messagingService.on('message:received', handleNewMessage);

    return () => {
      messagingService.off('message:sent', handleNewMessage);
      messagingService.off('message:received', handleNewMessage);
    };
  }, [conversation.id, currentUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const encryptedMsgs = await messagingService.getMessages(conversation.id);
      setEncryptedMessages(encryptedMsgs);
      
      // Decrypt messages for display
      const decryptedMsgs: DecryptedMessage[] = [];
      for (const encMsg of encryptedMsgs) {
        try {
          const decrypted = await messagingService.decryptMessage(encMsg);
          decryptedMsgs.push(decrypted);
        } catch (error) {
          console.error('Failed to decrypt message:', error);
          // Add placeholder for failed decryption
          decryptedMsgs.push({
            id: encMsg.id,
            senderId: encMsg.senderId,
            recipientId: encMsg.recipientId,
            content: '[Message could not be decrypted]',
            timestamp: encMsg.timestamp,
            type: 'text'
          });
        }
      }
      
      setMessages(decryptedMsgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const decryptAndAddMessage = async (encryptedMsg: EncryptedMessage) => {
    try {
      const decrypted = await messagingService.decryptMessage(encryptedMsg);
      setMessages(prev => [...prev, decrypted]);
    } catch (error) {
      console.error('Failed to decrypt new message:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const recipientId = conversation.participants.find(p => p !== currentUser.id) || '';
    
    const message: DecryptedMessage = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random()}`,
      senderId: currentUser.id,
      recipientId,
      content: inputMessage.trim(),
      timestamp: new Date(),
      type: 'text'
    };

    try {
      setInputMessage('');
      setMessages(prev => [...prev, message]);
      
      await messagingService.sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove message from UI on failure
      setMessages(prev => prev.filter(m => m.id !== message.id));
      setInputMessage(message.content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };

  const getOtherParticipant = () => {
    const otherParticipantId = conversation.participants.find(p => p !== currentUser.id);
    return otherParticipantId || 'Unknown';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <Paper sx={{ p: 2, borderBottom: '1px solid rgba(139, 92, 246, 0.2)', bgcolor: 'rgba(139, 92, 246, 0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              {conversation.metadata.name || getOtherParticipant()}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="End-to-end encrypted">
                <Chip 
                  icon={<Lock style={{ fontSize: 14 }} />} 
                  label="E2EE" 
                  size="small" 
                  sx={{ bgcolor: 'rgba(139, 92, 246, 0.3)', color: 'white' }}
                />
              </Tooltip>
              
              {conversation.metadata.settings.blockchainAnchoringEnabled && (
                <Tooltip title="Messages are anchored to blockchain">
                  <Chip 
                    icon={<Anchor style={{ fontSize: 14 }} />} 
                    label="Anchored" 
                    size="small" 
                    variant="outlined"
                    sx={{ borderColor: '#8b5cf6', color: 'white' }}
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
          
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            ✕
          </IconButton>
        </Box>
      </Paper>

      {/* Messages */}
      <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
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
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUser.id}
                timestamp={formatTime(message.timestamp)}
              />
            ))}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Input */}
      <Paper sx={{ p: 2, borderTop: '1px solid rgba(139, 92, 246, 0.2)', bgcolor: 'rgba(139, 92, 246, 0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            fullWidth
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                color: 'white',
                '& fieldset': { borderColor: 'rgba(139, 92, 246, 0.5)' },
                '&:hover fieldset': { borderColor: '#8b5cf6' },
                '& input::placeholder': { color: 'rgba(255,255,255,0.5)' }
              }
            }}
            InputProps={{
              endAdornment: (
                <Tooltip title="Message will be encrypted before sending">
                  <Shield style={{ color: '#10b981', fontSize: 16 }} />
                </Tooltip>
              )
            }}
          />
          <IconButton 
            onClick={sendMessage} 
            disabled={!inputMessage.trim()}
            sx={{ 
              bgcolor: inputMessage.trim() ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)',
              color: 'white',
              '&:hover': { bgcolor: '#7c3aed' }
            }}
          >
            <Send style={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
}

interface MessageBubbleProps {
  message: DecryptedMessage;
  isOwn: boolean;
  timestamp: string;
}

function MessageBubble({ message, isOwn, timestamp }: MessageBubbleProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
      <Paper sx={{
        maxWidth: { xs: '75%', md: '60%' },
        p: 1.5,
        bgcolor: isOwn ? '#8b5cf6' : 'rgba(139, 92, 246, 0.1)',
        color: 'white',
        backdropFilter: 'blur(10px)'
      }}>
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {message.content}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: isOwn ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)', 
            display: 'block',
            mt: 0.5 
          }}
        >
          {timestamp}
        </Typography>
      </Paper>
    </Box>
  );
}