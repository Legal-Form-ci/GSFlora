import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Settings,
  BarChart3,
  Calendar,
  Bell,
  Shield,
  UserPlus,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { label: 'Tableau de bord', href: '/admin', icon: <Home className="w-5 h-5" /> },
  { label: 'Utilisateurs', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Classes', href: '/admin/classes', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Matières', href: '/admin/subjects', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Emplois du temps', href: '/admin/schedules', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Cartes élèves', href: '/admin/student-cards', icon: <Users className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/admin/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Annonces', href: '/admin/announcements', icon: <Bell className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

interface UserCount {
  role: string;
  count: number;
}

interface RecentUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalCourses: 0,
    totalSubjects: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch class count
      const { count: classCount } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true });

      // Fetch subject count
      const { count: subjectCount } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });

      // Fetch course count
      const { count: courseCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Fetch user role counts
      const { data: roleCounts } = await supabase
        .from('user_roles')
        .select('role');

      let studentCount = 0;
      let teacherCount = 0;
      let totalUsers = 0;

      if (roleCounts) {
        totalUsers = roleCounts.length;
        studentCount = roleCounts.filter(r => r.role === 'student').length;
        teacherCount = roleCounts.filter(r => r.role === 'teacher').length;
      }

      // Fetch recent users
      const { data: recentUsersData } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers,
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        totalClasses: classCount || 0,
        totalCourses: courseCount || 0,
        totalSubjects: subjectCount || 0,
      });

      if (recentUsersData) {
        setRecentUsers(recentUsersData);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <DashboardLayout 
      navItems={navItems} 
      title={role === 'super_admin' ? 'Super Administration' : 'Administration'}
    >
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">
                Bienvenue sur le panneau d'administration
              </h2>
              <p className="text-primary-foreground/80 mt-1">
                Gérez l'ensemble de la plateforme GS Flora Digital
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="Utilisateurs"
            value={stats.totalUsers}
            icon={<Users className="w-6 h-6" />}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="Élèves"
            value={stats.totalStudents}
            icon={<GraduationCap className="w-6 h-6" />}
            iconClassName="bg-flora-coral/20 text-flora-coral-dark"
          />
          <StatCard
            title="Enseignants"
            value={stats.totalTeachers}
            icon={<Users className="w-6 h-6" />}
            iconClassName="bg-flora-success/20 text-flora-success"
          />
          <StatCard
            title="Classes"
            value={stats.totalClasses}
            icon={<GraduationCap className="w-6 h-6" />}
            iconClassName="bg-flora-gold/20 text-amber-600"
          />
          <StatCard
            title="Cours"
            value={stats.totalCourses}
            icon={<BookOpen className="w-6 h-6" />}
            iconClassName="bg-blue-500/20 text-blue-600"
          />
          <StatCard
            title="Matières"
            value={stats.totalSubjects}
            icon={<BookOpen className="w-6 h-6" />}
            iconClassName="bg-purple-500/20 text-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/admin/users/new">
              <UserPlus className="w-4 h-4 mr-2" />
              Nouvel utilisateur
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/classes/new">
              <GraduationCap className="w-4 h-4 mr-2" />
              Nouvelle classe
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/announcements/new">
              <Bell className="w-4 h-4 mr-2" />
              Nouvelle annonce
            </Link>
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Utilisateurs récents</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/users">
                  Voir tout <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun utilisateur</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Aperçu de l'activité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-flora-success/10">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-flora-success" />
                    <span className="font-medium">Taux de connexion</span>
                  </div>
                  <Badge variant="secondary" className="bg-flora-success/20 text-flora-success">
                    +12%
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-flora-gold/10">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-amber-600" />
                    <span className="font-medium">Cours publiés ce mois</span>
                  </div>
                  <Badge variant="secondary" className="bg-flora-gold/20 text-amber-600">
                    {stats.totalCourses}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10">
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <span className="font-medium">Classes actives</span>
                  </div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {stats.totalClasses}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
