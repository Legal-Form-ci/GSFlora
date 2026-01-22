import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Bell,
  Settings,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { label: 'Tableau de bord', href: '/admin', icon: <Home className="w-5 h-5" /> },
  { label: 'Utilisateurs', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Classes', href: '/admin/classes', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Matières', href: '/admin/subjects', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/admin/schedules', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Annonces', href: '/admin/announcements', icon: <Bell className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

interface Subject {
  id: string;
  name: string;
  code: string | null;
  coefficient: number;
  course_count?: number;
}

const SubjectsManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    coefficient: '1',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;

      // Get course counts
      const subjectsWithCounts = await Promise.all(
        (data || []).map(async (subject) => {
          const { count } = await supabase
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('subject_id', subject.id);

          return { ...subject, course_count: count || 0 };
        })
      );

      setSubjects(subjectsWithCounts);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      toast.error('Le nom est obligatoire');
      return;
    }

    setSaving(true);
    try {
      const subjectData = {
        name: formData.name,
        code: formData.code || null,
        coefficient: parseFloat(formData.coefficient) || 1,
      };

      if (editingSubject) {
        await supabase
          .from('subjects')
          .update(subjectData)
          .eq('id', editingSubject.id);
        toast.success('Matière mise à jour');
      } else {
        await supabase.from('subjects').insert(subjectData);
        toast.success('Matière créée');
      }
      
      setShowModal(false);
      resetForm();
      fetchSubjects();
    } catch (error) {
      console.error('Error saving subject:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) return;

    try {
      await supabase.from('subjects').delete().eq('id', id);
      toast.success('Matière supprimée');
      fetchSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code || '',
      coefficient: subject.coefficient.toString(),
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', coefficient: '1' });
    setEditingSubject(null);
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Gestion des matières">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Gestion des matières">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une matière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle matière
          </Button>
        </div>

        {/* Subjects Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Matières ({filteredSubjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Coefficient</TableHead>
                  <TableHead>Cours</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>
                      {subject.code ? (
                        <Badge variant="outline">{subject.code}</Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{subject.coefficient}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{subject.course_count} cours</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(subject)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(subject.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? 'Modifier la matière' : 'Nouvelle matière'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la matière *</Label>
              <Input
                placeholder="Ex: Mathématiques"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                placeholder="Ex: MATH"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Coefficient</Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.coefficient}
                onChange={(e) => setFormData({ ...formData, coefficient: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingSubject ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SubjectsManagement;
