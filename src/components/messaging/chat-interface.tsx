import React, { useState, useEffect, useRef } from 'react';
import { Send, Lock, Shield, Anchor, X, Gift } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import type { DecryptedMessage, EncryptedMessage, Conversation, User } from '../../types';
import { messagingService, giftingService } from '../../services';
import { GiftDialog } from '../gifting/gift-dialog';

interface ChatInterfaceProps {
  conversation: Conversation;
  currentUser: User;
  onClose: () => void;
}

export function ChatInterface({ conversation, currentUser, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
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

  const sendMessage = async (content?: string, type: 'text' | 'gift' = 'text') => {
    const messageContent = content || inputMessage.trim();
    if (!messageContent) return;

    const recipientId = conversation.participants.find(p => p !== currentUser.id) || '';
    
    const message: DecryptedMessage = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random()}`,
      senderId: currentUser.id,
      recipientId,
      content: messageContent,
      timestamp: new Date(),
      type
    };

    try {
      if (type === 'text') {
        setInputMessage('');
      }
      setMessages(prev => [...prev, message]);
      
      await messagingService.sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove message from UI on failure
      setMessages(prev => prev.filter(m => m.id !== message.id));
      if (type === 'text') {
        setInputMessage(message.content);
      }
    }
  };

  const handleSendGift = async (amount: number) => {
    const recipientId = conversation.participants.find(p => p !== currentUser.id) || '';
    try {
      await giftingService.sendGift(currentUser, recipientId, amount);
      const giftMessage = JSON.stringify({ amount, recipientName: getOtherParticipant(), senderName: currentUser.displayName });
      sendMessage(giftMessage, 'gift');
    } catch (error) {
      console.error('Failed to send gift:', error);
      // Optionally, show an error to the user
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
      <Card className="border-b border-border rounded-none bg-card">
        <CardHeader className="flex flex-row items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">
              {conversation.metadata.name || getOtherParticipant()}
            </h3>
            <div className="flex gap-2">
              <Badge variant="secondary" className="gap-1">
                <Lock className="h-3 w-3" />
                E2EE
              </Badge>
              
              {conversation.metadata.settings.blockchainAnchoringEnabled && (
                <Badge variant="outline" className="gap-1">
                  <Anchor className="h-3 w-3" />
                  Anchored
                </Badge>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
      </Card>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-background">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
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
      </div>

      {/* Input */}
      <Card className="border-t border-border rounded-none bg-card">
        <CardContent className="p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="min-h-[40px] max-h-32 resize-none"
              />
            </div>
            <Button 
              variant="ghost"
              size="icon"
              onClick={() => setShowGiftDialog(true)}
              className="shrink-0"
              aria-label="Send a gift"
            >
              <Gift className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => sendMessage()}
              disabled={!inputMessage.trim()}
              size="icon"
              className="shrink-0"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <GiftDialog
        open={showGiftDialog}
        onOpenChange={setShowGiftDialog}
        onSendGift={handleSendGift}
        recipientName={getOtherParticipant()}
      />
    </div>
  );
}

interface MessageBubbleProps {
  message: DecryptedMessage;
  isOwn: boolean;
  timestamp: string;
}

function MessageBubble({ message, isOwn, timestamp }: MessageBubbleProps) {
  if (message.type === 'gift') {
    try {
      const giftData = JSON.parse(message.content);
      const { amount, senderName, recipientName } = giftData;

      return (
        <div className="flex justify-center my-2 animate-bubble-in">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 rounded-full px-4 py-1">
            <Gift className="h-4 w-4 text-primary" />
            <span>
              <strong>{senderName}</strong> sent a <strong>${amount}</strong> gift to <strong>{recipientName}</strong>!
            </span>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Failed to parse gift message content:', error);
      return null; // Don't render malformed gift messages
    }
  }

  const bubbleClasses = isOwn
    ? 'bg-chat-bubble-sent text-chat-bubble-sent-foreground border-primary/50'
    : 'bg-chat-bubble-received text-chat-bubble-received-foreground border-accent/50';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-bubble-in`}>
      <Card className={`max-w-[70%] border ${bubbleClasses}`}>
        <CardContent className="p-3">
          <p className="break-words">{message.content}</p>
          <p className={`text-xs mt-1 ${isOwn ? 'text-right' : 'text-left'} opacity-75`}>
            {timestamp}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}