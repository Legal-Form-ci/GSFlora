import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import AttendanceChart from '@/components/dashboard/charts/AttendanceChart';
import GradesChart from '@/components/dashboard/charts/GradesChart';
import RevenueChart from '@/components/dashboard/charts/RevenueChart';
import RoleDistributionChart from '@/components/dashboard/charts/RoleDistributionChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Home, Users, GraduationCap, BookOpen, Building2, BarChart3, Settings,
  MessageSquare, TrendingUp, Award, Shield, Loader2, DollarSign,
} from 'lucide-react';

const navItems = [
  { label: 'Tableau de bord', href: '/founder', icon: <Home className="w-5 h-5" /> },
  { label: 'Vue d\'ensemble', href: '/founder/overview', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Comptabilité', href: '/accountant', icon: <DollarSign className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/founder/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Personnel', href: '/founder/staff', icon: <Users className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/founder/settings', icon: <Settings className="w-5 h-5" /> },
];

const FounderDashboard = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0, totalStudents: 0, totalTeachers: 0,
    totalClasses: 0, totalCourses: 0, averageGrade: 0, attendanceRate: 0,
    totalRevenue: 0, totalExpenses: 0,
  });

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, studentsRes, teachersRes, classesRes, coursesRes] = await Promise.all([
        supabase.from('user_roles').select('*', { count: 'exact', head: true }),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
      ]);

      const { data: grades } = await supabase.from('grades').select('score, max_score');
      const avgGrade = grades?.length
        ? grades.reduce((sum, g) => sum + (g.score / (g.max_score || 20)) * 20, 0) / grades.length : 0;

      const { data: attendance } = await supabase.from('attendance').select('status');
      const presentCount = attendance?.filter((a) => a.status === 'present').length || 0;
      const attendanceRate = attendance?.length ? (presentCount / attendance.length) * 100 : 0;

      const [paymentsRes, expensesRes] = await Promise.all([
        supabase.from('student_payments').select('amount'),
        supabase.from('school_expenses').select('amount'),
      ]);
      const totalRevenue = paymentsRes.data?.reduce((s, p) => s + Number(p.amount), 0) || 0;
      const totalExpenses = expensesRes.data?.reduce((s, e) => s + Number(e.amount), 0) || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        totalStudents: studentsRes.count || 0,
        totalTeachers: teachersRes.count || 0,
        totalClasses: classesRes.count || 0,
        totalCourses: coursesRes.count || 0,
        averageGrade: Number(avgGrade.toFixed(2)),
        attendanceRate: Number(attendanceRate.toFixed(1)),
        totalRevenue, totalExpenses,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (v: number) => new Intl.NumberFormat('fr-FR').format(v) + ' F';

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
        <div className="bg-gradient-to-r from-accent/20 to-accent/5 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/30 rounded-xl flex items-center justify-center">
              <Award className="w-7 h-7 text-accent-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">
                Bienvenue, {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-muted-foreground mt-1">
                Vue d'ensemble stratégique de votre établissement
              </p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total utilisateurs" value={stats.totalUsers}
            icon={<Users className="w-5 h-5" />} iconClassName="bg-primary/10 text-primary"
            trend={{ value: 12, isPositive: true }} />
          <StatCard title="Élèves inscrits" value={stats.totalStudents}
            icon={<GraduationCap className="w-5 h-5" />} iconClassName="bg-flora-success/10 text-flora-success"
            trend={{ value: 8, isPositive: true }} />
          <StatCard title="Moyenne générale" value={`${stats.averageGrade}/20`}
            icon={<TrendingUp className="w-5 h-5" />} iconClassName="bg-secondary/10 text-secondary"
            trend={stats.averageGrade >= 10 ? { value: 5, isPositive: true } : { value: -2, isPositive: false }} />
          <StatCard title="Taux de présence" value={`${stats.attendanceRate}%`}
            icon={<Shield className="w-5 h-5" />} iconClassName="bg-primary/10 text-primary" />
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Revenus totaux" value={formatMoney(stats.totalRevenue)}
            icon={<DollarSign className="w-5 h-5" />} iconClassName="bg-flora-success/10 text-flora-success" />
          <StatCard title="Dépenses totales" value={formatMoney(stats.totalExpenses)}
            icon={<DollarSign className="w-5 h-5" />} iconClassName="bg-destructive/10 text-destructive" />
          <StatCard title="Solde net" value={formatMoney(stats.totalRevenue - stats.totalExpenses)}
            icon={<TrendingUp className="w-5 h-5" />}
            iconClassName={stats.totalRevenue >= stats.totalExpenses ? "bg-flora-success/10 text-flora-success" : "bg-destructive/10 text-destructive"} />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <RevenueChart />
          <RoleDistributionChart />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <AttendanceChart />
          <GradesChart />
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
                <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{stats.totalTeachers}</p>
                <p className="text-sm text-muted-foreground">Enseignants</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg text-center">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-accent-foreground" />
                <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
                <p className="text-sm text-muted-foreground">Assiduité</p>
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
