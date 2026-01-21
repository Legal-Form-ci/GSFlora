import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  BookOpen,
  FileText,
  ClipboardList,
  BarChart3,
  Users,
  Calendar,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Sparkles,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const navItems = [
  { label: 'Tableau de bord', href: '/teacher', icon: <Home className="w-5 h-5" /> },
  { label: 'Mes cours', href: '/teacher/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Devoirs', href: '/teacher/assignments', icon: <FileText className="w-5 h-5" /> },
  { label: 'Quiz', href: '/teacher/quizzes', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Notes', href: '/teacher/grades', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Élèves', href: '/teacher/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/teacher/schedule', icon: <Calendar className="w-5 h-5" /> },
];

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  max_attempts: number | null;
  is_published: boolean;
  created_at: string;
  courses: {
    title: string;
    classes: { name: string } | null;
    subjects: { name: string } | null;
  } | null;
  quiz_questions: { id: string }[];
}

interface Course {
  id: string;
  title: string;
  classes: { name: string } | null;
  subjects: { name: string } | null;
}

const QuizManager = () => {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [selectedCourseForAI, setSelectedCourseForAI] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuizzes();
      fetchCourses();
    }
  }, [user]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id, title, description, duration_minutes, max_attempts, is_published, created_at,
          courses!inner(title, teacher_id, classes(name), subjects(name)),
          quiz_questions(id)
        `)
        .eq('courses.teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data } = await supabase
        .from('courses')
        .select('id, title, classes(name), subjects(name)')
        .eq('teacher_id', user?.id)
        .eq('is_published', true)
        .order('title');

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;

    try {
      // Delete questions first
      await supabase.from('quiz_questions').delete().eq('quiz_id', quizToDelete);
      
      const { error } = await supabase.from('quizzes').delete().eq('id', quizToDelete);
      if (error) throw error;

      setQuizzes(quizzes.filter((q) => q.id !== quizToDelete));
      toast.success('Quiz supprimé avec succès');
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    }
  };

  const togglePublish = async (quizId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('quizzes')
        .update({ is_published: !currentStatus })
        .eq('id', quizId);

      if (error) throw error;

      setQuizzes(
        quizzes.map((q) => (q.id === quizId ? { ...q, is_published: !currentStatus } : q))
      );
      toast.success(currentStatus ? 'Quiz dépublié' : 'Quiz publié');
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const handleGenerateAIQuiz = async () => {
    if (!selectedCourseForAI) {
      toast.error('Veuillez sélectionner un cours');
      return;
    }

    setGenerating(true);
    try {
      // Fetch course content
      const { data: course } = await supabase
        .from('courses')
        .select('title, content, chapter, subjects(name), classes(name)')
        .eq('id', selectedCourseForAI)
        .single();

      if (!course) throw new Error('Cours non trouvé');

      // Call AI to generate quiz
      const response = await supabase.functions.invoke('ai-course-generator', {
        body: {
          type: 'quiz',
          topic: course.title,
          description: course.content || '',
          subject: course.subjects?.name || '',
          className: course.classes?.name || '',
          country: 'Côte d\'Ivoire',
        },
      });

      if (response.error) throw response.error;

      const generatedContent = response.data?.content;
      
      // Parse and create quiz
      // For now, create a quiz with placeholder questions
      const { data: newQuiz, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          course_id: selectedCourseForAI,
          title: `Quiz - ${course.title}`,
          description: `Quiz auto-généré pour le cours: ${course.title}`,
          duration_minutes: 30,
          max_attempts: 2,
          is_published: false,
          max_score: 20,
          passing_score: 10,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      // Create sample questions (in real scenario, parse AI response)
      const sampleQuestions = [
        {
          quiz_id: newQuiz.id,
          question_text: `Question 1 sur ${course.title}`,
          question_type: 'mcq',
          options: JSON.stringify(['Option A', 'Option B', 'Option C', 'Option D']),
          correct_answer: 'Option A',
          points: 4,
          order_index: 1,
        },
        {
          quiz_id: newQuiz.id,
          question_text: `Cette affirmation est-elle vraie concernant ${course.title}?`,
          question_type: 'true_false',
          options: JSON.stringify(['Vrai', 'Faux']),
          correct_answer: 'Vrai',
          points: 4,
          order_index: 2,
        },
      ];

      await supabase.from('quiz_questions').insert(sampleQuestions);

      toast.success('Quiz généré avec succès! Modifiez les questions selon vos besoins.');
      setAIDialogOpen(false);
      fetchQuizzes();
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Erreur lors de la génération du quiz');
    } finally {
      setGenerating(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout navItems={navItems} title="Gestion des Quiz">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un quiz..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAIDialogOpen(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Générer avec IA
            </Button>
            <Button asChild>
              <Link to="/teacher/quizzes/new">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau quiz
              </Link>
            </Button>
          </div>
        </div>

        {/* Quizzes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredQuizzes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-flora-coral/20 flex items-center justify-center">
                        <ClipboardList className="w-5 h-5 text-flora-coral-dark" />
                      </div>
                      <Badge variant={quiz.is_published ? 'default' : 'secondary'}>
                        {quiz.is_published ? 'Publié' : 'Brouillon'}
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/teacher/quizzes/${quiz.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/teacher/quizzes/${quiz.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePublish(quiz.id, quiz.is_published)}>
                          {quiz.is_published ? 'Dépublier' : 'Publier'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setQuizToDelete(quiz.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
                    {quiz.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {quiz.courses?.classes?.name} • {quiz.courses?.subjects?.name}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>{quiz.quiz_questions?.length || 0} questions</span>
                    </div>
                    {quiz.duration_minutes && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{quiz.duration_minutes} min</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-lg mb-2">Aucun quiz trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre premier quiz ou générez-en un avec l'IA
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setAIDialogOpen(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer avec IA
                </Button>
                <Button asChild>
                  <Link to="/teacher/quizzes/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un quiz
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Generation Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAIDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Générer un quiz avec l'IA
            </DialogTitle>
            <DialogDescription>
              Sélectionnez un cours pour générer automatiquement un quiz basé sur son contenu.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Cours source</label>
            <select
              className="w-full mt-2 p-2 border rounded-lg"
              value={selectedCourseForAI}
              onChange={(e) => setSelectedCourseForAI(e.target.value)}
            >
              <option value="">Sélectionner un cours</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title} - {course.classes?.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAIDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleGenerateAIQuiz} disabled={generating || !selectedCourseForAI}>
              {generating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Générer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le quiz ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le quiz et toutes les tentatives associées seront
              définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default QuizManager;
