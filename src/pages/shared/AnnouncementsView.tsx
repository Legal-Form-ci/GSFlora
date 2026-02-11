import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Loader2, AlertTriangle } from 'lucide-react';

interface Props {
  navItems: { label: string; href: string; icon: React.ReactNode }[];
  title?: string;
}

const AnnouncementsView = ({ navItems, title = 'Annonces' }: Props) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await supabase
        .from('announcements')
        .select('*, profiles!announcements_author_id_fkey(first_name, last_name)')
        .order('created_at', { ascending: false });
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title={title}>
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucune annonce</h3>
            </CardContent>
          </Card>
        ) : (
          announcements.map(a => (
            <Card key={a.id} className={a.is_urgent ? 'border-destructive/50' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {a.is_urgent && <AlertTriangle className="w-5 h-5 text-destructive" />}
                    {a.title}
                  </CardTitle>
                  <div className="flex gap-2">
                    {a.is_urgent && <Badge variant="destructive">Urgent</Badge>}
                    <Badge variant="outline">{a.target_type === 'all' ? 'Tous' : a.target_type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{a.content}</p>
                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <span>Par {a.profiles?.first_name} {a.profiles?.last_name}</span>
                  <span>{new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnnouncementsView;
