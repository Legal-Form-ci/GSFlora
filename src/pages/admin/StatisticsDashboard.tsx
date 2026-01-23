import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Bell,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';

const navItems = [
  { label: 'Tableau de bord', href: '/admin', icon: <Home className="w-5 h-5" /> },
  { label: 'Utilisateurs', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Classes', href: '/admin/classes', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Matières', href: '/admin/subjects', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/admin/schedules', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/admin/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Annonces', href: '/admin/announcements', icon: <Bell className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

const StatisticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedClass, setSelectedClass] = useState('all');
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  
  // Stats data
  const [gradesBySubject, setGradesBySubject] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<any[]>([]);
  const [gradesEvolution, setGradesEvolution] = useState<any[]>([]);
  const [roleDistribution, setRoleDistribution] = useState<any[]>([]);
  const [performanceStats, setPerformanceStats] = useState({
    averageGrade: 0,
    attendanceRate: 0,
    passRate: 0,
    totalStudents: 0,
  });

  useEffect(() => {
    fetchData();
  }, [selectedClass, selectedPeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch classes
      const { data: classesData } = await supabase.from('classes').select('id, name').order('name');
      setClasses(classesData || []);

      // Fetch grades with subjects
      const { data: gradesData } = await supabase
        .from('grades')
        .select('score, max_score, courses(subjects(name))');

      // Process grades by subject
      const subjectGrades: Record<string, { total: number; count: number }> = {};
      gradesData?.forEach((grade: any) => {
        const subject = grade.courses?.subjects?.name || 'Autre';
        if (!subjectGrades[subject]) {
          subjectGrades[subject] = { total: 0, count: 0 };
        }
        subjectGrades[subject].total += (grade.score / grade.max_score) * 20;
        subjectGrades[subject].count++;
      });

      const processedGrades = Object.entries(subjectGrades).map(([name, data]) => ({
        name,
        moyenne: Number((data.total / data.count).toFixed(2)),
      }));
      setGradesBySubject(processedGrades);

      // Fetch attendance
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status, date');

      // Process attendance by month
      const attendanceByMonth: Record<string, { present: number; absent: number; late: number }> = {};
      attendanceData?.forEach((record: any) => {
        const month = new Date(record.date).toLocaleString('fr-FR', { month: 'short' });
        if (!attendanceByMonth[month]) {
          attendanceByMonth[month] = { present: 0, absent: 0, late: 0 };
        }
        if (record.status === 'present') attendanceByMonth[month].present++;
        else if (record.status === 'absent') attendanceByMonth[month].absent++;
        else if (record.status === 'late') attendanceByMonth[month].late++;
      });

      const processedAttendance = Object.entries(attendanceByMonth).map(([month, data]) => ({
        month,
        Présents: data.present,
        Absents: data.absent,
        Retards: data.late,
      }));
      setAttendanceStats(processedAttendance);

      // Calculate attendance rate
      const totalRecords = attendanceData?.length || 1;
      const presentCount = attendanceData?.filter((r: any) => r.status === 'present').length || 0;
      const attendanceRate = ((presentCount / totalRecords) * 100).toFixed(1);

      // Fetch role distribution
      const { data: rolesData } = await supabase.from('user_roles').select('role');
      const roleCounts: Record<string, number> = {};
      rolesData?.forEach((r: any) => {
        roleCounts[r.role] = (roleCounts[r.role] || 0) + 1;
      });

      const roleLabels: Record<string, string> = {
        super_admin: 'Super Admin',
        admin: 'Admin',
        teacher: 'Enseignants',
        student: 'Élèves',
        parent: 'Parents',
        educator: 'Éducateurs',
        censor: 'Censeurs',
        founder: 'Fondateurs',
        principal_teacher: 'Prof. Principal',
      };

      const processedRoles = Object.entries(roleCounts).map(([role, count]) => ({
        name: roleLabels[role] || role,
        value: count,
      }));
      setRoleDistribution(processedRoles);

      // Calculate performance stats
      const totalGrades = gradesData?.length || 0;
      const avgGrade = totalGrades > 0
        ? gradesData!.reduce((sum: number, g: any) => sum + (g.score / g.max_score) * 20, 0) / totalGrades
        : 0;
      const passCount = gradesData?.filter((g: any) => (g.score / g.max_score) >= 0.5).length || 0;

      const { count: studentCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      setPerformanceStats({
        averageGrade: Number(avgGrade.toFixed(2)),
        attendanceRate: Number(attendanceRate),
        passRate: totalGrades > 0 ? Number(((passCount / totalGrades) * 100).toFixed(1)) : 0,
        totalStudents: studentCount || 0,
      });

      // Simulate grades evolution data
      setGradesEvolution([
        { mois: 'Sept', moyenne: 11.2 },
        { mois: 'Oct', moyenne: 12.1 },
        { mois: 'Nov', moyenne: 11.8 },
        { mois: 'Déc', moyenne: 12.5 },
        { mois: 'Jan', moyenne: 13.2 },
      ]);

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Statistiques">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Statistiques & Analyses">
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="trimester">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Classe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Moyenne Générale</p>
                  <p className="text-3xl font-bold">{performanceStats.averageGrade}/20</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-flora-success">
                <TrendingUp className="w-4 h-4" />
                <span>+0.5 ce mois</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-flora-success/10 to-flora-success/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de Présence</p>
                  <p className="text-3xl font-bold">{performanceStats.attendanceRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-flora-success/20 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-flora-success" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-flora-success">
                <TrendingUp className="w-4 h-4" />
                <span>Excellent</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-flora-coral/10 to-flora-coral/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de Réussite</p>
                  <p className="text-3xl font-bold">{performanceStats.passRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-flora-coral/20 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-flora-coral-dark" />
                </div>
              </div>
              {performanceStats.passRate < 60 ? (
                <div className="flex items-center gap-1 mt-2 text-sm text-destructive">
                  <TrendingDown className="w-4 h-4" />
                  <span>À améliorer</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 mt-2 text-sm text-flora-success">
                  <TrendingUp className="w-4 h-4" />
                  <span>Satisfaisant</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Élèves</p>
                  <p className="text-3xl font-bold">{performanceStats.totalStudents}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-blue-600">
                <TrendingUp className="w-4 h-4" />
                <span>+15 ce mois</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="grades" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="grades">Notes</TabsTrigger>
            <TabsTrigger value="attendance">Présences</TabsTrigger>
            <TabsTrigger value="evolution">Évolution</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          </TabsList>

          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle>Moyennes par Matière</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradesBySubject} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                      <YAxis domain={[0, 20]} />
                      <Tooltip />
                      <Bar dataKey="moyenne" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Statistiques de Présence par Mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Présents" fill="#10b981" stackId="a" />
                      <Bar dataKey="Absents" fill="#ef4444" stackId="a" />
                      <Bar dataKey="Retards" fill="#f59e0b" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="evolution">
            <Card>
              <CardHeader>
                <CardTitle>Évolution de la Moyenne Générale</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={gradesEvolution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis domain={[0, 20]} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="moyenne"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary) / 0.2)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Répartition des Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {roleDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default StatisticsDashboard;