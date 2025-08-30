import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, LockOpen, AlertTriangle, Copy, Check } from 'lucide-react';
import { useEncryption } from '@/hooks/useEncryption';
import { toast } from 'sonner';

interface ChatMessageProps {
  id: string;
  encryptedContent: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  sent: boolean;
  keyFingerprint?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  encryptedContent,
  senderId,
  senderName,
  senderAvatar,
  timestamp,
  sent,
  keyFingerprint
}) => {
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [decryptionError, setDecryptionError] = useState(false);
  const [copied, setCopied] = useState(false);
  const { decryptReceivedMessage, deviceKey } = useEncryption();

  useEffect(() => {
    const decryptMessage = async () => {
      try {
        const content = await decryptReceivedMessage(id, encryptedContent);
        if (content) {
          setDecryptedContent(content);
          setDecryptionError(false);
        } else {
          setDecryptionError(true);
        }
      } catch (error) {
        console.error('Decryption failed:', error);
        setDecryptionError(true);
      }
    };

    if (!sent) {
      decryptMessage();
    } else {
      // For sent messages, we might have the content in a different way
      // For now, we'll assume it's already decrypted for sent messages
      setDecryptedContent(encryptedContent);
    }
  }, [id, encryptedContent, sent, decryptReceivedMessage]);

  const copyFingerprint = async () => {
    if (keyFingerprint) {
      await navigator.clipboard.writeText(keyFingerprint);
      setCopied(true);
      toast.success('Key fingerprint copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const isVerified = deviceKey && keyFingerprint && !decryptionError;

  return (
    <div className={`flex ${sent ? 'justify-end' : 'justify-start'} group`}>
      <div className={`max-w-xs lg:max-w-md flex ${sent ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        {!sent && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={senderAvatar} />
            <AvatarFallback className="text-xs">
              {senderName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className="flex flex-col gap-1">
          {!sent && (
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs font-medium text-muted-foreground">
                {senderName}
              </span>
              <div className="flex items-center gap-1">
                {isVerified ? (
                  <Lock className="w-3 h-3 text-security" />
                ) : decryptionError ? (
                  <AlertTriangle className="w-3 h-3 text-destructive" />
                ) : (
                  <LockOpen className="w-3 h-3 text-warning" />
                )}
                {keyFingerprint && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={copyFingerprint}
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-security" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}
          
          <div
            className={`px-4 py-2 rounded-2xl relative ${
              sent
                ? 'bg-chat-bubble-sent text-chat-bubble-sent-foreground'
                : 'bg-chat-bubble-received text-chat-bubble-received-foreground'
            } ${decryptionError ? 'border border-destructive' : ''}`}
          >
            {decryptionError ? (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Failed to decrypt message</span>
              </div>
            ) : (
              <>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {decryptedContent || (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="w-3 h-3 animate-pulse" />
                      Decrypting...
                    </span>
                  )}
                </p>
                
                <div className={`flex items-center justify-between mt-1 ${
                  sent ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <span className={`text-xs ${
                    sent 
                      ? 'text-chat-bubble-sent-foreground/70' 
                      : 'text-chat-bubble-received-foreground/70'
                  }`}>
                    {formatTime(timestamp)}
                  </span>
                  
                  {isVerified && (
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-security/10 text-security border-security/20"
                    >
                      <Lock className="w-2 h-2 mr-1" />
                      E2EE
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
          
          {keyFingerprint && (
            <div className="px-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-mono text-muted-foreground">
                Key: {keyFingerprint}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;