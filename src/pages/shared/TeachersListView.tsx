import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Search, Loader2, BookOpen } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Props {
  navItems: { label: string; href: string; icon: React.ReactNode }[];
  title?: string;
}

const TeachersListView = ({ navItems, title = 'Liste des Enseignants' }: Props) => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*, user_roles!inner(role), teacher_subjects(subjects(name))')
        .eq('user_roles.role', 'teacher');
      setTeachers(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = teachers.filter(t =>
    `${t.first_name} ${t.last_name} ${t.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout navItems={navItems} title={title}>
      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher un enseignant..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {filtered.length} enseignant(s)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Enseignant</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Matières</TableHead>
                    <TableHead>Téléphone</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Aucun enseignant</TableCell></TableRow>
                  ) : filtered.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {t.first_name?.[0]}{t.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{t.first_name} {t.last_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{t.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {t.teacher_subjects?.map((ts: any, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              <BookOpen className="w-3 h-3 mr-1" />
                              {ts.subjects?.name}
                            </Badge>
                          ))}
                          {(!t.teacher_subjects || t.teacher_subjects.length === 0) && (
                            <span className="text-muted-foreground text-sm">Non assigné</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{t.phone || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeachersListView;
