import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Download, TrendingUp, TrendingDown, Loader2, Users, BookOpen, Calendar } from 'lucide-react';

interface Props {
  navItems: { label: string; href: string; icon: React.ReactNode }[];
  title?: string;
}

const ReportsView = ({ navItems, title = 'Rapports & Analyses' }: Props) => {
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('all');
  const [classes, setClasses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgGrade: 0, attendanceRate: 0, passRate: 0, totalStudents: 0,
    totalCourses: 0, publishedCourses: 0
  });

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: classesData } = await supabase.from('classes').select('id, name').order('name');
      setClasses(classesData || []);

      const { data: grades } = await supabase.from('grades').select('score, max_score');
      const { data: attendance } = await supabase.from('attendance').select('status');
      const { count: studentCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'student');
      const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
      const { count: publishedCount } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true);

      const avgGrade = grades?.length ? grades.reduce((s, g) => s + (g.score / g.max_score) * 20, 0) / grades.length : 0;
      const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
      const attendanceRate = attendance?.length ? (presentCount / attendance.length) * 100 : 0;
      const passCount = grades?.filter(g => (g.score / g.max_score) >= 0.5).length || 0;
      const passRate = grades?.length ? (passCount / grades.length) * 100 : 0;

      setStats({
        avgGrade: Number(avgGrade.toFixed(2)),
        attendanceRate: Number(attendanceRate.toFixed(1)),
        passRate: Number(passRate.toFixed(1)),
        totalStudents: studentCount || 0,
        totalCourses: courseCount || 0,
        publishedCourses: publishedCount || 0,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title={title}>
      <div className="space-y-6">
        <div className="flex flex-wrap gap-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Classe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les classes</SelectItem>
              {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" />Exporter PDF</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stats.avgGrade >= 10 ? 'bg-flora-success/20' : 'bg-destructive/20'}`}>
                      {stats.avgGrade >= 10 ? <TrendingUp className="w-6 h-6 text-flora-success" /> : <TrendingDown className="w-6 h-6 text-destructive" />}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Moyenne générale</p>
                      <p className="text-2xl font-bold">{stats.avgGrade}/20</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taux de présence</p>
                      <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-flora-gold/20 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Taux de réussite</p>
                      <p className="text-2xl font-bold">{stats.passRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Effectifs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between"><span>Total élèves</span><span className="font-bold">{stats.totalStudents}</span></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Programmes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between"><span>Cours publiés</span><span className="font-bold">{stats.publishedCourses}/{stats.totalCourses}</span></div>
                  <Progress value={stats.totalCourses > 0 ? (stats.publishedCourses / stats.totalCourses) * 100 : 0} className="h-2" />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportsView;
