import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { educatorNavItems } from '@/config/roleNavItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users, Calendar, ClipboardCheck, AlertTriangle, MessageSquare,
  Clock, CheckCircle2, XCircle, Eye, Loader2,
} from 'lucide-react';

const EducatorDashboard = () => {
  const { profile } = useAuth();
  const { currentSchool } = useSchool();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, presentToday: 0, absentToday: 0, lateToday: 0, pendingIncidents: 0 });
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  useEffect(() => {
    if (currentSchool) fetchDashboardData();
  }, [currentSchool]);

  const fetchDashboardData = async () => {
    if (!currentSchool) return;
    try {
      const today = new Date().toISOString().split('T')[0];

      const [studentRes, attendanceRes, recentAttRes, scheduleRes] = await Promise.all([
        supabase.from('school_members').select('*', { count: 'exact', head: true }).eq('school_id', currentSchool.id).eq('role', 'student').eq('is_active', true),
        supabase.from('attendance').select('*').eq('date', today).eq('school_id', currentSchool.id),
        supabase.from('attendance').select('*, classes(name)').eq('school_id', currentSchool.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('schedules').select('*, courses(title, subjects(name)), classes(name)').eq('day_of_week', new Date().getDay()).eq('school_id', currentSchool.id).order('start_time'),
      ]);

      const attData = attendanceRes.data || [];
      setStats({
        totalStudents: studentRes.count || 0,
        presentToday: attData.filter(a => a.status === 'present').length,
        absentToday: attData.filter(a => a.status === 'absent').length,
        lateToday: attData.filter(a => a.status === 'late').length,
        pendingIncidents: 0,
      });

      // Enrich recent attendance with student profiles
      const recentWithProfiles = await Promise.all(
        (recentAttRes.data || []).map(async (att) => {
          const { data: p } = await supabase.from('profiles').select('first_name, last_name').eq('id', att.student_id).single();
          return { ...att, student: p };
        })
      );
      setRecentAttendance(recentWithProfiles);
      setTodaySchedule(scheduleRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={educatorNavItems} title="Tableau de bord Éducateur">
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={educatorNavItems} title="Tableau de bord Éducateur">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-xl p-6">
          <h2 className="text-2xl font-bold">Bonjour, {profile?.first_name} {profile?.last_name}</h2>
          <p className="text-muted-foreground mt-1">Surveillez les présences et gérez la discipline des élèves</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total élèves" value={stats.totalStudents} icon={<Users className="w-5 h-5" />} iconClassName="bg-primary/10 text-primary" />
          <StatCard title="Présents aujourd'hui" value={stats.presentToday} icon={<CheckCircle2 className="w-5 h-5" />} iconClassName="bg-flora-success/10 text-flora-success" />
          <StatCard title="Absents aujourd'hui" value={stats.absentToday} icon={<XCircle className="w-5 h-5" />} iconClassName="bg-destructive/10 text-destructive" />
          <StatCard title="Retards aujourd'hui" value={stats.lateToday} icon={<Clock className="w-5 h-5" />} iconClassName="bg-amber-500/10 text-amber-600" />
          <StatCard title="Incidents en attente" value={stats.pendingIncidents} icon={<AlertTriangle className="w-5 h-5" />} iconClassName="bg-flora-coral/10 text-flora-coral-dark" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck className="w-5 h-5" />Présences récentes</CardTitle></CardHeader>
            <CardContent>
              {recentAttendance.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucune donnée de présence</p> : (
                <div className="space-y-3">
                  {recentAttendance.slice(0, 5).map((att: any) => (
                    <div key={att.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {att.status === 'present' && <CheckCircle2 className="w-5 h-5 text-flora-success" />}
                        {att.status === 'absent' && <XCircle className="w-5 h-5 text-destructive" />}
                        {att.status === 'late' && <Clock className="w-5 h-5 text-amber-600" />}
                        <div><p className="font-medium">{att.student?.first_name} {att.student?.last_name}</p><p className="text-sm text-muted-foreground">{att.classes?.name} • {new Date(att.date).toLocaleDateString('fr-FR')}</p></div>
                      </div>
                      <Badge variant={att.status === 'present' ? 'default' : att.status === 'absent' ? 'destructive' : 'secondary'}>
                        {att.status === 'present' ? 'Présent' : att.status === 'absent' ? 'Absent' : 'Retard'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Emploi du temps aujourd'hui</CardTitle></CardHeader>
            <CardContent>
              {todaySchedule.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucun cours prévu aujourd'hui</p> : (
                <div className="space-y-3">
                  {todaySchedule.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div><p className="font-medium">{s.courses?.subjects?.name || s.courses?.title}</p><p className="text-sm text-muted-foreground">{s.classes?.name} • Salle {s.room || 'N/A'}</p></div>
                      <Badge variant="outline">{s.start_time?.slice(0, 5)} - {s.end_time?.slice(0, 5)}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Actions rapides</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button asChild><a href="/educator/attendance"><ClipboardCheck className="w-4 h-4 mr-2" />Prendre les présences</a></Button>
              <Button variant="outline"><AlertTriangle className="w-4 h-4 mr-2" />Signaler un incident</Button>
              <Button variant="outline"><MessageSquare className="w-4 h-4 mr-2" />Contacter un parent</Button>
              <Button variant="outline"><Eye className="w-4 h-4 mr-2" />Consulter les dossiers</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EducatorDashboard;
