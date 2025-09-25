// @generated whisperrchat-tool: chat-interface hash: initial DO NOT EDIT DIRECTLY
// Main chat interface component

import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, Shield, Anchor } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <h2>{conversation.metadata.name || getOtherParticipant()}</h2>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>E2EE</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>End-to-end encrypted</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {conversation.metadata.settings.blockchainAnchoringEnabled && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Anchor className="w-3 h-3" />
                      <span>Anchored</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Messages are anchored to blockchain</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUser.id}
                timestamp={formatTime(message.timestamp)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-12"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Shield className="w-4 h-4 text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Message will be encrypted before sending</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <Button 
            onClick={sendMessage} 
            disabled={!inputMessage.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: DecryptedMessage;
  isOwn: boolean;
  timestamp: string;
}

function MessageBubble({ message, isOwn, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 dark:bg-gray-700'
      }`}>
        <p className="break-words">{message.content}</p>
        <p className={`text-xs mt-1 ${
          isOwn ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {timestamp}
        </p>
      </div>
    </div>
  );
}