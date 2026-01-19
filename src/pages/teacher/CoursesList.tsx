import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Filter,
  ChevronRight,
  Sparkles,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
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
import AIPreparationModal from '@/components/course/AIPreparationModal';
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

interface Course {
  id: string;
  title: string;
  chapter: string | null;
  content: string | null;
  is_published: boolean;
  created_at: string;
  classes: { id: string; name: string } | null;
  subjects: { id: string; name: string } | null;
}

interface SubjectOption {
  id: string;
  name: string;
}

interface ClassOption {
  id: string;
  name: string;
  level: string;
}

const CoursesList = () => {
  const { user, profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAIModal, setShowAIModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchSubjectsAndClasses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, chapter, content, is_published, created_at, classes(id, name), subjects(id, name)')
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Erreur lors du chargement des cours');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjectsAndClasses = async () => {
    try {
      const [subjectsRes, classesRes] = await Promise.all([
        supabase.from('subjects').select('id, name').order('name'),
        supabase.from('classes').select('id, name, level').order('name'),
      ]);

      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (classesRes.data) setClasses(classesRes.data);
    } catch (error) {
      console.error('Error fetching subjects/classes:', error);
    }
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;

    try {
      const { error } = await supabase.from('courses').delete().eq('id', courseToDelete);
      if (error) throw error;

      setCourses(courses.filter((c) => c.id !== courseToDelete));
      toast.success('Cours supprimé avec succès');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const togglePublish = async (courseId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ is_published: !currentStatus, published_at: !currentStatus ? new Date().toISOString() : null })
        .eq('id', courseId);

      if (error) throw error;

      setCourses(
        courses.map((c) => (c.id === courseId ? { ...c, is_published: !currentStatus } : c))
      );
      toast.success(currentStatus ? 'Cours dépublié' : 'Cours publié');
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = filterSubject === 'all' || course.subjects?.id === filterSubject;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'published' && course.is_published) ||
      (filterStatus === 'draft' && !course.is_published);

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const teacherName = profile ? `${profile.first_name} ${profile.last_name}` : '';

  return (
    <DashboardLayout navItems={navItems} title="Mes cours">
      <div className="space-y-6">
        {/* Header actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un cours..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Matière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="published">Publiés</SelectItem>
                <SelectItem value="draft">Brouillons</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAIModal(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Préparer avec l'IA
            </Button>
            <Button asChild>
              <Link to="/teacher/courses/new">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau cours
              </Link>
            </Button>
          </div>
        </div>

        {/* Courses grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <Badge variant={course.is_published ? 'default' : 'secondary'} className="text-xs">
                          {course.is_published ? 'Publié' : 'Brouillon'}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/teacher/courses/${course.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Voir
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/teacher/courses/${course.id}/edit`}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePublish(course.id, course.is_published)}>
                          {course.is_published ? 'Dépublier' : 'Publier'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            setCourseToDelete(course.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Link to={`/teacher/courses/${course.id}`} className="block group">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {course.classes?.name} • {course.subjects?.name}
                    </p>
                    {course.chapter && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        Chapitre: {course.chapter}
                      </p>
                    )}
                  </Link>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-xs text-muted-foreground">
                      {new Date(course.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/teacher/courses/${course.id}`}>
                        Voir <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-lg mb-2">Aucun cours trouvé</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterSubject !== 'all' || filterStatus !== 'all'
                  ? 'Essayez de modifier vos filtres'
                  : 'Commencez par créer votre premier cours'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setShowAIModal(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Préparer avec l'IA
                </Button>
                <Button asChild>
                  <Link to="/teacher/courses/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un cours
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* AI Preparation Modal */}
      <AIPreparationModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onUseContent={(content, type) => {
          // Navigate to new course with AI content
          window.location.href = `/teacher/courses/new?aiContent=${encodeURIComponent(content)}`;
        }}
        subjects={subjects}
        classes={classes}
        teacherName={teacherName}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le cours ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le cours et toutes les données associées seront
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

export default CoursesList;
