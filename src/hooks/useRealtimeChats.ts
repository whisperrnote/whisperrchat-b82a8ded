import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

    const fetchChats = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_members')
          .select(`
            chat_id,
            chats!inner(
              id,
              name,
              type,
              created_at,
              updated_at,
              avatar_url,
              created_by
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const chatData = data?.map(item => ({
          id: item.chats.id,
          name: item.chats.name,
          type: item.chats.type,
          created_at: item.chats.created_at,
          updated_at: item.chats.updated_at,
          avatar_url: item.chats.avatar_url,
          created_by: item.chats.created_by
        })) || [];

        setChats(chatData);
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast.error('Failed to load chats');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [user]);

  // Set up realtime subscription for chat updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_chats')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_members',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          // Fetch the new chat details
          const { data } = await supabase
            .from('chats')
            .select('*')
            .eq('id', payload.new.chat_id)
            .single();
          
          if (data) {
            setChats(prev => [data, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chats'
        },
        (payload) => {
          const updatedChat = payload.new as Chat;
          setChats(prev => 
            prev.map(chat => 
              chat.id === updatedChat.id ? updatedChat : chat
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createChat = async (name?: string, type: 'direct' | 'group' | 'channel' = 'direct', participantIds: string[] = []) => {
    if (!user) return null;

    try {
      // Create chat
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert({
          name,
          type,
          created_by: user.id
        })
        .select()
        .single();

      if (chatError) throw chatError;

      // Add current user as member
      const { error: memberError } = await supabase
        .from('chat_members')
        .insert({
          chat_id: chat.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      // Add other participants
      if (participantIds.length > 0) {
        const memberInserts = participantIds.map(userId => ({
          chat_id: chat.id,
          user_id: userId,
          role: 'member' as const
        }));

        const { error: participantsError } = await supabase
          .from('chat_members')
          .insert(memberInserts);

        if (participantsError) throw participantsError;
      }

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