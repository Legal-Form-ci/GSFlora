import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { principalTeacherNavItems } from '@/config/roleNavItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users, GraduationCap, BookOpen, Calendar, BarChart3, MessageSquare,
  FileText, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';

const PrincipalTeacherDashboard = () => {
  const { user, profile } = useAuth();
  const { currentSchool } = useSchool();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalStudents: 0, classAverage: 0, attendanceRate: 0, passRate: 0, atRiskStudents: 0 });
  const [students, setStudents] = useState<any[]>([]);
  const [subjectAverages, setSubjectAverages] = useState<any[]>([]);
  const [assignedClassName, setAssignedClassName] = useState('');

  useEffect(() => {
    if (user && currentSchool) fetchDashboardData();
  }, [user, currentSchool]);

  const fetchDashboardData = async () => {
    if (!currentSchool || !user) return;
    try {
      // Find the class this teacher is principal of by looking at courses they teach
      const { data: teacherCourses } = await supabase
        .from('courses')
        .select('class_id, classes(id, name)')
        .eq('teacher_id', user.id)
        .eq('school_id', currentSchool.id)
        .limit(1);

      const assignedClass = teacherCourses?.[0]?.classes;
      if (!assignedClass) {
        setLoading(false);
        return;
      }
      setAssignedClassName((assignedClass as any).name);

      // Get students in class
      const { data: studentClasses } = await supabase
        .from('student_classes')
        .select('student_id, profiles(id, first_name, last_name)')
        .eq('class_id', (assignedClass as any).id)
        .eq('school_id', currentSchool.id);

      const studentList = (studentClasses || []).map((sc: any) => sc.profiles).filter(Boolean);

      // Get grades and attendance for each student
      const enrichedStudents = await Promise.all(
        studentList.map(async (s: any) => {
          const { data: grades } = await supabase.from('grades')
            .select('score, max_score')
            .eq('student_id', s.id).eq('school_id', currentSchool.id);
          const avg = grades?.length ? grades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / grades.length : 0;

          const { data: att } = await supabase.from('attendance')
            .select('status')
            .eq('student_id', s.id).eq('school_id', currentSchool.id);
          const presentCount = att?.filter(a => a.status === 'present').length || 0;
          const attRate = att?.length ? (presentCount / att.length) * 100 : 100;

          return { ...s, average: Number(avg.toFixed(2)), attendanceRate: Number(attRate.toFixed(1)) };
        })
      );

      setStudents(enrichedStudents);

      const classAvg = enrichedStudents.length > 0
        ? enrichedStudents.reduce((sum, s) => sum + s.average, 0) / enrichedStudents.length : 0;
      const attAvg = enrichedStudents.length > 0
        ? enrichedStudents.reduce((sum, s) => sum + s.attendanceRate, 0) / enrichedStudents.length : 0;
      const passCount = enrichedStudents.filter(s => s.average >= 10).length;
      const atRisk = enrichedStudents.filter(s => s.average < 10 || s.attendanceRate < 80).length;

      setStats({
        totalStudents: enrichedStudents.length,
        classAverage: Number(classAvg.toFixed(2)),
        attendanceRate: Number(attAvg.toFixed(1)),
        passRate: enrichedStudents.length > 0 ? Number(((passCount / enrichedStudents.length) * 100).toFixed(0)) : 0,
        atRiskStudents: atRisk,
      });

      // Subject averages
      const { data: subjects } = await supabase.from('subjects').select('id, name').eq('school_id', currentSchool.id);
      const subjectStats = await Promise.all(
        (subjects || []).slice(0, 6).map(async (sub) => {
          const { data: subGrades } = await supabase.from('grades')
            .select('score, max_score, courses!inner(subject_id)')
            .eq('courses.subject_id', sub.id).eq('school_id', currentSchool.id);
          const avg = subGrades?.length ? subGrades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / subGrades.length : 0;
          return { name: sub.name, average: Number(avg.toFixed(2)) };
        })
      );
      setSubjectAverages(subjectStats.filter(s => s.average > 0));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={principalTeacherNavItems} title="Tableau de bord Prof. Principal">
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={principalTeacherNavItems} title="Tableau de bord Professeur Principal">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Bonjour, {profile?.first_name} {profile?.last_name}</h2>
              <p className="text-muted-foreground mt-1">Suivi de votre classe{assignedClassName ? ` - ${assignedClassName}` : ''}</p>
            </div>
            {assignedClassName && <Badge variant="outline" className="text-lg px-4 py-2">{assignedClassName}</Badge>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Élèves" value={stats.totalStudents} icon={<Users className="w-5 h-5" />} iconClassName="bg-primary/10 text-primary" />
          <StatCard title="Moyenne de classe" value={`${stats.classAverage}/20`} icon={<GraduationCap className="w-5 h-5" />} iconClassName="bg-flora-success/10 text-flora-success" trend={stats.classAverage >= 12 ? { value: 3, isPositive: true } : { value: -1, isPositive: false }} />
          <StatCard title="Taux présence" value={`${stats.attendanceRate}%`} icon={<Calendar className="w-5 h-5" />} iconClassName="bg-blue-500/10 text-blue-600" />
          <StatCard title="Taux réussite" value={`${stats.passRate}%`} icon={<CheckCircle2 className="w-5 h-5" />} iconClassName="bg-flora-coral/10 text-flora-coral-dark" />
          <StatCard title="Élèves à risque" value={stats.atRiskStudents} icon={<AlertTriangle className="w-5 h-5" />} iconClassName="bg-amber-500/10 text-amber-600" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Aperçu des élèves</CardTitle></CardHeader>
            <CardContent>
              {students.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucun élève dans cette classe</p> : (
                <div className="space-y-4">
                  {students.map((student: any) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${student.average >= 12 ? 'bg-flora-success' : student.average >= 10 ? 'bg-amber-500' : 'bg-destructive'}`} />
                        <span className="font-medium">{student.last_name} {student.first_name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-semibold ${student.average >= 10 ? 'text-flora-success' : 'text-destructive'}`}>{student.average}/20</span>
                        <Badge variant={student.attendanceRate >= 90 ? 'default' : 'secondary'} className="w-16 justify-center">{student.attendanceRate}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" />Moyennes par matière</CardTitle></CardHeader>
            <CardContent>
              {subjectAverages.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucune donnée disponible</p> : (
                <div className="space-y-4">
                  {subjectAverages.map((subject: any) => (
                    <div key={subject.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{subject.name}</span>
                          {subject.average >= 10 ? <TrendingUp className="w-4 h-4 text-flora-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                        </div>
                        <span className={`font-semibold ${subject.average >= 10 ? 'text-flora-success' : 'text-destructive'}`}>{subject.average}/20</span>
                      </div>
                      <Progress value={(subject.average / 20) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Actions du professeur principal</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button><FileText className="w-4 h-4 mr-2" />Générer les bulletins</Button>
              <Button variant="outline"><Calendar className="w-4 h-4 mr-2" />Planifier conseil de classe</Button>
              <Button variant="outline"><MessageSquare className="w-4 h-4 mr-2" />Contacter les parents</Button>
              <Button variant="outline"><AlertTriangle className="w-4 h-4 mr-2" />Suivi élèves à risque</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PrincipalTeacherDashboard;
