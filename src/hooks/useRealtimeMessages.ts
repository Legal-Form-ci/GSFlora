import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

interface Profile {
  first_name: string;
  last_name: string;
  avatar_url: string | null;
}

interface Conversation {
  id: string;
  title: string | null;
  type: string;
  created_at: string;
  updated_at: string;
  lastMessage?: Message;
  unreadCount?: number;
}

export const useRealtimeMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      // Get conversations user is part of
      const { data: participations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (!participations || participations.length === 0) {
        setLoading(false);
        return;
      }

      const conversationIds = participations.map((p) => p.conversation_id);

      const { data: convos } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      if (convos) {
        // Get last message and unread count for each conversation
        const enrichedConvos = await Promise.all(
          convos.map(async (conv) => {
            const { data: messages } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: false })
              .limit(1);

            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .eq('is_read', false)
              .neq('sender_id', user.id);

            return {
              ...conv,
              lastMessage: messages?.[0],
              unreadCount: count || 0,
            };
          })
        );

        setConversations(enrichedConvos);
        setTotalUnread(enrichedConvos.reduce((sum, c) => sum + (c.unreadCount || 0), 0));
      }
      setLoading(false);
    };

    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === newMessage.conversation_id
                ? {
                    ...conv,
                    lastMessage: newMessage,
                    unreadCount:
                      newMessage.sender_id !== user.id
                        ? (conv.unreadCount || 0) + 1
                        : conv.unreadCount,
                  }
                : conv
            )
          );
          if (newMessage.sender_id !== user.id) {
            setTotalUnread((prev) => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markConversationAsRead = async (conversationId: string) => {
    if (!user) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id);

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
    setTotalUnread((prev) =>
      Math.max(
        0,
        prev - (conversations.find((c) => c.id === conversationId)?.unreadCount || 0)
      )
    );
  };

  return {
    conversations,
    loading,
    totalUnread,
    markConversationAsRead,
  };
};
