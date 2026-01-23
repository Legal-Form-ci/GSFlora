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
  MessageSquare,
  Bell,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const navItems = [
  { label: 'Tableau de bord', href: '/principal-teacher', icon: <Home className="w-5 h-5" /> },
  { label: 'Ma classe', href: '/principal-teacher/class', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Mes élèves', href: '/principal-teacher/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Mes cours', href: '/teacher/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Conseils de classe', href: '/principal-teacher/councils', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Bulletins', href: '/principal-teacher/reports', icon: <FileText className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/principal-teacher/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Annonces', href: '/principal-teacher/announcements', icon: <Bell className="w-5 h-5" /> },
];

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  average: number;
  attendanceRate: number;
}

const PrincipalTeacherDashboard = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    classAverage: 0,
    attendanceRate: 0,
    passRate: 0,
    atRiskStudents: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [subjectAverages, setSubjectAverages] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // For demo purposes, we'll simulate data
      // In production, this would fetch the principal teacher's assigned class

      // Simulated student data
      const mockStudents: Student[] = [
        { id: '1', first_name: 'Kouadio', last_name: 'Jean', average: 14.5, attendanceRate: 95 },
        { id: '2', first_name: 'Koné', last_name: 'Marie', average: 16.2, attendanceRate: 98 },
        { id: '3', first_name: 'Diallo', last_name: 'Ibrahim', average: 11.8, attendanceRate: 88 },
        { id: '4', first_name: 'Touré', last_name: 'Fatou', average: 9.5, attendanceRate: 75 },
        { id: '5', first_name: 'Yao', last_name: 'Emmanuel', average: 13.2, attendanceRate: 92 },
      ];

      const mockSubjectAverages = [
        { name: 'Mathématiques', average: 12.5, trend: 'up' },
        { name: 'Français', average: 13.8, trend: 'up' },
        { name: 'Anglais', average: 11.2, trend: 'down' },
        { name: 'Histoire-Géo', average: 14.1, trend: 'up' },
        { name: 'Sciences', average: 10.8, trend: 'stable' },
      ];

      const classAvg = mockStudents.reduce((sum, s) => sum + s.average, 0) / mockStudents.length;
      const attendanceAvg = mockStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / mockStudents.length;
      const passCount = mockStudents.filter((s) => s.average >= 10).length;
      const atRisk = mockStudents.filter((s) => s.average < 10 || s.attendanceRate < 80).length;

      setStats({
        totalStudents: mockStudents.length,
        classAverage: Number(classAvg.toFixed(2)),
        attendanceRate: Number(attendanceAvg.toFixed(1)),
        passRate: Number(((passCount / mockStudents.length) * 100).toFixed(0)),
        atRiskStudents: atRisk,
      });

      setStudents(mockStudents);
      setSubjectAverages(mockSubjectAverages);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Tableau de bord Prof. Principal">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Tableau de bord Professeur Principal">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Bonjour, {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-muted-foreground mt-1">
                Suivi de votre classe - Terminale A
              </p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Terminale A
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Élèves"
            value={stats.totalStudents}
            icon={<Users className="w-5 h-5" />}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="Moyenne de classe"
            value={`${stats.classAverage}/20`}
            icon={<GraduationCap className="w-5 h-5" />}
            iconClassName="bg-flora-success/10 text-flora-success"
            trend={stats.classAverage >= 12 ? { value: 3, isPositive: true } : { value: -1, isPositive: false }}
          />
          <StatCard
            title="Taux présence"
            value={`${stats.attendanceRate}%`}
            icon={<Calendar className="w-5 h-5" />}
            iconClassName="bg-blue-500/10 text-blue-600"
          />
          <StatCard
            title="Taux réussite"
            value={`${stats.passRate}%`}
            icon={<CheckCircle2 className="w-5 h-5" />}
            iconClassName="bg-flora-coral/10 text-flora-coral-dark"
          />
          <StatCard
            title="Élèves à risque"
            value={stats.atRiskStudents}
            icon={<AlertTriangle className="w-5 h-5" />}
            iconClassName="bg-amber-500/10 text-amber-600"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Students Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Aperçu des élèves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          student.average >= 12
                            ? 'bg-flora-success'
                            : student.average >= 10
                            ? 'bg-amber-500'
                            : 'bg-destructive'
                        }`}
                      />
                      <span className="font-medium">
                        {student.last_name} {student.first_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span
                          className={`font-semibold ${
                            student.average >= 10 ? 'text-flora-success' : 'text-destructive'
                          }`}
                        >
                          {student.average}/20
                        </span>
                      </div>
                      <Badge
                        variant={student.attendanceRate >= 90 ? 'default' : 'secondary'}
                        className="w-16 justify-center"
                      >
                        {student.attendanceRate}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Subject Averages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Moyennes par matière
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectAverages.map((subject) => (
                  <div key={subject.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{subject.name}</span>
                        {subject.trend === 'up' && (
                          <TrendingUp className="w-4 h-4 text-flora-success" />
                        )}
                        {subject.trend === 'down' && (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <span
                        className={`font-semibold ${
                          subject.average >= 10 ? 'text-flora-success' : 'text-destructive'
                        }`}
                      >
                        {subject.average}/20
                      </span>
                    </div>
                    <Progress value={(subject.average / 20) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions du professeur principal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Générer les bulletins
              </Button>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Planifier conseil de classe
              </Button>
              <Button variant="outline">
                <MessageSquare className="w-4 h-4 mr-2" />
                Contacter les parents
              </Button>
              <Button variant="outline">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Suivi élèves à risque
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PrincipalTeacherDashboard;