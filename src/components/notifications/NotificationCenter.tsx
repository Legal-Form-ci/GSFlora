import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bell,
  GraduationCap,
  MessageSquare,
  Megaphone,
  FileText,
  ClipboardList,
  Calendar,
  Settings,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string | null;
  reference_id: string | null;
  reference_type: string | null;
  is_read: boolean;
  created_at: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  grade: <GraduationCap className="w-4 h-4" />,
  message: <MessageSquare className="w-4 h-4" />,
  announcement: <Megaphone className="w-4 h-4" />,
  assignment: <FileText className="w-4 h-4" />,
  quiz: <ClipboardList className="w-4 h-4" />,
  attendance: <Calendar className="w-4 h-4" />,
  system: <Settings className="w-4 h-4" />,
};

const typeColors: Record<string, string> = {
  grade: 'bg-flora-success/10 text-flora-success',
  message: 'bg-blue-500/10 text-blue-600',
  announcement: 'bg-flora-coral/10 text-flora-coral-dark',
  assignment: 'bg-purple-500/10 text-purple-600',
  quiz: 'bg-amber-500/10 text-amber-600',
  attendance: 'bg-cyan-500/10 text-cyan-600',
  system: 'bg-gray-500/10 text-gray-600',
};

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Subscribe to new notifications
      const channel = supabase
        .channel('notifications-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification;
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);
            
            // Show toast for new notification
            toast(newNotif.title, {
              description: newNotif.content || undefined,
              icon: typeIcons[newNotif.type],
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-1" />
              Tout lire
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-80">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => {
                    if (!notif.is_read) markAsRead(notif.id);
                  }}
                  className={cn(
                    'w-full p-4 text-left hover:bg-muted transition-colors',
                    !notif.is_read && 'bg-primary/5'
                  )}
                >
                  <div className="flex gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        typeColors[notif.type] || typeColors.system
                      )}
                    >
                      {typeIcons[notif.type] || typeIcons.system}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm font-medium', !notif.is_read && 'text-primary')}>
                          {notif.title}
                        </p>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      {notif.content && (
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.content}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notif.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;