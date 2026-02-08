import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import {
  Home,
  BookOpen,
  FileText,
  ClipboardList,
  BarChart3,
  Calendar,
  ChevronRight,
  TrendingUp,
  Award,
  AlertTriangle,
  Loader2,
  Bell,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const navItems = [
  { label: 'Tableau de bord', href: '/student', icon: <Home className="w-5 h-5" /> },
  { label: 'Mes cours', href: '/student/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Devoirs', href: '/student/assignments', icon: <FileText className="w-5 h-5" /> },
  { label: 'Quiz', href: '/student/quizzes', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Mes notes', href: '/student/grades', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/student/schedule', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Annonces', href: '/student/announcements', icon: <Bell className="w-5 h-5" /> },
];

interface Course {
  id: string;
  title: string;
  chapter: string | null;
  subjects: { name: string } | null;
  profiles: { first_name: string; last_name: string } | null;
}

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  max_score: number;
  courses: { title: string; subjects: { name: string } | null } | null;
}

interface Grade {
  id: string;
  score: number;
  max_score: number;
  grade_type: string;
  graded_at: string;
  courses: { title: string; subjects: { name: string } | null } | null;
}

interface ScheduleItem {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string | null;
  courses: {
    title: string;
    subjects: { name: string } | null;
    profiles: { first_name: string; last_name: string } | null;
  } | null;
}

const StudentDashboard = () => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [stats, setStats] = useState({
    averageGrade: 0,
    totalCourses: 0,
    pendingAssignments: 0,
    completedQuizzes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch available courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, chapter, subjects(name), profiles!courses_teacher_id_fkey(first_name, last_name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (coursesData) {
        setCourses(coursesData);
        setStats(prev => ({ ...prev, totalCourses: coursesData.length }));
      }

      // Fetch pending assignments
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('id, title, due_date, max_score, courses(title, subjects(name))')
        .eq('is_published', true)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (assignmentsData) {
        setAssignments(assignmentsData);
        setStats(prev => ({ ...prev, pendingAssignments: assignmentsData.length }));
      }

      // Fetch recent grades
      const { data: gradesData } = await supabase
        .from('grades')
        .select('id, score, max_score, grade_type, graded_at, courses(title, subjects(name))')
        .eq('student_id', user?.id)
        .order('graded_at', { ascending: false })
        .limit(5);

      if (gradesData) {
        setGrades(gradesData);
        
        // Calculate average
        if (gradesData.length > 0) {
          const avg = gradesData.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / gradesData.length;
          setStats(prev => ({ ...prev, averageGrade: Math.round(avg * 10) / 10 }));
        }
      }

      // Fetch today's schedule
      const today = new Date().getDay();
      const dayOfWeek = today === 0 ? 7 : today;
      
      const { data: scheduleData } = await supabase
        .from('schedules')
        .select('id, day_of_week, start_time, end_time, room, courses(title, subjects(name), profiles!courses_teacher_id_fkey(first_name, last_name))')
        .eq('day_of_week', dayOfWeek)
        .order('start_time', { ascending: true });

      if (scheduleData) {
        setSchedule(scheduleData);
      }

      // Get completed quizzes count
      const { count: quizCount } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user?.id)
        .not('completed_at', 'is', null);

      setStats(prev => ({ ...prev, completedQuizzes: quizCount || 0 }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Demain';
    if (diffDays < 7) return `Dans ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatTime = (time: string) => time.substring(0, 5);

  const getDayName = () => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date().getDay()];
  };

  const getGradeColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-flora-success';
    if (percentage >= 50) return 'text-flora-gold';
    return 'text-destructive';
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Tableau de bord Élève">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Tableau de bord Élève">
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
          <h2 className="text-2xl font-bold">
            Bienvenue, {profile?.first_name} {profile?.last_name} 👋
          </h2>
          <p className="text-muted-foreground mt-1">
            Consultez vos cours, devoirs et notes
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Moyenne générale"
            value={`${stats.averageGrade}/20`}
            icon={<TrendingUp className="w-6 h-6" />}
            iconClassName="bg-flora-success/20 text-flora-success"
            trend={stats.averageGrade >= 10 ? { value: 5, isPositive: true } : { value: -2, isPositive: false }}
          />
          <StatCard
            title="Cours disponibles"
            value={stats.totalCourses}
            icon={<BookOpen className="w-6 h-6" />}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="Devoirs à rendre"
            value={stats.pendingAssignments}
            icon={<FileText className="w-6 h-6" />}
            iconClassName="bg-flora-gold/20 text-amber-600"
          />
          <StatCard
            title="Quiz complétés"
            value={stats.completedQuizzes}
            icon={<Award className="w-6 h-6" />}
            iconClassName="bg-flora-coral/20 text-flora-coral-dark"
          />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                {getDayName()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {schedule.length > 0 ? (
                <div className="space-y-3">
                  {schedule.map((item) => (
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
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/assignments">
                  Voir tout <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const isUrgent = new Date(assignment.due_date).getTime() - Date.now() < 86400000 * 2;
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUrgent ? 'bg-destructive/10' : 'bg-flora-gold/20'}`}>
                            {isUrgent ? (
                              <AlertTriangle className="w-5 h-5 text-destructive" />
                            ) : (
                              <FileText className="w-5 h-5 text-amber-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{assignment.title}</p>
                            <p className="text-xs text-muted-foreground">{assignment.courses?.subjects?.name}</p>
                          </div>
                        </div>
                        <Badge variant={isUrgent ? 'destructive' : 'secondary'}>{formatDate(assignment.due_date)}</Badge>
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
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/grades">
                  Voir tout <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {grades.length > 0 ? (
                <div className="space-y-3">
                  {grades.map((grade) => (
                    <div key={grade.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-foreground text-sm">{grade.courses?.subjects?.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{grade.grade_type}</p>
                        </div>
                        <p className={`text-lg font-bold ${getGradeColor(grade.score, grade.max_score)}`}>
                          {grade.score}/{grade.max_score}
                        </p>
                      </div>
                      <Progress value={(grade.score / grade.max_score) * 100} className="h-1.5" />
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
            <Button variant="ghost" size="sm" asChild>
              <Link to="/student/courses">
                Voir tout <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {courses.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="group p-4 rounded-xl border border-border hover:border-primary hover:shadow-flora transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {course.subjects?.name}
                      {course.chapter && ` • ${course.chapter}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Par {course.profiles?.first_name} {course.profiles?.last_name}
                    </p>
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
