import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Users,
  Calendar,
  ClipboardCheck,
  Bell,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { label: 'Tableau de bord', href: '/educator', icon: <Home className="w-5 h-5" /> },
  { label: 'Élèves', href: '/educator/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Présences', href: '/educator/attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/educator/schedule', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Discipline', href: '/educator/discipline', icon: <AlertTriangle className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Annonces', href: '/educator/announcements', icon: <Bell className="w-5 h-5" /> },
];

const EducatorDashboard = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    pendingIncidents: 0,
  });
  const [recentAttendance, setRecentAttendance] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get student count
      const { count: studentCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      // Get today's attendance
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today);

      const presentCount = attendanceData?.filter((a) => a.status === 'present').length || 0;
      const absentCount = attendanceData?.filter((a) => a.status === 'absent').length || 0;
      const lateCount = attendanceData?.filter((a) => a.status === 'late').length || 0;

      // Get recent attendance with student info
      const { data: recentAtt } = await supabase
        .from('attendance')
        .select('*, classes(name)')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch student profiles for recent attendance
      const recentWithProfiles = await Promise.all(
        (recentAtt || []).map(async (att) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', att.student_id)
            .single();
          return { ...att, student: profile };
        })
      );

      // Get today's schedule
      const dayOfWeek = new Date().getDay();
      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('*, courses(title, subjects(name)), classes(name)')
        .eq('day_of_week', dayOfWeek)
        .order('start_time');

      setStats({
        totalStudents: studentCount || 0,
        presentToday: presentCount,
        absentToday: absentCount,
        lateToday: lateCount,
        pendingIncidents: 0,
      });

      setRecentAttendance(recentWithProfiles);
      setTodaySchedule(scheduleData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Tableau de bord Éducateur">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Tableau de bord Éducateur">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-xl p-6">
          <h2 className="text-2xl font-bold">
            Bonjour, {profile?.first_name} {profile?.last_name}
          </h2>
          <p className="text-muted-foreground mt-1">
            Surveillez les présences et gérez la discipline des élèves
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total élèves"
            value={stats.totalStudents}
            icon={<Users className="w-5 h-5" />}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="Présents aujourd'hui"
            value={stats.presentToday}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconClassName="bg-flora-success/10 text-flora-success"
          />
          <StatCard
            title="Absents aujourd'hui"
            value={stats.absentToday}
            icon={<XCircle className="w-5 h-5" />}
            iconClassName="bg-destructive/10 text-destructive"
          />
          <StatCard
            title="Retards aujourd'hui"
            value={stats.lateToday}
            icon={<Clock className="w-5 h-5" />}
            iconClassName="bg-amber-500/10 text-amber-600"
          />
          <StatCard
            title="Incidents en attente"
            value={stats.pendingIncidents}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconClassName="bg-flora-coral/10 text-flora-coral-dark"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5" />
                Présences récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAttendance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune donnée de présence
                </p>
              ) : (
                <div className="space-y-3">
                  {recentAttendance.slice(0, 5).map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {att.status === 'present' && (
                          <CheckCircle2 className="w-5 h-5 text-flora-success" />
                        )}
                        {att.status === 'absent' && (
                          <XCircle className="w-5 h-5 text-destructive" />
                        )}
                        {att.status === 'late' && (
                          <Clock className="w-5 h-5 text-amber-600" />
                        )}
                        <div>
                          <p className="font-medium">
                            {att.student?.first_name} {att.student?.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {att.classes?.name} • {new Date(att.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          att.status === 'present'
                            ? 'default'
                            : att.status === 'absent'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {att.status === 'present'
                          ? 'Présent'
                          : att.status === 'absent'
                          ? 'Absent'
                          : 'Retard'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Emploi du temps aujourd'hui
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todaySchedule.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucun cours prévu aujourd'hui
                </p>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {schedule.courses?.subjects?.name || schedule.courses?.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {schedule.classes?.name} • Salle {schedule.room || 'N/A'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {schedule.start_time?.slice(0, 5)} - {schedule.end_time?.slice(0, 5)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions rapides</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button>
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Prendre les présences
              </Button>
              <Button variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Signaler un incident
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contacter un parent
              </Button>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Consulter les dossiers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EducatorDashboard;