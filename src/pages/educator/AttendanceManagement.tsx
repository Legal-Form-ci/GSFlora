import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
} from '@/components/ui/dialog';
import {
  Home,
  Users,
  Calendar,
  ClipboardCheck,
  QrCode,
  Scan,
  Check,
  X,
  Clock,
  AlertTriangle,
  Loader2,
  Save,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { label: 'Tableau de bord', href: '/educator', icon: <Home className="w-5 h-5" /> },
  { label: 'Présences', href: '/educator/attendance', icon: <ClipboardCheck className="w-5 h-5" /> },
  { label: 'Élèves', href: '/educator/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/educator/stats', icon: <BarChart3 className="w-5 h-5" /> },
];

interface Class {
  id: string;
  name: string;
  level: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  arrivalTime?: string;
  notes?: string;
  existingId?: string;
}

const AttendanceManagement = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, excused: 0 });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudentsAndAttendance();
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    calculateStats();
  }, [attendance]);

  const fetchClasses = async () => {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, level')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      // Fetch students
      const { data: studentClasses, error: scError } = await supabase
        .from('student_classes')
        .select('student_id, profiles!student_classes_student_id_fkey(id, first_name, last_name, email)')
        .eq('class_id', selectedClass);

      if (scError) throw scError;

      const studentsData = studentClasses
        ?.map(sc => sc.profiles)
        .filter((p): p is Student => p !== null)
        .sort((a, b) => a.last_name.localeCompare(b.last_name)) || [];

      setStudents(studentsData);

      // Fetch existing attendance
      const { data: existingAttendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('class_id', selectedClass)
        .eq('date', selectedDate);

      const attendanceMap: Record<string, AttendanceRecord> = {};
      studentsData.forEach(student => {
        const existing = existingAttendance?.find(a => a.student_id === student.id);
        attendanceMap[student.id] = {
          studentId: student.id,
          status: (existing?.status as AttendanceRecord['status']) || 'present',
          arrivalTime: existing?.arrival_time || undefined,
          notes: existing?.notes || undefined,
          existingId: existing?.id,
        };
      });

      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const records = Object.values(attendance);
    setStats({
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      excused: records.filter(r => r.status === 'excused').length,
    });
  };

  const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
        arrivalTime: status === 'late' ? new Date().toTimeString().slice(0, 5) : undefined,
      },
    }));
  };

  const handleMarkAll = (status: AttendanceRecord['status']) => {
    const newAttendance: Record<string, AttendanceRecord> = {};
    students.forEach(student => {
      newAttendance[student.id] = {
        ...attendance[student.id],
        status,
      };
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    if (!selectedClass) {
      toast.error('Veuillez sélectionner une classe');
      return;
    }

    setSaving(true);
    try {
      const records = Object.values(attendance);
      
      for (const record of records) {
        const data = {
          student_id: record.studentId,
          class_id: selectedClass,
          date: selectedDate,
          status: record.status,
          arrival_time: record.arrivalTime || null,
          notes: record.notes || null,
          recorded_by: user?.id,
        };

        if (record.existingId) {
          await supabase.from('attendance').update(data).eq('id', record.existingId);
        } else {
          await supabase.from('attendance').insert(data);
        }
      }

      toast.success('Présences enregistrées avec succès');
      fetchStudentsAndAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleQRScan = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      handleStatusChange(studentId, 'present');
      toast.success(`${student.first_name} ${student.last_name} marqué présent`);
    }
    setShowQRScanner(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-emerald-100 text-emerald-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-amber-100 text-amber-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'late': return 'Retard';
      case 'excused': return 'Excusé';
      default: return status;
    }
  };

  const selectedClassData = classes.find(c => c.id === selectedClass);

  return (
    <DashboardLayout navItems={navItems} title="Gestion des présences">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              Appel du jour
            </CardTitle>
            <CardDescription>
              Sélectionnez une classe et une date pour faire l'appel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium">Classe</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-[180px]"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowQRScanner(true)}
                className="gap-2"
              >
                <Scan className="w-4 h-4" />
                Scanner QR
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {selectedClass && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-emerald-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Présents</p>
                    <p className="text-2xl font-bold text-emerald-700">{stats.present}</p>
                  </div>
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Absents</p>
                    <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
                  </div>
                  <X className="w-8 h-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Retards</p>
                    <p className="text-2xl font-bold text-amber-700">{stats.late}</p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Excusés</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.excused}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick actions */}
        {selectedClass && students.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleMarkAll('present')}>
              <Check className="w-4 h-4 mr-2" />
              Tous présents
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleMarkAll('absent')}>
              <X className="w-4 h-4 mr-2" />
              Tous absents
            </Button>
          </div>
        )}

        {/* Attendance Table */}
        {selectedClass && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selectedClassData?.name}</CardTitle>
                <CardDescription>
                  {students.length} élèves • {new Date(selectedDate).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </div>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Enregistrer
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : students.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Élève</TableHead>
                        <TableHead className="w-48 text-center">Statut</TableHead>
                        <TableHead className="w-24">Heure</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student, index) => {
                        const record = attendance[student.id];
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium text-muted-foreground">
                              {index + 1}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {student.last_name} {student.first_name}
                                </p>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 justify-center">
                                {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                                  <Button
                                    key={status}
                                    variant={record?.status === status ? 'default' : 'outline'}
                                    size="sm"
                                    className={record?.status === status ? getStatusColor(status) : ''}
                                    onClick={() => handleStatusChange(student.id, status)}
                                  >
                                    {status === 'present' && <Check className="w-3 h-3" />}
                                    {status === 'absent' && <X className="w-3 h-3" />}
                                    {status === 'late' && <Clock className="w-3 h-3" />}
                                    {status === 'excused' && <AlertTriangle className="w-3 h-3" />}
                                  </Button>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {record?.status === 'late' && (
                                <Input
                                  type="time"
                                  value={record.arrivalTime || ''}
                                  onChange={(e) => setAttendance(prev => ({
                                    ...prev,
                                    [student.id]: { ...prev[student.id], arrivalTime: e.target.value },
                                  }))}
                                  className="w-24"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun élève inscrit dans cette classe</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* QR Scanner Modal */}
      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Scanner le QR Code de l'élève
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Scan className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Placez le QR code de la carte d'élève devant la caméra</p>
                <p className="text-sm mt-2">
                  Fonctionnalité de scan QR code en développement
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ou entrez l'ID manuellement</label>
              <div className="flex gap-2">
                <Input placeholder="ID de l'élève..." />
                <Button onClick={() => setShowQRScanner(false)}>Valider</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AttendanceManagement;
