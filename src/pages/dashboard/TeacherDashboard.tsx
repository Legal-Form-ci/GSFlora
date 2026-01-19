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
  Users,
  Calendar,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { label: 'Tableau de bord', href: '/teacher', icon: <Home className="w-5 h-5" /> },
  { label: 'Mes cours', href: '/teacher/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Devoirs', href: '/teacher/assignments', icon: <FileText className="w-5 h-5" /> },
  { label: 'Quiz', href: '/teacher/quizzes', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Notes', href: '/teacher/grades', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Élèves', href: '/teacher/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/teacher/schedule', icon: <Calendar className="w-5 h-5" /> },
];

interface Course {
  id: string;
  title: string;
  chapter: string | null;
  is_published: boolean;
  classes: { name: string } | null;
  subjects: { name: string } | null;
}

interface Assignment {
  id: string;
  title: string;
  due_date: string;
  courses: { title: string; classes: { name: string } | null } | null;
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    pendingSubmissions: 0,
    upcomingDeadlines: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('id, title, chapter, is_published, classes(name), subjects(name)')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (coursesData) {
        setCourses(coursesData);
        setStats(prev => ({ ...prev, totalCourses: coursesData.length }));
      }

      // Fetch upcoming assignments
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('id, title, due_date, courses(title, classes(name))')
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (assignmentsData) {
        setAssignments(assignmentsData);
        setStats(prev => ({ ...prev, upcomingDeadlines: assignmentsData.length }));
      }

      // Count pending submissions
      const { count: submissionsCount } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'submitted');

      if (submissionsCount) {
        setStats(prev => ({ ...prev, pendingSubmissions: submissionsCount }));
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
    <DashboardLayout navItems={navItems} title="Tableau de bord Enseignant">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Mes cours"
            value={stats.totalCourses}
            icon={<BookOpen className="w-6 h-6" />}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="Mes élèves"
            value={stats.totalStudents}
            icon={<Users className="w-6 h-6" />}
            iconClassName="bg-flora-coral/20 text-flora-coral-dark"
          />
          <StatCard
            title="À corriger"
            value={stats.pendingSubmissions}
            icon={<FileText className="w-6 h-6" />}
            iconClassName="bg-flora-gold/20 text-amber-600"
          />
          <StatCard
            title="Échéances proches"
            value={stats.upcomingDeadlines}
            icon={<Clock className="w-6 h-6" />}
            iconClassName="bg-flora-success/20 text-flora-success"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/teacher/courses/new">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau cours
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/teacher/assignments/new">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau devoir
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/teacher/quizzes/new">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau quiz
            </Link>
          </Button>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Courses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Mes cours récents</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/teacher/courses">
                  Voir tout <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/teacher/courses/${course.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{course.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {course.classes?.name} • {course.subjects?.name}
                          </p>
                        </div>
                      </div>
                      <Badge variant={course.is_published ? 'default' : 'secondary'}>
                        {course.is_published ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun cours créé</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/teacher/courses/new">Créer votre premier cours</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Échéances à venir</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/teacher/assignments">
                  Voir tout <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : assignments.length > 0 ? (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <Link
                      key={assignment.id}
                      to={`/teacher/assignments/${assignment.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-flora-gold/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.courses?.classes?.name} • {assignment.courses?.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {formatDate(assignment.due_date)}
                        </p>
                        <p className="text-xs text-muted-foreground">Date limite</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune échéance à venir</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
