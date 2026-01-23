import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  Bell,
  MessageSquare,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';

const navItems = [
  { label: 'Tableau de bord', href: '/censor', icon: <Home className="w-5 h-5" /> },
  { label: 'Classes', href: '/censor/classes', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Enseignants', href: '/censor/teachers', icon: <Users className="w-5 h-5" /> },
  { label: 'Programmes', href: '/censor/curriculum', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Emplois du temps', href: '/censor/schedules', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Rapports', href: '/censor/reports', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Annonces', href: '/censor/announcements', icon: <Bell className="w-5 h-5" /> },
];

const CensorDashboard = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalTeachers: 0,
    totalCourses: 0,
    publishedCourses: 0,
    averageGrade: 0,
    attendanceRate: 0,
  });
  const [classPerformance, setClassPerformance] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get counts
      const [classesRes, teachersRes, coursesRes, publishedRes] = await Promise.all([
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
      ]);

      // Get grades for average
      const { data: grades } = await supabase
        .from('grades')
        .select('score, max_score');

      const avgGrade = grades?.length
        ? grades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / grades.length
        : 0;

      // Get attendance rate
      const { data: attendance } = await supabase.from('attendance').select('status');
      const presentCount = attendance?.filter((a) => a.status === 'present').length || 0;
      const attendanceRate = attendance?.length ? (presentCount / attendance.length) * 100 : 0;

      // Get class performance data
      const { data: classes } = await supabase.from('classes').select('id, name');
      
      const classStats = await Promise.all(
        (classes || []).slice(0, 5).map(async (cls) => {
          const { data: classGrades } = await supabase
            .from('grades')
            .select('score, max_score, courses!inner(class_id)')
            .eq('courses.class_id', cls.id);

          const avg = classGrades?.length
            ? classGrades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / classGrades.length
            : 0;

          return {
            name: cls.name,
            average: Number(avg.toFixed(2)),
            studentCount: classGrades?.length || 0,
          };
        })
      );

      setStats({
        totalClasses: classesRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalCourses: coursesRes.count || 0,
        publishedCourses: publishedRes.count || 0,
        averageGrade: Number(avgGrade.toFixed(2)),
        attendanceRate: Number(attendanceRate.toFixed(1)),
      });

      setClassPerformance(classStats);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Tableau de bord Censeur">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const coursePublishRate = stats.totalCourses > 0
    ? ((stats.publishedCourses / stats.totalCourses) * 100).toFixed(0)
    : 0;

  return (
    <DashboardLayout navItems={navItems} title="Tableau de bord Censeur">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-xl p-6">
          <h2 className="text-2xl font-bold">
            Bonjour, {profile?.first_name} {profile?.last_name}
          </h2>
          <p className="text-muted-foreground mt-1">
            Supervision pédagogique et suivi des programmes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Classes"
            value={stats.totalClasses}
            icon={<GraduationCap className="w-5 h-5" />}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="Enseignants"
            value={stats.totalTeachers}
            icon={<Users className="w-5 h-5" />}
            iconClassName="bg-blue-500/10 text-blue-600"
          />
          <StatCard
            title="Cours publiés"
            value={`${stats.publishedCourses}/${stats.totalCourses}`}
            icon={<BookOpen className="w-5 h-5" />}
            iconClassName="bg-flora-success/10 text-flora-success"
          />
          <StatCard
            title="Moyenne générale"
            value={`${stats.averageGrade}/20`}
            icon={<BarChart3 className="w-5 h-5" />}
            iconClassName="bg-flora-coral/10 text-flora-coral-dark"
            trend={stats.averageGrade >= 10 ? { value: 2, isPositive: true } : { value: -1, isPositive: false }}
          />
        </div>

        {/* Progress Indicators */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Progression des cours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Taux de publication</span>
                  <span className="text-sm text-muted-foreground">{coursePublishRate}%</span>
                </div>
                <Progress value={Number(coursePublishRate)} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Taux de présence</span>
                  <span className="text-sm text-muted-foreground">{stats.attendanceRate}%</span>
                </div>
                <Progress value={stats.attendanceRate} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Taux de réussite</span>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Performance par classe
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classPerformance.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Aucune donnée disponible
                </p>
              ) : (
                <div className="space-y-4">
                  {classPerformance.map((cls) => (
                    <div key={cls.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{cls.name}</span>
                        <Badge variant="outline">{cls.studentCount} notes</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            cls.average >= 10 ? 'text-flora-success' : 'text-destructive'
                          }`}
                        >
                          {cls.average}/20
                        </span>
                        {cls.average >= 10 ? (
                          <TrendingUp className="w-4 h-4 text-flora-success" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                      </div>
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
            <CardTitle>Actions de supervision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Générer un rapport
              </Button>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Planifier les examens
              </Button>
              <Button variant="outline">
                <BookOpen className="w-4 h-4 mr-2" />
                Valider les programmes
              </Button>
              <Button variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Alertes pédagogiques
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CensorDashboard;