import { useState, useEffect } from 'react';
// Supabase removed; using in-memory placeholder store
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Chat {
  id: string;
  name?: string;
  type: 'direct' | 'group' | 'channel';
  created_at: string;
  updated_at: string;
  last_message?: string;
  last_message_time?: string;
  member_count?: number;
  avatar_url?: string;
  created_by?: string;
}

export const useRealtimeChats = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch initial chats
  useEffect(() => {
    if (!user) return;
    // Demo: load chats from localStorage
    const raw = localStorage.getItem('demo_chats');
    if (raw) {
      setChats(JSON.parse(raw));
    } else {
      const seed: Chat[] = [];
      localStorage.setItem('demo_chats', JSON.stringify(seed));
      setChats(seed);
    }
    setLoading(false);
  }, [user]);

  // Set up realtime subscription for chat updates
  useEffect(() => {
    // Placeholder realtime: polling localStorage for changes
    if (!user) return;
    const interval = setInterval(() => {
      const raw = localStorage.getItem('demo_chats');
      if (raw) {
        const parsed = JSON.parse(raw);
        setChats(parsed);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const createChat = async (name?: string, type: 'direct' | 'group' | 'channel' = 'direct', participantIds: string[] = []) => {
    if (!user) return null;
    try {
      const chat: Chat = {
        id: crypto.randomUUID(),
        name,
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user.id
      };
      setChats(prev => [chat, ...prev]);
      const stored = JSON.stringify([chat, ...chats]);
      localStorage.setItem('demo_chats', stored);
      return chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
      return null;
    }
  };

  return {
    chats,
    loading,
    createChat
  };
};