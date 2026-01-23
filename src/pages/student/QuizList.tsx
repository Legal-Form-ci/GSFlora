import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const navItems = [
  { label: 'Tableau de bord', href: '/student', icon: <Home className="w-5 h-5" /> },
  { label: 'Mes cours', href: '/student/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Quiz', href: '/student/quizzes', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Notes', href: '/student/grades', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/student/schedule', icon: <Calendar className="w-5 h-5" /> },
];

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  max_score: number;
  passing_score: number;
  max_attempts: number;
  opens_at: string | null;
  closes_at: string | null;
  course: {
    title: string;
    subjects: { name: string };
  };
  attempts: {
    id: string;
    score: number | null;
    completed_at: string | null;
  }[];
}

const QuizList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      // Get student's classes
      const { data: studentClasses } = await supabase
        .from('student_classes')
        .select('class_id')
        .eq('student_id', user?.id);

      if (!studentClasses || studentClasses.length === 0) {
        setQuizzes([]);
        setLoading(false);
        return;
      }

      const classIds = studentClasses.map(sc => sc.class_id);

      // Fetch quizzes for student's classes
      const { data: quizzesData, error } = await supabase
        .from('quizzes')
        .select(`
          id,
          title,
          description,
          duration_minutes,
          max_score,
          passing_score,
          max_attempts,
          opens_at,
          closes_at,
          courses!inner(
            title,
            class_id,
            subjects(name)
          )
        `)
        .eq('is_published', true)
        .in('courses.class_id', classIds);

      if (error) throw error;

      // Fetch attempts for each quiz
      const quizzesWithAttempts = await Promise.all(
        (quizzesData || []).map(async (quiz: any) => {
          const { data: attempts } = await supabase
            .from('quiz_attempts')
            .select('id, score, completed_at')
            .eq('quiz_id', quiz.id)
            .eq('student_id', user?.id);

          return {
            ...quiz,
            course: quiz.courses,
            attempts: attempts || [],
          };
        })
      );

      setQuizzes(quizzesWithAttempts);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuizStatus = (quiz: Quiz) => {
    const now = new Date();
    const opensAt = quiz.opens_at ? new Date(quiz.opens_at) : null;
    const closesAt = quiz.closes_at ? new Date(quiz.closes_at) : null;

    if (opensAt && now < opensAt) {
      return { status: 'upcoming', label: 'À venir', variant: 'secondary' as const };
    }
    if (closesAt && now > closesAt) {
      return { status: 'closed', label: 'Fermé', variant: 'destructive' as const };
    }

    const completedAttempts = quiz.attempts.filter(a => a.completed_at);
    if (completedAttempts.length >= quiz.max_attempts) {
      return { status: 'completed', label: 'Terminé', variant: 'default' as const };
    }

    return { status: 'available', label: 'Disponible', variant: 'outline' as const };
  };

  const getBestScore = (quiz: Quiz) => {
    const completedAttempts = quiz.attempts.filter(a => a.completed_at && a.score !== null);
    if (completedAttempts.length === 0) return null;
    return Math.max(...completedAttempts.map(a => a.score!));
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Quiz disponibles">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Quiz disponibles">
      <div className="space-y-6">
        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucun quiz disponible</h3>
              <p className="text-muted-foreground">
                Les quiz seront affichés ici lorsqu'ils seront publiés par vos enseignants.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map(quiz => {
              const status = getQuizStatus(quiz);
              const bestScore = getBestScore(quiz);
              const completedCount = quiz.attempts.filter(a => a.completed_at).length;

              return (
                <Card key={quiz.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge 
                        variant={status.variant}
                        className={status.status === 'available' ? 'bg-flora-success text-white border-flora-success' : ''}
                      >
                        {status.label}
                      </Badge>
                      {bestScore !== null && (
                        <Badge variant="outline">
                          Meilleur: {bestScore}/{quiz.max_score}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg mt-2">{quiz.title}</CardTitle>
                    <CardDescription>
                      {quiz.course?.subjects?.name} - {quiz.course?.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {quiz.description || 'Pas de description'}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{quiz.duration_minutes} minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
                        <span>Score de réussite: {quiz.passing_score}/{quiz.max_score}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 text-muted-foreground" />
                        <span>Tentatives: {completedCount}/{quiz.max_attempts}</span>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Button
                        className="w-full"
                        disabled={status.status !== 'available'}
                        onClick={() => navigate(`/student/quiz/${quiz.id}`)}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {status.status === 'completed' ? 'Voir les résultats' : 'Commencer'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QuizList;
