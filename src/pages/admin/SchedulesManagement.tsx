import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSchool } from '@/contexts/SchoolContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home, Users, GraduationCap, BookOpen, Calendar, Bell, Settings,
  Plus, MoreHorizontal, Edit, Trash2, Loader2, Clock,
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

const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

interface Schedule {
  id: string; day_of_week: number; start_time: string; end_time: string; room: string | null;
  class_id: string; course_id: string; class_name?: string; course_title?: string; subject_name?: string;
}
interface ClassOption { id: string; name: string; }
interface CourseOption { id: string; title: string; subject_name: string; }

const SchedulesManagement = () => {
  const { currentSchool } = useSchool();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({ class_id: '', course_id: '', day_of_week: '1', start_time: '08:00', end_time: '09:00', room: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (currentSchool) fetchData(); }, [currentSchool]);
  useEffect(() => { if (formData.class_id) fetchCourses(formData.class_id); }, [formData.class_id]);

  const fetchData = async () => {
    if (!currentSchool) return;
    try {
      const [schedulesRes, classesRes] = await Promise.all([
        supabase.from('schedules').select('*, classes(name), courses(title, subjects(name))').eq('school_id', currentSchool.id).order('day_of_week').order('start_time'),
        supabase.from('classes').select('id, name').eq('school_id', currentSchool.id).order('name'),
      ]);
      if (schedulesRes.data) {
        setSchedules(schedulesRes.data.map((s: any) => ({ ...s, class_name: s.classes?.name, course_title: s.courses?.title, subject_name: s.courses?.subjects?.name })));
      }
      if (classesRes.data) setClasses(classesRes.data);
    } catch (error) { toast.error('Erreur lors du chargement'); } finally { setLoading(false); }
  };

  const fetchCourses = async (classId: string) => {
    const { data } = await supabase.from('courses').select('id, title, subjects(name)').eq('class_id', classId);
    if (data) setCourses(data.map((c: any) => ({ id: c.id, title: c.title, subject_name: c.subjects?.name || 'N/A' })));
  };

  const handleSave = async () => {
    if (!formData.class_id || !formData.course_id) { toast.error('Veuillez remplir tous les champs obligatoires'); return; }
    if (!currentSchool) return;
    setSaving(true);
    try {
      const scheduleData = {
        class_id: formData.class_id, course_id: formData.course_id, day_of_week: parseInt(formData.day_of_week),
        start_time: formData.start_time, end_time: formData.end_time, room: formData.room || null, school_id: currentSchool.id,
      };
      if (editingSchedule) {
        await supabase.from('schedules').update(scheduleData).eq('id', editingSchedule.id);
        toast.success('Horaire mis à jour');
      } else {
        await supabase.from('schedules').insert(scheduleData);
        toast.success('Horaire créé');
      }
      setShowModal(false); resetForm(); fetchData();
    } catch (error) { toast.error('Erreur lors de l\'enregistrement'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet horaire ?')) return;
    await supabase.from('schedules').delete().eq('id', id);
    toast.success('Horaire supprimé'); fetchData();
  };

  const openEditModal = async (schedule: Schedule) => {
    setEditingSchedule(schedule);
    await fetchCourses(schedule.class_id);
    setFormData({ class_id: schedule.class_id, course_id: schedule.course_id, day_of_week: schedule.day_of_week.toString(), start_time: schedule.start_time, end_time: schedule.end_time, room: schedule.room || '' });
    setShowModal(true);
  };

  const resetForm = () => { setFormData({ class_id: '', course_id: '', day_of_week: '1', start_time: '08:00', end_time: '09:00', room: '' }); setEditingSchedule(null); setCourses([]); };

  const filteredSchedules = schedules.filter(s => {
    const matchesClass = selectedClass === 'all' || s.class_id === selectedClass;
    const matchesDay = selectedDay === 'all' || s.day_of_week.toString() === selectedDay;
    return matchesClass && matchesDay;
  });

  if (loading) return <DashboardLayout navItems={navItems} title="Emploi du temps"><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems} title="Emploi du temps">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="flex flex-1 gap-4">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par classe" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Toutes les classes</SelectItem>{classes.map(cls => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={selectedDay} onValueChange={setSelectedDay}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filtrer par jour" /></SelectTrigger>
              <SelectContent><SelectItem value="all">Tous les jours</SelectItem>{[1,2,3,4,5,6].map(d => <SelectItem key={d} value={d.toString()}>{dayNames[d]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }}><Plus className="w-4 h-4 mr-2" /> Nouvel horaire</Button>
        </div>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" /> Emploi du temps ({filteredSchedules.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Jour</TableHead><TableHead>Horaire</TableHead><TableHead>Classe</TableHead><TableHead>Cours</TableHead><TableHead>Salle</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filteredSchedules.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell><Badge variant="outline">{dayNames[s.day_of_week]}</Badge></TableCell>
                    <TableCell><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" />{s.start_time} - {s.end_time}</div></TableCell>
                    <TableCell>{s.class_name}</TableCell>
                    <TableCell><p className="font-medium">{s.course_title}</p><p className="text-sm text-muted-foreground">{s.subject_name}</p></TableCell>
                    <TableCell>{s.room || '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(s)}><Edit className="w-4 h-4 mr-2" /> Modifier</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(s.id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" /> Supprimer</DropdownMenuItem>
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

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingSchedule ? 'Modifier l\'horaire' : 'Nouvel horaire'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Classe *</Label>
              <Select value={formData.class_id} onValueChange={(v) => setFormData({ ...formData, class_id: v, course_id: '' })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger>
                <SelectContent>{classes.map(cls => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Cours *</Label>
              <Select value={formData.course_id} onValueChange={(v) => setFormData({ ...formData, course_id: v })} disabled={!formData.class_id}>
                <SelectTrigger><SelectValue placeholder="Sélectionner un cours" /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title} ({c.subject_name})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Jour *</Label>
              <Select value={formData.day_of_week} onValueChange={(v) => setFormData({ ...formData, day_of_week: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{[1,2,3,4,5,6].map(d => <SelectItem key={d} value={d.toString()}>{dayNames[d]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Heure début *</Label><Input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} /></div>
              <div className="space-y-2"><Label>Heure fin *</Label><Input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Salle</Label><Input placeholder="Ex: Salle 101" value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{editingSchedule ? 'Enregistrer' : 'Créer'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SchedulesManagement;
