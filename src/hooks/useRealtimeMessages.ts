import { useState, useEffect } from 'react';
// Supabase removed; using localStorage polling
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  encrypted_content: string;
  encryption_key_id?: string;
  created_at: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'video' | 'system';
  reply_to_id?: string;
  edited_at?: string;
  sender_name?: string;
  sender_avatar?: string;
  sender_key_fingerprint?: string;
  file_name?: string;
  file_url?: string;
  file_size?: number;
  file_mime_type?: string;
  deleted_at?: string;
}

export const useRealtimeMessages = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch initial messages
  useEffect(() => {
    if (!chatId || !user) return;
    const raw = localStorage.getItem(`demo_messages_${chatId}`);
    if (raw) {
      setMessages(JSON.parse(raw));
    } else {
      localStorage.setItem(`demo_messages_${chatId}` , JSON.stringify([]));
      setMessages([]);
    }
    setLoading(false);
  }, [chatId, user]);

  // Set up realtime subscription
  useEffect(() => {
    if (!chatId || !user) return;
    const interval = setInterval(() => {
      const raw = localStorage.getItem(`demo_messages_${chatId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMessages(parsed);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [chatId, user]);

  const sendMessage = async (encryptedContent: string, messageType: 'text' | 'image' | 'file' | 'voice' | 'video' | 'system' = 'text') => {
    if (!user || !chatId) return false;
    try {
      const newMessage: Message = {
        id: crypto.randomUUID(),
        chat_id: chatId,
        sender_id: user.id,
        encrypted_content: encryptedContent,
        type: messageType,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMessage]);
      const raw = localStorage.getItem(`demo_messages_${chatId}`);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(newMessage);
      localStorage.setItem(`demo_messages_${chatId}` , JSON.stringify(arr));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return false;
    }
  };

  return {
    messages,
    loading,
    sendMessage
  };
};