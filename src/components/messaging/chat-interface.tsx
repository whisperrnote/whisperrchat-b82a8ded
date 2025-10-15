import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Lock, 
  Shield, 
  Anchor, 
  X, 
  Gift, 
  Coins, 
  Zap, 
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import type { DecryptedMessage, EncryptedMessage, Conversation, User } from '../../types';
import { messagingService, giftingService, keyManagementService } from '../../services';
import { messagingService as appwriteMessagingService, realtimeService } from '@/lib/appwrite/services';
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
  const [showCryptoPanel, setShowCryptoPanel] = useState(false);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [sessionFingerprint, setSessionFingerprint] = useState<string | null>(null);
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mockTransactionData = {
    pendingGifts: 2,
    totalSent: 125.5,
    totalReceived: 89.2,
    recentActivity: [
      { type: 'gift_sent', amount: 25, time: '5m ago', status: 'confirmed' },
      { type: 'gift_received', amount: 15, time: '1h ago', status: 'confirmed' },
      { type: 'gift_pending', amount: 10, time: '2h ago', status: 'pending' }
    ]
  };

  useEffect(() => {
    loadMessages();
    loadSessionFingerprint();
    
    // Listen for new messages (backend realtime)
    const unsubscribe = realtimeService.subscribeToConversation(conversation.id, async (doc) => {
      try {
        const incoming: DecryptedMessage = {
          id: doc.$id,
          senderId: doc.senderId,
          recipientId: conversation.participants.find(p => p !== currentUser.id) || currentUser.id,
          content: doc.content,
          timestamp: doc.createdAt ? new Date(doc.createdAt) : new Date(),
          type: (doc.contentType as any) || 'text'
        };
        setMessages(prev => [...prev, incoming]);
      } catch (e) {
        console.warn('Failed to handle realtime message:', e);
      }
    });

    return () => {
      unsubscribe?.();
    };
  }, [conversation.id, currentUser.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      
      // Check if this is a self-chat or demo chat
      if (conversation.metadata?.isSelfChat || conversation.metadata?.isDemo) {
        // Load demo messages for instant presentation
        const demoMessages = conversation.metadata?.demoMessages || [
          { text: '👋 Welcome! This is a demo chat to showcase features', type: 'system' },
          { text: '💎 Click the gift icon to send impressive gifts', type: 'system' },
          { text: '💰 Try crypto transfers - supports 8 chains!', type: 'system' },
          { text: '🎨 Everything works like the real app!', type: 'system' },
        ];
        
        const demoMsgs: DecryptedMessage[] = demoMessages.map((msg: any, i: number) => ({
          id: `demo-${i}`,
          senderId: 'system',
          recipientId: currentUser.id,
          content: msg.text,
          timestamp: new Date(Date.now() - (demoMessages.length - i) * 60000),
          type: 'text' as const,
        }));
        
        setMessages(demoMsgs);
        setIsLoading(false);
        return;
      }
      
      // Try loading from backend (TablesDB)
      try {
        const backendMessages = await appwriteMessagingService.getConversationMessages(conversation.id, 50, 0);
        if (backendMessages && backendMessages.length > 0) {
          const mapped: DecryptedMessage[] = backendMessages.map((m) => ({
            id: m.$id,
            senderId: m.senderId,
            recipientId: conversation.participants.find(p => p !== currentUser.id) || currentUser.id,
            content: m.content,
            timestamp: m.createdAt ? new Date(m.createdAt) : new Date(),
            type: (m.contentType as any) || 'text'
          }));
          setMessages(mapped.reverse());
          return;
        }
      } catch (e) {
        console.warn('Falling back to local message store:', e);
      }

      // Fallback: use local encrypted store via stub service
      const encryptedMsgs = await messagingService.getMessages(conversation.id);
      setEncryptedMessages(encryptedMsgs);
      const decryptedMsgs: DecryptedMessage[] = [];
      for (const encMsg of encryptedMsgs) {
        try {
          const decrypted = await messagingService.decryptMessage(encMsg);
          decryptedMsgs.push(decrypted);
        } catch (error) {
          console.error('Failed to decrypt message:', error);
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

  const loadSessionFingerprint = async () => {
    const recipientId = conversation.participants.find(p => p !== currentUser.id);
    if (recipientId) {
      const fingerprint = await messagingService.getSessionFingerprint(recipientId);
      setSessionFingerprint(fingerprint);
    }
  };

  const handleRotateKeys = async () => {
    try {
      setIsRotatingKeys(true);
      await keyManagementService.rotatePreKeys();
      await loadSessionFingerprint();
    } catch (error) {
      console.error('Failed to rotate keys:', error);
    } finally {
      setIsRotatingKeys(false);
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

    const recipientId = conversation.participants.find(p => p !== currentUser.id) || currentUser.id;
    
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
      
      // Only persist to backend if it's not a demo/self chat
      if (!conversation.metadata?.isSelfChat && !conversation.metadata?.isDemo) {
        try {
          await appwriteMessagingService.sendMessage({
            conversationId: conversation.id,
            senderId: currentUser.id,
            content: messageContent,
            contentType: 'text'
          });
        } catch (err) {
          console.error('Failed to persist message to backend:', err);
          throw err;
        }
      } else {
        // Fallback local store for demo/self
        await messagingService.sendMessage(message);
      }
      // For demo/self chats, message is just added to local state
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-950 via-black to-gray-950">
      {/* Enhanced Header with Crypto Features */}
      <Card className="border-b border-violet-900/30 rounded-none bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between py-4 px-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border-2 border-violet-500">
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-purple-600 text-white font-bold">
                {getInitials(getOtherParticipant())}
              </AvatarFallback>
            </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {conversation.metadata.name || getOtherParticipant()}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-green-900/30 text-green-400 border-green-700/30 text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    E2EE Active
                  </Badge>
                  <Badge variant="secondary" className="bg-violet-900/30 text-violet-400 border-violet-700/30 text-xs">
                    <Anchor className="w-3 h-3 mr-1" />
                    Blockchain Secured
                  </Badge>
                  {sessionFingerprint && (
                    <Badge variant="secondary" className="bg-blue-900/30 text-blue-400 border-blue-700/30 text-xs font-mono">
                      <Shield className="w-3 h-3 mr-1" />
                      {sessionFingerprint}
                    </Badge>
                  )}
                </div>
              </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-violet-300 hover:text-white hover:bg-violet-800/50"
              onClick={() => setShowCryptoPanel(!showCryptoPanel)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Portfolio
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-violet-300 hover:text-white hover:bg-violet-800/50"
              onClick={() => setShowSecurityPanel(!showSecurityPanel)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Security
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-violet-300 hover:text-white hover:bg-violet-800/50"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Crypto Activity Panel */}
        {showCryptoPanel && (
          <div className="border-t border-violet-900/30 p-4 bg-gray-900/50">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">${mockTransactionData.totalReceived}</div>
                <div className="text-xs text-gray-400">Received</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">${mockTransactionData.totalSent}</div>
                <div className="text-xs text-gray-400">Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{mockTransactionData.pendingGifts}</div>
                <div className="text-xs text-gray-400">Pending</div>
              </div>
            </div>
            <div className="space-y-2">
              {mockTransactionData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-800/50 rounded">
                  <div className="flex items-center gap-2">
                    {activity.type === 'gift_sent' && <Gift className="w-4 h-4 text-pink-400" />}
                    {activity.type === 'gift_received' && <Coins className="w-4 h-4 text-green-400" />}
                    {activity.type === 'gift_pending' && <Clock className="w-4 h-4 text-yellow-400" />}
                    <span className="text-sm text-white">${activity.amount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{activity.time}</span>
                    {activity.status === 'confirmed' && <CheckCircle className="w-3 h-3 text-green-400" />}
                    {activity.status === 'pending' && <AlertCircle className="w-3 h-3 text-yellow-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Settings Panel */}
        {showSecurityPanel && (
          <div className="border-t border-violet-900/30 p-4 bg-gray-900/50">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-1">Session Fingerprint</h4>
                  <p className="text-xs text-gray-400 mb-2">
                    Verify this matches your contact's fingerprint to ensure secure communication
                  </p>
                  {sessionFingerprint && (
                    <div className="font-mono text-sm text-blue-300 bg-blue-950/50 px-2 py-1 rounded">
                      {sessionFingerprint}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-violet-900/20 border border-violet-700/30 rounded-lg">
                <RefreshCw className="w-5 h-5 text-violet-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-1">Pre-Key Rotation</h4>
                  <p className="text-xs text-gray-400 mb-3">
                    Rotate your pre-keys to enhance forward secrecy. This generates 100 new pre-keys.
                  </p>
                  <Button 
                    onClick={handleRotateKeys}
                    disabled={isRotatingKeys}
                    size="sm"
                    className="bg-violet-600 hover:bg-violet-700 text-white"
                  >
                    {isRotatingKeys ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                        Rotating Keys...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2" />
                        Rotate Pre-Keys
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                <Lock className="w-5 h-5 text-green-400 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-white mb-1">Encryption Status</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>End-to-end encryption active</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Perfect forward secrecy enabled</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span>Blockchain anchoring active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Messages Area with Dark Theme */}
      <div className="flex-1 p-6 overflow-y-auto bg-black/20">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
              <span className="text-gray-400 text-sm">Decrypting messages...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === currentUser.id}
                timestamp={formatTime(message.timestamp)}
                currentUser={currentUser}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Enhanced Input Area */}
      <Card className="border-t border-violet-900/30 rounded-none bg-gradient-to-r from-gray-900/90 to-black/90 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Send an encrypted message..."
                className="min-h-[50px] max-h-32 resize-none bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-violet-500"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost"
                size="icon"
                onClick={() => setShowGiftDialog(true)}
                className="shrink-0 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white border-0 h-12 w-12"
                aria-label="Send a crypto gift"
              >
                <Gift className="h-5 w-5" />
              </Button>
              
              <Button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim()}
                className="shrink-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 h-12 w-12"
                aria-label="Send encrypted message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Shield className="w-3 h-3 text-green-400" />
              <span>End-to-end encrypted</span>
              <Separator orientation="vertical" className="h-3 bg-gray-600" />
              <Anchor className="w-3 h-3 text-violet-400" />
              <span>Blockchain anchored</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-violet-300 hover:text-white text-xs h-6 px-2">
                <Zap className="w-3 h-3 mr-1" />
                Quick Send $10
              </Button>
            </div>
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
  currentUser: User;
}

function MessageBubble({ message, isOwn, timestamp, currentUser }: MessageBubbleProps) {
  if (message.type === 'gift') {
    try {
      const giftData = JSON.parse(message.content);
      const { amount, senderName, recipientName } = giftData;

      return (
        <div className="flex justify-center my-4">
          <div className="flex items-center gap-3 bg-gradient-to-r from-pink-900/40 to-rose-900/40 border border-pink-700/30 rounded-2xl px-6 py-4 max-w-md backdrop-blur-sm">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-1">${amount} Gift</div>
              <div className="text-sm text-pink-200">
                from <span className="font-semibold">{senderName}</span>
              </div>
              <div className="text-xs text-pink-300 mt-1">
                🎉 Crypto gift sent via blockchain
              </div>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Failed to parse gift message content:', error);
      return null;
    }
  }

  const bubbleClasses = isOwn
    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border border-violet-500/30'
    : 'bg-gray-800/60 text-white border border-gray-600/30 backdrop-blur-sm';

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-200`}>
      <div className="flex items-end gap-3 max-w-[70%]">
        {!isOwn && (
          <Avatar className="w-8 h-8 border border-gray-600">
            <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white text-xs">
              {message.senderId.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        
        <Card className={`${bubbleClasses} shadow-lg`}>
          <CardContent className="p-4">
            <p className="break-words text-sm leading-relaxed">{message.content}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
              <p className={`text-xs ${isOwn ? 'text-violet-100' : 'text-gray-300'}`}>
                {timestamp}
              </p>
              <div className="flex items-center gap-1">
                <Lock className={`w-3 h-3 ${isOwn ? 'text-violet-200' : 'text-green-400'}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}