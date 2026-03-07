import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { studentNavItems } from '@/config/roleNavItems';
import {
  BookOpen, FileText, ClipboardList, BarChart3, Calendar, ChevronRight,
  TrendingUp, Award, AlertTriangle, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const { currentSchool } = useSchool();
  const [stats, setStats] = useState({ averageGrade: 0, totalCourses: 0, pendingAssignments: 0, completedQuizzes: 0 });
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && currentSchool) fetchDashboardData();
  }, [user, currentSchool]);

  const fetchDashboardData = async () => {
    if (!currentSchool) return;
    try {
      const [coursesRes, assignmentsRes, gradesRes, quizRes] = await Promise.all([
        supabase.from('courses')
          .select('id, title, chapter, subjects(name), profiles!courses_teacher_id_fkey(first_name, last_name)')
          .eq('is_published', true).eq('school_id', currentSchool.id)
          .order('created_at', { ascending: false }).limit(5),
        supabase.from('assignments')
          .select('id, title, due_date, max_score, courses(title, subjects(name))')
          .eq('is_published', true).eq('school_id', currentSchool.id)
          .gte('due_date', new Date().toISOString())
          .order('due_date', { ascending: true }).limit(5),
        supabase.from('grades')
          .select('id, score, max_score, grade_type, graded_at, courses(title, subjects(name))')
          .eq('student_id', user?.id).eq('school_id', currentSchool.id)
          .order('graded_at', { ascending: false }).limit(5),
        supabase.from('quiz_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('student_id', user?.id).eq('school_id', currentSchool.id)
          .not('completed_at', 'is', null),
      ]);

      const cData = coursesRes.data || [];
      const aData = assignmentsRes.data || [];
      const gData = gradesRes.data || [];

      setCourses(cData);
      setAssignments(aData);
      setGrades(gData);

      const avg = gData.length > 0
        ? gData.reduce((sum: number, g: any) => sum + (g.score / g.max_score) * 20, 0) / gData.length
        : 0;

      setStats({
        averageGrade: Math.round(avg * 10) / 10,
        totalCourses: cData.length,
        pendingAssignments: aData.length,
        completedQuizzes: quizRes.count || 0,
      });

      // Today's schedule
      const today = new Date().getDay();
      const dayOfWeek = today === 0 ? 7 : today;
      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('id, day_of_week, start_time, end_time, room, courses(title, subjects(name), profiles!courses_teacher_id_fkey(first_name, last_name))')
        .eq('day_of_week', dayOfWeek).eq('school_id', currentSchool.id)
        .order('start_time', { ascending: true });
      setSchedule(scheduleData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffDays = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Demain';
    if (diffDays < 7) return `Dans ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatTime = (time: string) => time.substring(0, 5);
  const getDayName = () => ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][new Date().getDay()];
  const getGradeColor = (score: number, maxScore: number) => {
    const pct = (score / maxScore) * 100;
    if (pct >= 80) return 'text-flora-success';
    if (pct >= 50) return 'text-flora-gold';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <DashboardLayout navItems={studentNavItems} title="Tableau de bord Élève">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={studentNavItems} title="Tableau de bord Élève">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
          <h2 className="text-2xl font-bold">Bienvenue, {profile?.first_name} {profile?.last_name} 👋</h2>
          <p className="text-muted-foreground mt-1">Consultez vos cours, devoirs et notes</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Moyenne générale" value={`${stats.averageGrade}/20`} icon={<TrendingUp className="w-6 h-6" />} iconClassName="bg-flora-success/20 text-flora-success" trend={stats.averageGrade >= 10 ? { value: 5, isPositive: true } : { value: -2, isPositive: false }} />
          <StatCard title="Cours disponibles" value={stats.totalCourses} icon={<BookOpen className="w-6 h-6" />} iconClassName="bg-primary/10 text-primary" />
          <StatCard title="Devoirs à rendre" value={stats.pendingAssignments} icon={<FileText className="w-6 h-6" />} iconClassName="bg-flora-gold/20 text-amber-600" />
          <StatCard title="Quiz complétés" value={stats.completedQuizzes} icon={<Award className="w-6 h-6" />} iconClassName="bg-flora-coral/20 text-flora-coral-dark" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />{getDayName()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedule.length > 0 ? (
                <div className="space-y-3">
                  {schedule.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="text-center">
                        <p className="text-sm font-bold text-primary">{formatTime(item.start_time)}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(item.end_time)}</p>
                      </div>
                      <div className="flex-1 border-l-2 border-primary pl-3">
                        <p className="font-medium text-foreground text-sm">{item.courses?.subjects?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.courses?.profiles?.first_name} {item.courses?.profiles?.last_name}
                          {item.room && ` • ${item.room}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Pas de cours aujourd'hui</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Assignments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Devoirs à rendre</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link to="/student/assignments">Voir tout <ChevronRight className="w-4 h-4 ml-1" /></Link></Button>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.map((a: any) => {
                    const isUrgent = new Date(a.due_date).getTime() - Date.now() < 86400000 * 2;
                    return (
                      <div key={a.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUrgent ? 'bg-destructive/10' : 'bg-flora-gold/20'}`}>
                            {isUrgent ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <FileText className="w-5 h-5 text-amber-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{a.title}</p>
                            <p className="text-xs text-muted-foreground">{a.courses?.subjects?.name}</p>
                          </div>
                        </div>
                        <Badge variant={isUrgent ? 'destructive' : 'secondary'}>{formatDate(a.due_date)}</Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun devoir en attente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Grades */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Notes récentes</CardTitle>
              <Button variant="ghost" size="sm" asChild><Link to="/student/grades">Voir tout <ChevronRight className="w-4 h-4 ml-1" /></Link></Button>
            </CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <div className="space-y-3">
                  {grades.map((g: any) => (
                    <div key={g.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground text-sm">{g.courses?.subjects?.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{g.grade_type}</p>
                        </div>
                        <p className={`text-lg font-bold ${getGradeColor(g.score, g.max_score)}`}>{g.score}/{g.max_score}</p>
                      </div>
                      <Progress value={(g.score / g.max_score) * 100} className="h-1.5" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucune note pour le moment</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Cours disponibles</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/student/courses">Voir tout <ChevronRight className="w-4 h-4 ml-1" /></Link></Button>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course: any) => (
                  <div key={course.id} className="group p-4 rounded-xl border border-border hover:border-primary hover:shadow-flora transition-all">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.subjects?.name}{course.chapter && ` • ${course.chapter}`}</p>
                    <p className="text-xs text-muted-foreground mt-2">Par {course.profiles?.first_name} {course.profiles?.last_name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aucun cours disponible pour le moment</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
