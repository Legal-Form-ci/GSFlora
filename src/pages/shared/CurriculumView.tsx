import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, Clock, Loader2 } from 'lucide-react';

interface Props {
  navItems: { label: string; href: string; icon: React.ReactNode }[];
  title?: string;
}

const CurriculumView = ({ navItems, title = 'Suivi des Programmes' }: Props) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: classesData } = await supabase.from('classes').select('id, name').order('name');
      setClasses(classesData || []);

      let query = supabase.from('courses')
        .select('*, subjects(name), classes(name), profiles!courses_teacher_id_fkey(first_name, last_name)')
        .order('subjects(name)');

      if (selectedClass !== 'all') query = query.eq('class_id', selectedClass);

      const { data } = await query;
      setCourses(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.is_published).length;
  const publishRate = totalCourses > 0 ? (publishedCourses / totalCourses) * 100 : 0;

  // Group by subject
  const bySubject: Record<string, { total: number; published: number }> = {};
  courses.forEach(c => {
    const s = c.subjects?.name || 'Autre';
    if (!bySubject[s]) bySubject[s] = { total: 0, published: 0 };
    bySubject[s].total++;
    if (c.is_published) bySubject[s].published++;
  });

  return (
    <DashboardLayout navItems={navItems} title={title}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4 items-center">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Classe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">{totalCourses} cours total</span>
            <span className="text-flora-success">{publishedCourses} publiés</span>
            <span className="text-amber-600">{totalCourses - publishedCourses} brouillons</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Progression globale: {publishRate.toFixed(0)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={publishRate} className="h-3 mb-6" />
            
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                {Object.entries(bySubject).map(([name, data]) => {
                  const rate = (data.published / data.total) * 100;
                  return (
                    <div key={name} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="font-medium">{name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">{data.published}/{data.total}</Badge>
                          <span className="text-sm font-medium">{rate.toFixed(0)}%</span>
                        </div>
                      </div>
                      <Progress value={rate} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CurriculumView;
