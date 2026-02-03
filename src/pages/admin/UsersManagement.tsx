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
  Shield,
  Loader2,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import TeacherSubjectsSelect from '@/components/users/TeacherSubjectsSelect';

const navItems = [
  { label: 'Tableau de bord', href: '/admin', icon: <Home className="w-5 h-5" /> },
  { label: 'Utilisateurs', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Classes', href: '/admin/classes', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Matières', href: '/admin/subjects', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/admin/schedules', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Annonces', href: '/admin/announcements', icon: <Bell className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

type AppRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent' | 'founder' | 'director' | 'censor' | 'educator' | 'principal_teacher';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: AppRole | null;
  created_at: string;
}

const roleLabels: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrateur',
  founder: 'Fondateur',
  director: 'Directeur',
  censor: 'Censeur',
  educator: 'Éducateur',
  principal_teacher: 'Prof. Principal',
  teacher: 'Enseignant',
  student: 'Élève',
  parent: 'Parent',
};

const roleColors: Record<AppRole, string> = {
  super_admin: 'bg-red-100 text-red-800',
  admin: 'bg-purple-100 text-purple-800',
  founder: 'bg-amber-100 text-amber-800',
  director: 'bg-indigo-100 text-indigo-800',
  censor: 'bg-cyan-100 text-cyan-800',
  educator: 'bg-teal-100 text-teal-800',
  principal_teacher: 'bg-violet-100 text-violet-800',
  teacher: 'bg-blue-100 text-blue-800',
  student: 'bg-green-100 text-green-800',
  parent: 'bg-yellow-100 text-yellow-800',
};

const UsersManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const DEFAULT_PASSWORD = 'GSFlora';
  const [formData, setFormData] = useState({
    email: '',
    password: DEFAULT_PASSWORD,
    first_name: '',
    last_name: '',
    phone: '',
    role: 'student' as AppRole,
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [primarySubject, setPrimarySubject] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id)
            .single();

          return {
            id: profile.id,
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
            phone: profile.phone,
            role: roleData?.role as AppRole | null,
            created_at: profile.created_at,
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.email || !formData.password || !formData.first_name || !formData.last_name) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        await supabase.from('profiles').insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
        });

        // Create role
        const roleInsert = {
          user_id: authData.user.id,
          role: formData.role as any,
        };
        await supabase.from('user_roles').insert(roleInsert);

        // Create user settings with must_change_password = true
        const settingsInsert = {
          user_id: authData.user.id,
          must_change_password: true,
        };
        await supabase.from('user_settings').insert(settingsInsert);

        // If teacher, assign subjects
        if ((formData.role === 'teacher' || formData.role === 'principal_teacher') && selectedSubjects.length > 0) {
          const subjectAssignments = selectedSubjects.map(subjectId => ({
            teacher_id: authData.user!.id,
            subject_id: subjectId,
            is_primary: subjectId === primarySubject,
          }));
          await supabase.from('teacher_subjects').insert(subjectAssignments);
        }
      }

      toast.success('Utilisateur créé avec succès');
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      // Update profile
      await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone || null,
        })
        .eq('id', selectedUser.id);

      // Update role
      const roleUpsert = {
        user_id: selectedUser.id,
        role: formData.role as any,
      };
      await supabase
        .from('user_roles')
        .upsert(roleUpsert, { onConflict: 'user_id,role' });

      toast.success('Utilisateur mis à jour');
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      // Delete from profiles (will cascade to user_roles)
      await supabase.from('profiles').delete().eq('id', userId);
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      role: user.role || 'student',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: DEFAULT_PASSWORD,
      first_name: '',
      last_name: '',
      phone: '',
      role: 'student',
    });
    setSelectedSubjects([]);
    setPrimarySubject('');
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Gestion des utilisateurs">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Gestion des utilisateurs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="teacher">Enseignant</SelectItem>
                <SelectItem value="student">Élève</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Nouvel utilisateur
          </Button>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Utilisateurs ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      {user.role ? (
                        <Badge className={roleColors[user.role]}>
                          {roleLabels[user.role]}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Non défini</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)}
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

      {/* Add User Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe par défaut</Label>
              <Input
                type="text"
                value={formData.password}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ Informez l'utilisateur qu'il devra changer son mot de passe à la première connexion.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rôle *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as AppRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="director">Directeur</SelectItem>
                  <SelectItem value="censor">Censeur</SelectItem>
                  <SelectItem value="educator">Éducateur</SelectItem>
                  <SelectItem value="principal_teacher">Professeur Principal</SelectItem>
                  <SelectItem value="teacher">Enseignant</SelectItem>
                  <SelectItem value="student">Élève</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Subject assignment for teachers */}
            {(formData.role === 'teacher' || formData.role === 'principal_teacher') && (
              <TeacherSubjectsSelect
                selectedSubjects={selectedSubjects}
                onSubjectsChange={setSelectedSubjects}
                primarySubject={primarySubject}
                onPrimaryChange={setPrimarySubject}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddModal(false); resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleAddUser} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={formData.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rôle *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as AppRole })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="teacher">Enseignant</SelectItem>
                  <SelectItem value="student">Élève</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowEditModal(false); resetForm(); }}>
              Annuler
            </Button>
            <Button onClick={handleEditUser} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default UsersManagement;
