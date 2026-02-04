import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  MessageSquare,
  BarChart3,
  Megaphone,
  Settings,
  FileText,
  ClipboardList,
  School,
  UserCheck,
  TrendingUp,
  Clock,
  CalendarDays,
} from 'lucide-react';

const navItems = [
  { label: 'Tableau de bord', href: '/director', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Générateur EDT', href: '/director/schedule-generator', icon: <CalendarDays className="w-5 h-5" /> },
  { label: 'Emplois du temps', href: '/director/schedules', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Utilisateurs', href: '/director/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Classes', href: '/director/classes', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Matières', href: '/director/subjects', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Cartes élèves', href: '/admin/student-cards', icon: <FileText className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/director/statistics', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Annonces', href: '/director/announcements', icon: <Megaphone className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/director/settings', icon: <Settings className="w-5 h-5" /> },
];

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalSubjects: number;
  attendanceRate: number;
  averageGrade: number;
}

const DirectorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalSubjects: 0,
    attendanceRate: 0,
    averageGrade: 0,
  });
  const [recentAnnouncements, setRecentAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch counts
      const [studentsRes, teachersRes, classesRes, subjectsRes, announcementsRes] = await Promise.all([
        supabase.from('user_roles').select('id', { count: 'exact' }).eq('role', 'student'),
        supabase.from('user_roles').select('id', { count: 'exact' }).eq('role', 'teacher'),
        supabase.from('classes').select('id', { count: 'exact' }),
        supabase.from('subjects').select('id', { count: 'exact' }),
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      // Calculate attendance rate
      const attendanceRes = await supabase
        .from('attendance')
        .select('status')
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      let attendanceRate = 0;
      if (attendanceRes.data && attendanceRes.data.length > 0) {
        const present = attendanceRes.data.filter(a => a.status === 'present').length;
        attendanceRate = Math.round((present / attendanceRes.data.length) * 100);
      }

      // Calculate average grade
      const gradesRes = await supabase.from('grades').select('score, max_score');
      let averageGrade = 0;
      if (gradesRes.data && gradesRes.data.length > 0) {
        const totalPercentage = gradesRes.data.reduce((sum, g) => {
          return sum + (g.score / (g.max_score || 20)) * 20;
        }, 0);
        averageGrade = Math.round((totalPercentage / gradesRes.data.length) * 10) / 10;
      }

      setStats({
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalClasses: classesRes.count || 0,
        totalSubjects: subjectsRes.count || 0,
        attendanceRate,
        averageGrade,
      });

      setRecentAnnouncements(announcementsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <DashboardLayout navItems={navItems} title="Tableau de bord - Directeur">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Élèves"
            value={stats.totalStudents}
            icon={<GraduationCap className="w-5 h-5" />}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Enseignants"
            value={stats.totalTeachers}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Classes"
            value={stats.totalClasses}
            icon={<School className="w-5 h-5" />}
          />
          <StatCard
            title="Matières"
            value={stats.totalSubjects}
            icon={<BookOpen className="w-5 h-5" />}
          />
          <StatCard
            title="Taux de présence"
            value={`${stats.attendanceRate}%`}
            icon={<UserCheck className="w-5 h-5" />}
            trend={{ value: 2, isPositive: true }}
          />
          <StatCard
            title="Moyenne générale"
            value={`${stats.averageGrade}/20`}
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Actions rapides
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/director/schedules">
                  <CalendarDays className="w-6 h-6" />
                  <span>Générer emploi du temps</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/director/users">
                  <Users className="w-6 h-6" />
                  <span>Gérer utilisateurs</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/director/statistics">
                  <BarChart3 className="w-6 h-6" />
                  <span>Voir statistiques</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
                <Link to="/director/announcements">
                  <Megaphone className="w-6 h-6" />
                  <span>Nouvelle annonce</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Annonces récentes
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/director/announcements">Voir tout</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-4">Chargement...</p>
            ) : recentAnnouncements.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucune annonce récente</p>
            ) : (
              <div className="space-y-3">
                {recentAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium">{announcement.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {announcement.content}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(announcement.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organigramme Info Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <School className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Directeur d'établissement</h3>
                <p className="text-muted-foreground">
                  Vous supervisez l'ensemble de l'établissement sous l'autorité du fondateur.
                  Vous avez accès à la gestion complète des emplois du temps, du personnel et des statistiques.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DirectorDashboard;
