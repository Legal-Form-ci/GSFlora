import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Home,
  Calendar,
  Users,
  GraduationCap,
  BookOpen,
  Clock,
  Building2,
  Loader2,
  Wand2,
  Share2,
  FileDown,
  Edit,
  Info,
  CheckCircle,
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const navItems = [
  { label: 'Tableau de bord', href: '/director', icon: <Home className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/director/schedule-generator', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Utilisateurs', href: '/director/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Classes', href: '/director/classes', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Matières', href: '/director/subjects', icon: <BookOpen className="w-5 h-5" /> },
];

interface ClassCount {
  level: string;
  count: number;
}

interface TeacherCount {
  subject_name: string;
  count: number;
}

interface ScheduleConfig {
  school_year: string;
  start_time_weekdays: string;
  end_time_weekdays: string;
  start_time_wednesday: string;
  end_time_wednesday: string;
  course_duration_minutes: number;
  break_duration_minutes: number;
  lunch_start: string;
  lunch_end: string;
  total_rooms: number;
}

const ScheduleGenerator = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Stats from database
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [classesByLevel, setClassesByLevel] = useState<ClassCount[]>([]);
  const [teachersBySubject, setTeachersBySubject] = useState<TeacherCount[]>([]);
  
  // Config form
  const [config, setConfig] = useState<ScheduleConfig>({
    school_year: '2025-2026',
    start_time_weekdays: '07:00',
    end_time_weekdays: '18:00',
    start_time_wednesday: '07:00',
    end_time_wednesday: '12:00',
    course_duration_minutes: 55,
    break_duration_minutes: 10,
    lunch_start: '12:00',
    lunch_end: '14:00',
    total_rooms: 20,
  });
  
  // Generated schedule
  const [generatedSchedule, setGeneratedSchedule] = useState<any>(null);
  const [scheduleStatus, setScheduleStatus] = useState<'none' | 'draft' | 'published'>('none');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsRes, classesRes, teachersRes, teacherSubjectsRes] = await Promise.all([
        supabase.from('subjects').select('id, name'),
        supabase.from('classes').select('id, name, level'),
        supabase.from('user_roles').select('user_id').eq('role', 'teacher'),
        supabase.from('teacher_subjects').select('teacher_id, subject_id, subjects(name)'),
      ]);

      // Set totals
      setTotalSubjects(subjectsRes.data?.length || 0);
      setTotalClasses(classesRes.data?.length || 0);
      setTotalTeachers(teachersRes.data?.length || 0);

      // Group classes by level
      if (classesRes.data) {
        const levelCounts = classesRes.data.reduce((acc: Record<string, number>, cls) => {
          acc[cls.level] = (acc[cls.level] || 0) + 1;
          return acc;
        }, {});
        
        setClassesByLevel(
          Object.entries(levelCounts).map(([level, count]) => ({ level, count: count as number }))
        );
      }

      // Group teachers by subject
      if (teacherSubjectsRes.data) {
        const subjectCounts = teacherSubjectsRes.data.reduce((acc: Record<string, number>, ts: any) => {
          const name = ts.subjects?.name || 'Non assigné';
          acc[name] = (acc[name] || 0) + 1;
          return acc;
        }, {});
        
        setTeachersBySubject(
          Object.entries(subjectCounts).map(([subject_name, count]) => ({ subject_name, count: count as number }))
        );
      }

      // Check for existing generated schedule
      const { data: existingSchedule } = await supabase
        .from('generated_schedules')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSchedule) {
        setGeneratedSchedule(existingSchedule.schedule_data);
        setScheduleStatus(existingSchedule.status as 'draft' | 'published');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (totalClasses === 0 || totalTeachers === 0 || totalSubjects === 0) {
      toast.error('Veuillez d\'abord créer des classes, matières et enseignants');
      return;
    }

    setGenerating(true);
    setProgress(0);

    try {
      // Simulate generation progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      // Save config
      const { data: configData, error: configError } = await supabase
        .from('schedule_generation_config')
        .insert({
          ...config,
          generated_by: user?.id,
          generated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (configError) throw configError;

      // Generate schedule (simplified algorithm)
      const schedule = await generateScheduleAlgorithm();
      
      // Save generated schedule
      const { error: scheduleError } = await supabase
        .from('generated_schedules')
        .insert({
          config_id: configData.id,
          school_year: config.school_year,
          schedule_data: schedule,
          status: 'draft',
        });

      if (scheduleError) throw scheduleError;

      clearInterval(progressInterval);
      setProgress(100);
      setGeneratedSchedule(schedule);
      setScheduleStatus('draft');
      
      toast.success('Emploi du temps généré avec succès !');
    } catch (error: any) {
      console.error('Error generating schedule:', error);
      toast.error(error.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  const generateScheduleAlgorithm = async () => {
    // Fetch all needed data
    const [classesRes, subjectsRes, teacherSubjectsRes] = await Promise.all([
      supabase.from('classes').select('*'),
      supabase.from('subjects').select('*'),
      supabase.from('teacher_subjects').select('*, subjects(*)'),
    ]);

    const classes = classesRes.data || [];
    const subjects = subjectsRes.data || [];
    const teacherSubjects = teacherSubjectsRes.data || [];

    // Time slots
    const days = [1, 2, 3, 4, 5]; // Monday to Friday
    const startHour = parseInt(config.start_time_weekdays.split(':')[0]);
    const endHour = parseInt(config.end_time_weekdays.split(':')[0]);
    const lunchStart = parseInt(config.lunch_start.split(':')[0]);
    const lunchEnd = parseInt(config.lunch_end.split(':')[0]);

    const schedule: any[] = [];
    let roomIndex = 0;

    // Generate for each class
    for (const cls of classes) {
      for (const day of days) {
        const dayEndHour = day === 3 ? 12 : endHour; // Wednesday ends at 12
        let currentHour = startHour;
        
        for (const subject of subjects) {
          if (currentHour >= dayEndHour) break;
          
          // Skip lunch
          if (currentHour >= lunchStart && currentHour < lunchEnd) {
            currentHour = lunchEnd;
          }
          
          if (currentHour >= dayEndHour) break;

          // Find teacher for this subject
          const ts = teacherSubjects.find((t: any) => t.subject_id === subject.id);
          
          schedule.push({
            class_id: cls.id,
            class_name: cls.name,
            subject_id: subject.id,
            subject_name: subject.name,
            teacher_id: ts?.teacher_id,
            day_of_week: day,
            start_time: `${currentHour.toString().padStart(2, '0')}:00`,
            end_time: `${(currentHour + 1).toString().padStart(2, '0')}:00`,
            room: `Salle ${(roomIndex % config.total_rooms) + 1}`,
          });

          currentHour++;
          roomIndex++;
        }
      }
    }

    return schedule;
  };

  const handlePublish = async () => {
    if (!generatedSchedule) return;

    try {
      // Insert into schedules table
      for (const item of generatedSchedule) {
        if (item.teacher_id) {
          // First get or create course
          const { data: courseData } = await supabase
            .from('courses')
            .select('id')
            .eq('class_id', item.class_id)
            .eq('subject_id', item.subject_id)
            .limit(1)
            .maybeSingle();

          if (courseData) {
            await supabase.from('schedules').insert({
              class_id: item.class_id,
              course_id: courseData.id,
              day_of_week: item.day_of_week,
              start_time: item.start_time,
              end_time: item.end_time,
              room: item.room,
            });
          }
        }
      }

      // Update status
      await supabase
        .from('generated_schedules')
        .update({ 
          status: 'published',
          published_at: new Date().toISOString(),
          published_by: user?.id,
        })
        .eq('status', 'draft');

      // Create notification for all users
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id');

      if (allUsers) {
        await supabase.from('notifications').insert(
          allUsers.map(u => ({
            user_id: u.id,
            type: 'schedule',
            title: 'Nouvel emploi du temps disponible',
            content: `L'emploi du temps ${config.school_year} a été publié.`,
          }))
        );
      }

      setScheduleStatus('published');
      toast.success('Emploi du temps publié et partagé avec tous les utilisateurs !');
    } catch (error: any) {
      console.error('Error publishing schedule:', error);
      toast.error(error.message || 'Erreur lors de la publication');
    }
  };

  const handleExportPDF = () => {
    if (!generatedSchedule) return;

    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const dayNames = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    
    // Header with logo
    pdf.setFontSize(20);
    pdf.setTextColor(46, 125, 50);
    pdf.text('FLORA CAMPUS', 148.5, 15, { align: 'center' });
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Emploi du temps - Année scolaire ${config.school_year}`, 148.5, 25, { align: 'center' });
    
    // Group by class
    const classesList = [...new Set(generatedSchedule.map((s: any) => s.class_name))];
    
    let yPos = 35;
    
    for (const className of classesList.slice(0, 3)) {
      const classSchedule = generatedSchedule.filter((s: any) => s.class_name === className);
      
      pdf.setFontSize(12);
      pdf.setTextColor(46, 125, 50);
      pdf.text(`Classe: ${className}`, 14, yPos);
      yPos += 8;

      // Simple table
      pdf.setFontSize(9);
      pdf.setTextColor(0, 0, 0);
      
      for (let day = 1; day <= 5; day++) {
        const daySchedule = classSchedule.filter((s: any) => s.day_of_week === day);
        if (daySchedule.length > 0) {
          pdf.text(`${dayNames[day]}: `, 14, yPos);
          const subjects = daySchedule.map((s: any) => `${s.start_time}-${s.subject_name}`).join(' | ');
          pdf.text(subjects, 35, yPos);
          yPos += 5;
        }
      }
      yPos += 10;
      
      if (yPos > 180) {
        pdf.addPage();
        yPos = 20;
      }
    }

    pdf.save(`emploi-du-temps-${config.school_year}.pdf`);
    toast.success('PDF exporté avec succès !');
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Générateur d'emploi du temps">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Générateur d'emploi du temps">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Générateur d'emploi du temps</h1>
            <p className="text-muted-foreground">
              Générez automatiquement l'emploi du temps de l'établissement
            </p>
          </div>
          {scheduleStatus !== 'none' && (
            <Badge variant={scheduleStatus === 'published' ? 'default' : 'secondary'}>
              {scheduleStatus === 'published' ? 'Publié' : 'Brouillon'}
            </Badge>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalSubjects}</p>
                  <p className="text-sm text-muted-foreground">Matières</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalClasses}</p>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalTeachers}</p>
                  <p className="text-sm text-muted-foreground">Enseignants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes by Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Classes par niveau
              </CardTitle>
              <CardDescription>Répartition automatique détectée</CardDescription>
            </CardHeader>
            <CardContent>
              {classesByLevel.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucune classe créée</p>
              ) : (
                <div className="space-y-2">
                  {classesByLevel.map((item) => (
                    <div key={item.level} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="font-medium">{item.level}</span>
                      <Badge variant="outline">{item.count} classe(s)</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Professeurs par matière
              </CardTitle>
              <CardDescription>Enseignants assignés</CardDescription>
            </CardHeader>
            <CardContent>
              {teachersBySubject.length === 0 ? (
                <p className="text-muted-foreground text-sm">Aucun professeur assigné</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {teachersBySubject.map((item) => (
                    <div key={item.subject_name} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span className="font-medium">{item.subject_name}</span>
                      <Badge variant="outline">{item.count} prof(s)</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Paramètres pour la génération de l'emploi du temps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Année scolaire</Label>
                <Input
                  value={config.school_year}
                  onChange={(e) => setConfig({ ...config, school_year: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Nombre de salles
                </Label>
                <Select
                  value={config.total_rooms.toString()}
                  onValueChange={(v) => setConfig({ ...config, total_rooms: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n} salle(s)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée cours (min)</Label>
                <Input
                  type="number"
                  value={config.course_duration_minutes}
                  onChange={(e) => setConfig({ ...config, course_duration_minutes: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Début (Lun-Ven)
                </Label>
                <Input
                  type="time"
                  value={config.start_time_weekdays}
                  onChange={(e) => setConfig({ ...config, start_time_weekdays: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fin (Lun-Ven)</Label>
                <Input
                  type="time"
                  value={config.end_time_weekdays}
                  onChange={(e) => setConfig({ ...config, end_time_weekdays: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Début Mercredi</Label>
                <Input
                  type="time"
                  value={config.start_time_wednesday}
                  onChange={(e) => setConfig({ ...config, start_time_wednesday: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fin Mercredi</Label>
                <Input
                  type="time"
                  value={config.end_time_wednesday}
                  onChange={(e) => setConfig({ ...config, end_time_wednesday: e.target.value })}
                />
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Note :</strong> Pour une meilleure gestion des salles, il est conseillé de les nommer 
                de manière séquentielle (Salle 1, Salle 2, etc.) et d'afficher les noms sur les portes.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Generation Progress */}
        {generating && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="font-medium">Génération en cours...</span>
                </div>
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Attribution des créneaux horaires et salles...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={handleGenerate} 
            disabled={generating}
            size="lg"
          >
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4 mr-2" />
            )}
            {generatedSchedule ? 'Régénérer' : 'Générer'} l'emploi du temps
          </Button>

          {generatedSchedule && (
            <>
              <Button variant="outline" onClick={() => {}} disabled={scheduleStatus === 'published'}>
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <Button 
                variant="default" 
                onClick={handlePublish}
                disabled={scheduleStatus === 'published'}
              >
                <Share2 className="w-4 h-4 mr-2" />
                {scheduleStatus === 'published' ? 'Déjà publié' : 'Partager à tous'}
              </Button>
              <Button variant="outline" onClick={handleExportPDF}>
                <FileDown className="w-4 h-4 mr-2" />
                Exporter PDF
              </Button>
            </>
          )}
        </div>

        {/* Success Message */}
        {scheduleStatus === 'published' && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              L'emploi du temps a été publié et partagé avec tous les utilisateurs 
              (éducateurs, censeurs, professeurs, élèves, parents).
            </AlertDescription>
          </Alert>
        )}

        {/* Preview */}
        {generatedSchedule && (
          <Card>
            <CardHeader>
              <CardTitle>Aperçu de l'emploi du temps généré</CardTitle>
              <CardDescription>
                {generatedSchedule.length} créneaux générés pour {totalClasses} classes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Classe</th>
                      <th className="text-left p-2">Jour</th>
                      <th className="text-left p-2">Horaire</th>
                      <th className="text-left p-2">Matière</th>
                      <th className="text-left p-2">Salle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatedSchedule.slice(0, 20).map((item: any, idx: number) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="p-2">{item.class_name}</td>
                        <td className="p-2">{['', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven'][item.day_of_week]}</td>
                        <td className="p-2">{item.start_time} - {item.end_time}</td>
                        <td className="p-2">{item.subject_name}</td>
                        <td className="p-2">{item.room}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {generatedSchedule.length > 20 && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    ... et {generatedSchedule.length - 20} autres créneaux
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ScheduleGenerator;
