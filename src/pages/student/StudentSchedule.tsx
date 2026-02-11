import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { studentNavItems } from '@/config/roleNavItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Loader2 } from 'lucide-react';

const DAYS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const StudentSchedule = () => {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSchedule();
  }, [user]);

  const fetchSchedule = async () => {
    try {
      // Get student's class
      const { data: sc } = await supabase
        .from('student_classes')
        .select('class_id')
        .eq('student_id', user?.id)
        .limit(1)
        .maybeSingle();

      if (sc?.class_id) {
        const { data } = await supabase
          .from('schedules')
          .select('*, courses(title, subjects(name), profiles!courses_teacher_id_fkey(first_name, last_name)), classes(name)')
          .eq('class_id', sc.class_id)
          .order('day_of_week')
          .order('start_time');
        setSchedule(data || []);
      }
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
    <DashboardLayout navItems={studentNavItems} title="Mon Emploi du Temps">
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : Object.keys(groupedByDay).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucun emploi du temps</h3>
              <p className="text-muted-foreground">L'emploi du temps n'a pas encore été configuré.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {Object.entries(groupedByDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, items]) => (
                <Card key={day}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      {DAYS[Number(day)] || `Jour ${day}`}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <div className="text-center min-w-[80px]">
                            <p className="text-sm font-bold text-primary">{item.start_time?.slice(0, 5)}</p>
                            <p className="text-xs text-muted-foreground">{item.end_time?.slice(0, 5)}</p>
                          </div>
                          <div className="flex-1 border-l-2 border-primary pl-3">
                            <p className="font-medium">{item.courses?.subjects?.name || item.courses?.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.courses?.profiles?.first_name} {item.courses?.profiles?.last_name}
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

export default StudentSchedule;
