import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Home,
  MessageSquare,
  Send,
  Plus,
  Search,
  Loader2,
  Users,
  Check,
  CheckCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Tableau de bord', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
];

interface Conversation {
  id: string;
  title: string | null;
  type: string;
  updated_at: string;
  participants: {
    user_id: string;
    profile: {
      first_name: string;
      last_name: string;
    };
  }[];
  lastMessage?: {
    content: string;
    created_at: string;
    is_read: boolean;
  };
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
  conversation_id?: string;
  sender?: {
    first_name: string;
    last_name: string;
  };
}

interface UserOption {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role?: string;
}

const MessagesPage = () => {
  const { user, profile, role } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUsers();
      
      // Subscribe to new messages
      const channel = supabase
        .channel('messages-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
          },
          (payload) => {
            const newMsg = payload.new as Message;
            if (newMsg.conversation_id === selectedConversation) {
              setMessages((prev) => [...prev, newMsg]);
              scrollToBottom();
            }
            fetchConversations(); // Refresh conversations list
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const { data: participations } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user?.id);

      if (!participations?.length) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const conversationIds = participations.map((p) => p.conversation_id);

      const { data: convos } = await supabase
        .from('conversations')
        .select('*')
        .in('id', conversationIds)
        .order('updated_at', { ascending: false });

      // Fetch participants for each conversation
      const conversationsWithDetails = await Promise.all(
        (convos || []).map(async (conv) => {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.id);

          // Get profiles for participants
          const participantProfiles = await Promise.all(
            (participants || [])
              .filter((p) => p.user_id !== user?.id)
              .map(async (p) => {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('first_name, last_name')
                  .eq('id', p.user_id)
                  .single();
                return { user_id: p.user_id, profile: profile || { first_name: '', last_name: '' } };
              })
          );

          // Get last message
          const { data: lastMessages } = await supabase
            .from('messages')
            .select('content, created_at, is_read')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user?.id);

          return {
            ...conv,
            participants: participantProfiles,
            lastMessage: lastMessages?.[0] || null,
            unreadCount: unreadCount || 0,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      // Get sender profiles
      const messagesWithSenders = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', msg.sender_id)
            .single();
          return { ...msg, sender: senderProfile };
        })
      );

      setMessages(messagesWithSenders);
      scrollToBottom();

      // Mark messages as read
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user?.id);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .neq('id', user?.id)
        .order('last_name');

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        (data || []).map(async (u) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', u.id)
            .single();
          return { ...u, role: roleData?.role };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        sender_id: user?.id,
        content: newMessage.trim(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Sélectionnez au moins un destinataire');
      return;
    }

    try {
      // Create conversation
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          type: selectedUsers.length > 1 ? 'group' : 'direct',
          title: selectedUsers.length > 1 ? 'Groupe' : null,
        })
        .select()
        .single();

      if (!newConv) throw new Error('Failed to create conversation');

      // Add participants
      const participants = [user?.id, ...selectedUsers].map((userId) => ({
        conversation_id: newConv.id,
        user_id: userId,
      }));

      await supabase.from('conversation_participants').insert(participants);

      toast.success('Conversation créée');
      setShowNewConversationModal(false);
      setSelectedUsers([]);
      fetchConversations();
      setSelectedConversation(newConv.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Erreur lors de la création');
    }
  };

  const getConversationTitle = (conv: Conversation) => {
    if (conv.title) return conv.title;
    if (conv.participants.length === 0) return 'Conversation';
    const names = conv.participants.map((p) => `${p.profile.first_name} ${p.profile.last_name}`);
    return names.join(', ');
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const roleLabels: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    teacher: 'Enseignant',
    student: 'Élève',
    parent: 'Parent',
    educator: 'Éducateur',
    censor: 'Censeur',
    founder: 'Fondateur',
    principal_teacher: 'Prof. Principal',
  };

  const filteredUsers = users.filter(
    (u) =>
      u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Messagerie">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Messagerie">
      <div className="h-[calc(100vh-200px)] flex gap-4">
        {/* Conversations List */}
        <Card className="w-80 flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Conversations</CardTitle>
              <Button size="icon" variant="ghost" onClick={() => setShowNewConversationModal(true)}>
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-2">
            <ScrollArea className="h-full">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune conversation</p>
                  <Button
                    variant="link"
                    onClick={() => setShowNewConversationModal(true)}
                    className="mt-2"
                  >
                    Démarrer une conversation
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv.id)}
                      className={cn(
                        'w-full p-3 rounded-lg text-left hover:bg-muted transition-colors',
                        selectedConversation === conv.id && 'bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {conv.type === 'group' ? (
                              <Users className="w-5 h-5" />
                            ) : (
                              getInitials(
                                conv.participants[0]?.profile.first_name || '',
                                conv.participants[0]?.profile.last_name || ''
                              )
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{getConversationTitle(conv)}</p>
                            {conv.unreadCount > 0 && (
                              <Badge variant="default" className="ml-2">
                                {conv.unreadCount}
                              </Badge>
                            )}
                          </div>
                          {conv.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {conversations.find((c) => c.id === selectedConversation)?.type === 'group' ? (
                        <Users className="w-5 h-5" />
                      ) : (
                        getInitials(
                          conversations.find((c) => c.id === selectedConversation)?.participants[0]?.profile.first_name || '',
                          conversations.find((c) => c.id === selectedConversation)?.participants[0]?.profile.last_name || ''
                        )
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {getConversationTitle(conversations.find((c) => c.id === selectedConversation)!)}
                    </p>
                    <p className="text-sm text-muted-foreground">En ligne</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isOwn = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                        >
                          <div
                            className={cn(
                              'max-w-[70%] rounded-2xl px-4 py-2',
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-md'
                                : 'bg-muted rounded-bl-md'
                            )}
                          >
                            {!isOwn && (
                              <p className="text-xs font-medium mb-1 opacity-70">
                                {msg.sender?.first_name} {msg.sender?.last_name}
                              </p>
                            )}
                            <p className="text-sm">{msg.content}</p>
                            <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : '')}>
                              <span className="text-xs opacity-60">
                                {new Date(msg.created_at).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {isOwn && (
                                msg.is_read ? (
                                  <CheckCheck className="w-3 h-3 opacity-60" />
                                ) : (
                                  <Check className="w-3 h-3 opacity-60" />
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Écrivez votre message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={sendingMessage}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage}>
                    {sendingMessage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium">Bienvenue dans la messagerie</h3>
                <p className="mt-1">Sélectionnez une conversation ou créez-en une nouvelle</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* New Conversation Modal */}
      <Dialog open={showNewConversationModal} onOpenChange={setShowNewConversationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-1">
                {filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      if (selectedUsers.includes(u.id)) {
                        setSelectedUsers(selectedUsers.filter((id) => id !== u.id));
                      } else {
                        setSelectedUsers([...selectedUsers, u.id]);
                      }
                    }}
                    className={cn(
                      'w-full p-3 rounded-lg text-left hover:bg-muted transition-colors flex items-center justify-between',
                      selectedUsers.includes(u.id) && 'bg-primary/10'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-muted text-sm">
                          {getInitials(u.first_name, u.last_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {u.first_name} {u.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {roleLabels[u.role || ''] || u.role}
                        </p>
                      </div>
                    </div>
                    {selectedUsers.includes(u.id) && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewConversationModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateConversation} disabled={selectedUsers.length === 0}>
              Créer ({selectedUsers.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MessagesPage;