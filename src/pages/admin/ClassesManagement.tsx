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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  UserPlus,
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

interface Class {
  id: string;
  name: string;
  level: string;
  cycle: string;
  year: string;
  student_count?: number;
}

const cycles = ['Primaire', 'Collège', 'Lycée'];
const levels = {
  Primaire: ['CP', 'CE1', 'CE2', 'CM1', 'CM2'],
  Collège: ['6ème', '5ème', '4ème', '3ème'],
  Lycée: ['Seconde', 'Première', 'Terminale'],
};

const ClassesManagement = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cycleFilter, setCycleFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    cycle: 'Lycée',
    year: '2024-2025',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;

      // Get student counts
      const classesWithCounts = await Promise.all(
        (data || []).map(async (cls) => {
          const { count } = await supabase
            .from('student_classes')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);

          return { ...cls, student_count: count || 0 };
        })
      );

      setClasses(classesWithCounts);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.level || !formData.cycle) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setSaving(true);
    try {
      if (editingClass) {
        await supabase
          .from('classes')
          .update(formData)
          .eq('id', editingClass.id);
        toast.success('Classe mise à jour');
      } else {
        await supabase.from('classes').insert(formData);
        toast.success('Classe créée');
      }
      
      setShowModal(false);
      resetForm();
      fetchClasses();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) return;

    try {
      await supabase.from('classes').delete().eq('id', id);
      toast.success('Classe supprimée');
      fetchClasses();
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const openEditModal = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      level: cls.level,
      cycle: cls.cycle,
      year: cls.year,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: '', level: '', cycle: 'Lycée', year: '2024-2025' });
    setEditingClass(null);
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCycle = cycleFilter === 'all' || cls.cycle === cycleFilter;
    return matchesSearch && matchesCycle;
  });

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Gestion des classes">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Gestion des classes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={cycleFilter} onValueChange={setCycleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par cycle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les cycles</SelectItem>
                {cycles.map(cycle => (
                  <SelectItem key={cycle} value={cycle}>{cycle}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle classe
          </Button>
        </div>

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Classes ({filteredClasses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Année</TableHead>
                  <TableHead>Élèves</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell>{cls.level}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{cls.cycle}</Badge>
                    </TableCell>
                    <TableCell>{cls.year}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        {cls.student_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(cls)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(cls.id)}
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
              {editingClass ? 'Modifier la classe' : 'Nouvelle classe'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la classe *</Label>
              <Input
                placeholder="Ex: Terminale A"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Cycle *</Label>
              <Select 
                value={formData.cycle} 
                onValueChange={(v) => setFormData({ ...formData, cycle: v, level: '' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cycles.map(cycle => (
                    <SelectItem key={cycle} value={cycle}>{cycle}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Niveau *</Label>
              <Select 
                value={formData.level} 
                onValueChange={(v) => setFormData({ ...formData, level: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {levels[formData.cycle as keyof typeof levels]?.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Année scolaire *</Label>
              <Input
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingClass ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClassesManagement;
