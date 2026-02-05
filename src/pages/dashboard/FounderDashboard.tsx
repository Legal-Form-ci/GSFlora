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
  GraduationCap,
  BookOpen,
  Building2,
  BarChart3,
  Settings,
  MessageSquare,
  TrendingUp,
  Award,
  Globe,
  Shield,
  Loader2,
  DollarSign,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const navItems = [
  { label: 'Tableau de bord', href: '/founder', icon: <Home className="w-5 h-5" /> },
  { label: 'Vue d\'ensemble', href: '/founder/overview', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Comptabilité', href: '/accountant', icon: <DollarSign className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/founder/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Personnel', href: '/founder/staff', icon: <Users className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/founder/settings', icon: <Settings className="w-5 h-5" /> },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const FounderDashboard = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalCourses: 0,
    averageGrade: 0,
    attendanceRate: 0,
  });
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get all counts
      const [usersRes, studentsRes, teachersRes, classesRes, coursesRes] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
      ]);

      // Get grades for average
      const { data: grades } = await supabase.from('grades').select('score, max_score');
      const avgGrade = grades?.length
        ? grades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / grades.length
        : 0;

      // Get attendance rate
      const { data: attendance } = await supabase.from('attendance').select('status');
      const presentCount = attendance?.filter((a) => a.status === 'present').length || 0;
      const attendanceRate = attendance?.length ? (presentCount / attendance.length) * 100 : 0;

      // Get role distribution
      const { data: roles } = await supabase.from('user_roles').select('role');
      const roleCounts: Record<string, number> = {};
      roles?.forEach((r) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });

      const roleLabels: Record<string, string> = {
        super_admin: 'Direction',
        admin: 'Admin',
        teacher: 'Enseignants',
        student: 'Élèves',
        parent: 'Parents',
        educator: 'Éducateurs',
        censor: 'Censeurs',
      };

      const distribution = Object.entries(roleCounts).map(([role, count]) => ({
        name: roleLabels[role] || role,
        value: count,
      }));

      setStats({
        totalUsers: usersRes.count || 0,
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalClasses: classesRes.count || 0,
        totalCourses: coursesRes.count || 0,
        averageGrade: Number(avgGrade.toFixed(2)),
        attendanceRate: Number(attendanceRate.toFixed(1)),
      });

      setRoleDistribution(distribution);

      // Simulated monthly data
      setMonthlyStats([
        { mois: 'Sept', inscrits: 150, cours: 45 },
        { mois: 'Oct', inscrits: 180, cours: 62 },
        { mois: 'Nov', inscrits: 195, cours: 78 },
        { mois: 'Déc', inscrits: 200, cours: 85 },
        { mois: 'Jan', inscrits: 210, cours: 92 },
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Tableau de bord Fondateur">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Tableau de bord Fondateur">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-flora-gold/20 to-flora-gold/5 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-flora-gold/30 rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7 text-amber-700" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                Bienvenue, {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-muted-foreground mt-1">
                Vue d'ensemble stratégique du Groupe Scolaire Flora
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total utilisateurs"
            value={stats.totalUsers}
            icon={<Users className="w-5 h-5" />}
            iconClassName="bg-primary/10 text-primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Élèves inscrits"
            value={stats.totalStudents}
            icon={<GraduationCap className="w-5 h-5" />}
            iconClassName="bg-flora-success/10 text-flora-success"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Moyenne générale"
            value={`${stats.averageGrade}/20`}
            icon={<TrendingUp className="w-5 h-5" />}
            iconClassName="bg-flora-coral/10 text-flora-coral-dark"
            trend={stats.averageGrade >= 10 ? { value: 5, isPositive: true } : { value: -2, isPositive: false }}
          />
          <StatCard
            title="Taux de présence"
            value={`${stats.attendanceRate}%`}
            icon={<Shield className="w-5 h-5" />}
            iconClassName="bg-blue-500/10 text-blue-600"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Role Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Répartition des utilisateurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {roleDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Growth Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Croissance mensuelle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="inscrits" fill="hsl(var(--primary))" name="Inscrits" />
                    <Bar dataKey="cours" fill="#10b981" name="Cours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Institution Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Aperçu de l'établissement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <GraduationCap className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats.totalClasses}</p>
                <p className="text-sm text-muted-foreground">Classes actives</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-flora-success" />
                <p className="text-2xl font-bold">{stats.totalCourses}</p>
                <p className="text-sm text-muted-foreground">Cours disponibles</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{stats.totalTeachers}</p>
                <p className="text-sm text-muted-foreground">Enseignants</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                <p className="text-2xl font-bold">95%</p>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategic Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions stratégiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button>
                <BarChart3 className="w-4 h-4 mr-2" />
                Rapport complet
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Paramètres institution
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Communication globale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FounderDashboard;