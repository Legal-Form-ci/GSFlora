import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { studentNavItems } from '@/config/roleNavItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Download, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StudentCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) fetchCourses();
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data } = await supabase
        .from('courses')
        .select('*, subjects(name), classes(name), profiles!courses_teacher_id_fkey(first_name, last_name)')
        .eq('is_published', true)
        .order('updated_at', { ascending: false });
      setCourses(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.subjects?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout navItems={studentNavItems} title="Mes Cours">
      <div className="space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucun cours disponible</h3>
              <p className="text-muted-foreground">Les cours publiés apparaîtront ici.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((course) => (
              <Card key={course.id} className="hover:shadow-flora transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary">{course.subjects?.name}</Badge>
                  </div>
                  <CardTitle className="text-base mt-3">{course.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>{course.classes?.name} {course.chapter && `• ${course.chapter}`}</p>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{course.profiles?.first_name} {course.profiles?.last_name}</span>
                    </div>
                    {course.duration_minutes && (
                      <p>{course.duration_minutes} min</p>
                    )}
                  </div>
                  {course.content && (
                    <Button variant="outline" size="sm" className="w-full mt-4">
                      <Download className="w-4 h-4 mr-2" />
                      Consulter le cours
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentCourses;
