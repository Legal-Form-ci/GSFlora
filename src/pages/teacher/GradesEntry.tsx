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
  Home,
  BookOpen,
  FileText,
  ClipboardList,
  BarChart3,
  Users,
  Calendar,
  Save,
  Calculator,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
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
  class_id: string;
  classes: { id: string; name: string } | null;
  subjects: { id: string; name: string } | null;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface GradeEntry {
  studentId: string;
  score: string;
  existingGradeId?: string;
}

interface ClassStats {
  average: number;
  min: number;
  max: number;
  median: number;
}

const GradesEntry = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTrimester, setSelectedTrimester] = useState('1');
  const [gradeType, setGradeType] = useState('exam');
  const [maxScore, setMaxScore] = useState('20');
  const [coefficient, setCoefficient] = useState('1');
  const [grades, setGrades] = useState<Record<string, GradeEntry>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classStats, setClassStats] = useState<ClassStats | null>(null);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsAndGrades();
    }
  }, [selectedCourse, selectedTrimester, gradeType]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, class_id, classes(id, name), subjects(id, name)')
        .eq('teacher_id', user?.id)
        .order('title');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsAndGrades = async () => {
    const course = courses.find(c => c.id === selectedCourse);
    if (!course?.class_id) return;

    setLoading(true);
    try {
      // Fetch students in the class
      const { data: studentClasses, error: scError } = await supabase
        .from('student_classes')
        .select('student_id, profiles!student_classes_student_id_fkey(id, first_name, last_name, email)')
        .eq('class_id', course.class_id);

      if (scError) throw scError;

      const studentsData = studentClasses
        ?.map(sc => sc.profiles)
        .filter((p): p is Student => p !== null)
        .sort((a, b) => a.last_name.localeCompare(b.last_name)) || [];

      setStudents(studentsData);

      // Fetch existing grades
      const { data: existingGrades } = await supabase
        .from('grades')
        .select('id, student_id, score')
        .eq('course_id', selectedCourse)
        .eq('trimester', parseInt(selectedTrimester))
        .eq('grade_type', gradeType);

      const gradesMap: Record<string, GradeEntry> = {};
      studentsData.forEach(student => {
        const existingGrade = existingGrades?.find(g => g.student_id === student.id);
        gradesMap[student.id] = {
          studentId: student.id,
          score: existingGrade?.score?.toString() || '',
          existingGradeId: existingGrade?.id,
        };
      });

      setGrades(gradesMap);
      calculateStats(gradesMap);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (gradesMap: Record<string, GradeEntry>) => {
    const scores = Object.values(gradesMap)
      .map(g => parseFloat(g.score))
      .filter(s => !isNaN(s));

    if (scores.length === 0) {
      setClassStats(null);
      return;
    }

    const sorted = [...scores].sort((a, b) => a - b);
    const sum = scores.reduce((acc, s) => acc + s, 0);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    setClassStats({
      average: Math.round((sum / scores.length) * 100) / 100,
      min: Math.min(...scores),
      max: Math.max(...scores),
      median: Math.round(median * 100) / 100,
    });
  };

  const handleGradeChange = (studentId: string, score: string) => {
    const numScore = parseFloat(score);
    if (score && (isNaN(numScore) || numScore < 0 || numScore > parseFloat(maxScore))) {
      return;
    }
    
    const newGrades = {
      ...grades,
      [studentId]: { ...grades[studentId], score },
    };
    setGrades(newGrades);
    calculateStats(newGrades);
  };

  const handleSave = async () => {
    if (!selectedCourse) {
      toast.error('Veuillez sélectionner un cours');
      return;
    }

    setSaving(true);
    try {
      const gradesToUpsert = Object.values(grades)
        .filter(g => g.score !== '')
        .map(g => ({
          id: g.existingGradeId || undefined,
          student_id: g.studentId,
          course_id: selectedCourse,
          score: parseFloat(g.score),
          max_score: parseFloat(maxScore),
          coefficient: parseFloat(coefficient),
          trimester: parseInt(selectedTrimester),
          grade_type: gradeType,
          graded_by: user?.id,
          graded_at: new Date().toISOString(),
          school_year: new Date().getFullYear().toString(),
        }));

      for (const grade of gradesToUpsert) {
        if (grade.id) {
          await supabase.from('grades').update(grade).eq('id', grade.id);
        } else {
          await supabase.from('grades').insert(grade);
        }
      }

      toast.success('Notes enregistrées avec succès');
      fetchStudentsAndGrades();
    } catch (error) {
      console.error('Error saving grades:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: string) => {
    const num = parseFloat(score);
    const max = parseFloat(maxScore);
    if (isNaN(num)) return '';
    const percentage = (num / max) * 100;
    if (percentage >= 70) return 'text-flora-success font-semibold';
    if (percentage >= 50) return 'text-amber-600';
    return 'text-destructive';
  };

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  return (
    <DashboardLayout navItems={navItems} title="Saisie des notes">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Paramètres de la saisie
            </CardTitle>
            <CardDescription>
              Sélectionnez le cours et les paramètres pour saisir les notes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium">Cours</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un cours" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title} - {course.classes?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trimestre</label>
                <Select value={selectedTrimester} onValueChange={setSelectedTrimester}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1er Trimestre</SelectItem>
                    <SelectItem value="2">2ème Trimestre</SelectItem>
                    <SelectItem value="3">3ème Trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={gradeType} onValueChange={setGradeType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exam">Examen</SelectItem>
                    <SelectItem value="quiz">Interrogation</SelectItem>
                    <SelectItem value="homework">Devoir</SelectItem>
                    <SelectItem value="oral">Oral</SelectItem>
                    <SelectItem value="practical">TP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Note max</label>
                  <Input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Coef.</label>
                  <Input
                    type="number"
                    value={coefficient}
                    onChange={(e) => setCoefficient(e.target.value)}
                    min="1"
                    step="0.5"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {classStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Moyenne</p>
                    <p className="text-2xl font-bold text-primary">{classStats.average}/{maxScore}</p>
                  </div>
                  <Calculator className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-flora-success/5 border-flora-success/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Meilleure</p>
                    <p className="text-2xl font-bold text-flora-success">{classStats.max}/{maxScore}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-flora-success/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-destructive/5 border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Plus basse</p>
                    <p className="text-2xl font-bold text-destructive">{classStats.min}/{maxScore}</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-destructive/50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-flora-gold/5 border-flora-gold/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Médiane</p>
                    <p className="text-2xl font-bold text-amber-600">{classStats.median}/{maxScore}</p>
                  </div>
                  <Minus className="w-8 h-8 text-amber-600/50" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Grades Table */}
        {selectedCourse && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {selectedCourseData?.title}
                </CardTitle>
                <CardDescription>
                  {selectedCourseData?.classes?.name} • {selectedCourseData?.subjects?.name}
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
                        <TableHead className="w-32 text-center">Note /{maxScore}</TableHead>
                        <TableHead className="w-24 text-center">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student, index) => {
                        const grade = grades[student.id];
                        const hasGrade = grade?.score !== '';
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
                              <Input
                                type="number"
                                className={`w-20 mx-auto text-center ${getScoreColor(grade?.score || '')}`}
                                value={grade?.score || ''}
                                onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                min="0"
                                max={maxScore}
                                step="0.25"
                                placeholder="-"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {hasGrade ? (
                                <Badge variant={grade.existingGradeId ? 'default' : 'secondary'}>
                                  {grade.existingGradeId ? 'Modifié' : 'Nouveau'}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Non noté</Badge>
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

        {!selectedCourse && (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-lg mb-2">Sélectionnez un cours</h3>
              <p className="text-muted-foreground">
                Choisissez un cours pour commencer la saisie des notes
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GradesEntry;
