import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { censorNavItems } from '@/config/roleNavItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, GraduationCap, BookOpen, Calendar, BarChart3, FileText,
  AlertTriangle, TrendingUp, TrendingDown, Loader2,
} from 'lucide-react';

const CensorDashboard = () => {
  const { profile } = useAuth();
  const { currentSchool } = useSchool();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalClasses: 0, totalTeachers: 0, totalCourses: 0, publishedCourses: 0, averageGrade: 0, attendanceRate: 0 });
  const [classPerformance, setClassPerformance] = useState<any[]>([]);

  useEffect(() => {
    if (currentSchool) fetchDashboardData();
  }, [currentSchool]);

  const fetchDashboardData = async () => {
    if (!currentSchool) return;
    try {
      const [classesRes, teachersRes, coursesRes, publishedRes] = await Promise.all([
        supabase.from('classes').select('*', { count: 'exact', head: true }).eq('school_id', currentSchool.id),
        supabase.from('school_members').select('*', { count: 'exact', head: true }).eq('school_id', currentSchool.id).eq('role', 'teacher').eq('is_active', true),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('school_id', currentSchool.id),
        supabase.from('courses').select('*', { count: 'exact', head: true }).eq('school_id', currentSchool.id).eq('is_published', true),
      ]);

      const { data: grades } = await supabase.from('grades').select('score, max_score').eq('school_id', currentSchool.id);
      const avgGrade = grades?.length ? grades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / grades.length : 0;

      const { data: attendance } = await supabase.from('attendance').select('status').eq('school_id', currentSchool.id);
      const presentCount = attendance?.filter(a => a.status === 'present').length || 0;
      const attendanceRate = attendance?.length ? (presentCount / attendance.length) * 100 : 0;

      const { data: classes } = await supabase.from('classes').select('id, name').eq('school_id', currentSchool.id);
      const classStats = await Promise.all(
        (classes || []).slice(0, 5).map(async (cls) => {
          const { data: classGrades } = await supabase
            .from('grades').select('score, max_score, courses!inner(class_id)')
            .eq('courses.class_id', cls.id).eq('school_id', currentSchool.id);
          const avg = classGrades?.length ? classGrades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / classGrades.length : 0;
          return { name: cls.name, average: Number(avg.toFixed(2)), studentCount: classGrades?.length || 0 };
        })
      );

      setStats({
        totalClasses: classesRes.count || 0, totalTeachers: teachersRes.count || 0,
        totalCourses: coursesRes.count || 0, publishedCourses: publishedRes.count || 0,
        averageGrade: Number(avgGrade.toFixed(2)), attendanceRate: Number(attendanceRate.toFixed(1)),
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
      <DashboardLayout navItems={censorNavItems} title="Tableau de bord Censeur">
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  const coursePublishRate = stats.totalCourses > 0 ? ((stats.publishedCourses / stats.totalCourses) * 100).toFixed(0) : 0;

  return (
    <DashboardLayout navItems={censorNavItems} title="Tableau de bord Censeur">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-xl p-6">
          <h2 className="text-2xl font-bold">Bonjour, {profile?.first_name} {profile?.last_name}</h2>
          <p className="text-muted-foreground mt-1">Supervision pédagogique et suivi des programmes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Classes" value={stats.totalClasses} icon={<GraduationCap className="w-5 h-5" />} iconClassName="bg-primary/10 text-primary" />
          <StatCard title="Enseignants" value={stats.totalTeachers} icon={<Users className="w-5 h-5" />} iconClassName="bg-blue-500/10 text-blue-600" />
          <StatCard title="Cours publiés" value={`${stats.publishedCourses}/${stats.totalCourses}`} icon={<BookOpen className="w-5 h-5" />} iconClassName="bg-flora-success/10 text-flora-success" />
          <StatCard title="Moyenne générale" value={`${stats.averageGrade}/20`} icon={<BarChart3 className="w-5 h-5" />} iconClassName="bg-flora-coral/10 text-flora-coral-dark" trend={stats.averageGrade >= 10 ? { value: 2, isPositive: true } : { value: -1, isPositive: false }} />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Progression des cours</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Taux de publication</span><span className="text-sm text-muted-foreground">{coursePublishRate}%</span></div>
                <Progress value={Number(coursePublishRate)} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium">Taux de présence</span><span className="text-sm text-muted-foreground">{stats.attendanceRate}%</span></div>
                <Progress value={stats.attendanceRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5" />Performance par classe</CardTitle></CardHeader>
            <CardContent>
              {classPerformance.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucune donnée disponible</p> : (
                <div className="space-y-4">
                  {classPerformance.map((cls: any) => (
                    <div key={cls.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3"><span className="font-medium">{cls.name}</span><Badge variant="outline">{cls.studentCount} notes</Badge></div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${cls.average >= 10 ? 'text-flora-success' : 'text-destructive'}`}>{cls.average}/20</span>
                        {cls.average >= 10 ? <TrendingUp className="w-4 h-4 text-flora-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Actions de supervision</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button><FileText className="w-4 h-4 mr-2" />Générer un rapport</Button>
              <Button variant="outline"><Calendar className="w-4 h-4 mr-2" />Planifier les examens</Button>
              <Button variant="outline"><BookOpen className="w-4 h-4 mr-2" />Valider les programmes</Button>
              <Button variant="outline"><AlertTriangle className="w-4 h-4 mr-2" />Alertes pédagogiques</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CensorDashboard;
