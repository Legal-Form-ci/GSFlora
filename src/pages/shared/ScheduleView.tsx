import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2 } from 'lucide-react';

const DAYS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

interface Props {
  navItems: { label: string; href: string; icon: React.ReactNode }[];
  title?: string;
}

const ScheduleView = ({ navItems, title = 'Emploi du Temps' }: Props) => {
  const [schedule, setSchedule] = useState<any[]>([]);
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

      let query = supabase
        .from('schedules')
        .select('*, courses(title, subjects(name), profiles!courses_teacher_id_fkey(first_name, last_name)), classes(name)')
        .order('day_of_week')
        .order('start_time');

      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass);
      }

      const { data } = await query;
      setSchedule(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedByDay: Record<number, any[]> = {};
  schedule.forEach(s => {
    if (!groupedByDay[s.day_of_week]) groupedByDay[s.day_of_week] = [];
    groupedByDay[s.day_of_week].push(s);
  });

  return (
    <DashboardLayout navItems={navItems} title={title}>
      <div className="space-y-6">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrer par classe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les classes</SelectItem>
            {classes.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : Object.keys(groupedByDay).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucun emploi du temps</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {Object.entries(groupedByDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, items]) => (
                <Card key={day}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{DAYS[Number(day)]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                          <div className="text-center min-w-[80px]">
                            <p className="text-sm font-bold text-primary">{item.start_time?.slice(0, 5)}</p>
                            <p className="text-xs text-muted-foreground">{item.end_time?.slice(0, 5)}</p>
                          </div>
                          <div className="flex-1 border-l-2 border-primary pl-3">
                            <p className="font-medium">{item.courses?.subjects?.name || item.courses?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.courses?.profiles?.first_name} {item.courses?.profiles?.last_name}
                              {selectedClass === 'all' && item.classes?.name && ` • ${item.classes.name}`}
                            </p>
                          </div>
                          {item.room && <Badge variant="outline">Salle {item.room}</Badge>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ScheduleView;
