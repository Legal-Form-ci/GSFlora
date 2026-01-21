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
  Clock,
  CheckCircle,
  AlertCircle,
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

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  max_score: number | null;
  is_published: boolean;
  created_at: string;
  courses: {
    title: string;
    classes: { name: string } | null;
    subjects: { name: string } | null;
  } | null;
  assignment_submissions: { id: string; status: string }[];
}

const AssignmentsList = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select(`
          id, title, description, due_date, max_score, is_published, created_at,
          courses!inner(title, teacher_id, classes(name), subjects(name)),
          assignment_submissions(id, status)
        `)
        .eq('courses.teacher_id', user?.id)
        .order('due_date', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!assignmentToDelete) return;

    try {
      const { error } = await supabase.from('assignments').delete().eq('id', assignmentToDelete);
      if (error) throw error;

      setAssignments(assignments.filter((a) => a.id !== assignmentToDelete));
      toast.success('Devoir supprimé avec succès');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    }
  };

  const togglePublish = async (assignmentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update({ is_published: !currentStatus })
        .eq('id', assignmentId);

      if (error) throw error;

      setAssignments(
        assignments.map((a) => (a.id === assignmentId ? { ...a, is_published: !currentStatus } : a))
      );
      toast.success(currentStatus ? 'Devoir dépublié' : 'Devoir publié');
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error('Erreur lors de la modification');
    }
  };

  const getStatus = (dueDate: string, isPublished: boolean) => {
    if (!isPublished) return { label: 'Brouillon', color: 'secondary' };
    const now = new Date();
    const due = new Date(dueDate);
    if (due < now) return { label: 'Terminé', color: 'default' };
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 2) return { label: 'Urgent', color: 'destructive' };
    return { label: 'En cours', color: 'default' };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredAssignments = assignments.filter((assignment) =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout navItems={navItems} title="Gestion des Devoirs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un devoir..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button asChild>
            <Link to="/teacher/assignments/new">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau devoir
            </Link>
          </Button>
        </div>

        {/* Assignments Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredAssignments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.map((assignment) => {
              const status = getStatus(assignment.due_date, assignment.is_published);
              const submittedCount = assignment.assignment_submissions?.filter(
                (s) => s.status === 'submitted' || s.status === 'graded'
              ).length || 0;

              return (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-flora-gold/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-amber-600" />
                        </div>
                        <Badge variant={status.color as any}>{status.label}</Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/teacher/assignments/${assignment.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              Voir les soumissions
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/teacher/assignments/${assignment.id}/edit`}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => togglePublish(assignment.id, assignment.is_published)}>
                            {assignment.is_published ? 'Dépublier' : 'Publier'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setAssignmentToDelete(assignment.id);
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
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {assignment.courses?.classes?.name} • {assignment.courses?.subjects?.name}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(assignment.due_date)}</span>
                      </div>
                      {assignment.max_score && (
                        <span>/{assignment.max_score} pts</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t">
                      <CheckCircle className="w-4 h-4 text-flora-success" />
                      <span className="text-sm">
                        {submittedCount} soumission{submittedCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-lg mb-2">Aucun devoir trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Créez votre premier devoir pour vos élèves
              </p>
              <Button asChild>
                <Link to="/teacher/assignments/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Créer un devoir
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le devoir ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le devoir et toutes les soumissions associées seront
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

export default AssignmentsList;
