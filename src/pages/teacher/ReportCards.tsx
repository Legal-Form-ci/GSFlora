import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Home, BookOpen, FileText, ClipboardList, BarChart3, Users,
  Download, FileDown, Loader2, TrendingUp, TrendingDown, Award,
} from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

const navItems = [
  { label: 'Tableau de bord', href: '/teacher', icon: <Home className="w-5 h-5" /> },
  { label: 'Mes cours', href: '/teacher/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Devoirs', href: '/teacher/assignments', icon: <FileText className="w-5 h-5" /> },
  { label: 'Quiz', href: '/teacher/quizzes', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Notes', href: '/teacher/grades', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Bulletins', href: '/teacher/report-cards', icon: <Award className="w-5 h-5" /> },
  { label: 'Élèves', href: '/teacher/students', icon: <Users className="w-5 h-5" /> },
];

interface Class { id: string; name: string; level: string; }
interface Student { id: string; first_name: string; last_name: string; }
interface GradeData { subjectId: string; subjectName: string; coefficient: number; score: number; maxScore: number; classAverage: number; classMin: number; classMax: number; teacherName: string; appreciation: string; }
interface StudentReport { student: Student; grades: GradeData[]; trimesterAverage: number; classRank: number; totalStudents: number; generalAppreciation: string; conduct: string; }

const ReportCards = () => {
  const { user } = useAuth();
  const { currentSchool } = useSchool();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTrimester, setSelectedTrimester] = useState('1');
  const [schoolYear, setSchoolYear] = useState('2025-2026');
  const [reports, setReports] = useState<StudentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (currentSchool) fetchClasses();
  }, [currentSchool]);

  useEffect(() => {
    if (selectedClass) generateReports();
  }, [selectedClass, selectedTrimester]);

  const fetchClasses = async () => {
    if (!currentSchool) return;
    try {
      const { data, error } = await supabase.from('classes').select('id, name, level').eq('school_id', currentSchool.id).order('name');
      if (error) throw error;
      setClasses(data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReports = async () => {
    if (!currentSchool) return;
    setLoading(true);
    try {
      const { data: studentClasses } = await supabase
        .from('student_classes')
        .select('student_id, profiles!student_classes_student_id_fkey(id, first_name, last_name)')
        .eq('class_id', selectedClass)
        .eq('school_id', currentSchool.id);

      const students = studentClasses?.map(sc => sc.profiles).filter((p): p is Student => p !== null)
        .sort((a, b) => a.last_name.localeCompare(b.last_name)) || [];

      const { data: grades } = await supabase
        .from('grades')
        .select(`id, student_id, course_id, score, max_score, coefficient, grade_type,
          courses!grades_course_id_fkey(id, subject_id, teacher_id, subjects(id, name, coefficient), profiles!courses_teacher_id_fkey(first_name, last_name))`)
        .eq('trimester', parseInt(selectedTrimester))
        .eq('school_id', currentSchool.id)
        .in('student_id', students.map(s => s.id));

      const studentReports: StudentReport[] = [];

      for (const student of students) {
        const studentGrades = grades?.filter(g => g.student_id === student.id) || [];
        const gradesBySubject: Record<string, GradeData> = {};

        for (const grade of studentGrades) {
          const course = grade.courses;
          if (!course?.subjects) continue;
          const subjectId = course.subject_id;
          const subjectName = course.subjects.name;
          const coeff = course.subjects.coefficient || 1;
          const teacherName = course.profiles ? `${course.profiles.first_name} ${course.profiles.last_name}` : 'N/A';

          if (!gradesBySubject[subjectId]) {
            gradesBySubject[subjectId] = { subjectId, subjectName, coefficient: coeff, score: 0, maxScore: 20, classAverage: 0, classMin: 20, classMax: 0, teacherName, appreciation: '' };
          }
          const currentData = gradesBySubject[subjectId];
          const gradeWeight = grade.coefficient || 1;
          const normalizedScore = (grade.score / (grade.max_score || 20)) * 20;
          currentData.score = (currentData.score + normalizedScore * gradeWeight) / (1 + gradeWeight);
        }

        for (const subjectId of Object.keys(gradesBySubject)) {
          const subjectGrades = grades?.filter(g => g.courses?.subject_id === subjectId) || [];
          const allScores = subjectGrades.map(g => (g.score / (g.max_score || 20)) * 20);
          if (allScores.length > 0) {
            gradesBySubject[subjectId].classAverage = allScores.reduce((a, b) => a + b, 0) / allScores.length;
            gradesBySubject[subjectId].classMin = Math.min(...allScores);
            gradesBySubject[subjectId].classMax = Math.max(...allScores);
          }
          const avg = gradesBySubject[subjectId].score;
          if (avg >= 16) gradesBySubject[subjectId].appreciation = 'Excellent travail';
          else if (avg >= 14) gradesBySubject[subjectId].appreciation = 'Très bien';
          else if (avg >= 12) gradesBySubject[subjectId].appreciation = 'Bien';
          else if (avg >= 10) gradesBySubject[subjectId].appreciation = 'Assez bien';
          else if (avg >= 8) gradesBySubject[subjectId].appreciation = 'Passable';
          else gradesBySubject[subjectId].appreciation = 'Insuffisant';
        }

        const gradesArray = Object.values(gradesBySubject);
        let totalWeighted = 0, totalCoef = 0;
        for (const g of gradesArray) { totalWeighted += g.score * g.coefficient; totalCoef += g.coefficient; }
        const trimesterAverage = totalCoef > 0 ? totalWeighted / totalCoef : 0;

        let generalAppreciation = '';
        if (trimesterAverage >= 16) generalAppreciation = 'Félicitations du conseil de classe';
        else if (trimesterAverage >= 14) generalAppreciation = 'Tableau d\'honneur';
        else if (trimesterAverage >= 12) generalAppreciation = 'Encouragements';
        else if (trimesterAverage >= 10) generalAppreciation = 'Peut mieux faire';
        else generalAppreciation = 'Résultats insuffisants - Doit redoubler d\'efforts';

        studentReports.push({ student, grades: gradesArray, trimesterAverage: Math.round(trimesterAverage * 100) / 100, classRank: 0, totalStudents: students.length, generalAppreciation, conduct: 'Bonne' });
      }

      studentReports.sort((a, b) => b.trimesterAverage - a.trimesterAverage);
      studentReports.forEach((report, index) => { report.classRank = index + 1; });
      studentReports.sort((a, b) => a.student.last_name.localeCompare(b.student.last_name));

      setReports(studentReports);
    } catch (error) {
      console.error('Error generating reports:', error);
      toast.error('Erreur lors de la génération des bulletins');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (report: StudentReport) => {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;
    const selectedClassData = classes.find(c => c.id === selectedClass);

    pdf.setFontSize(16); pdf.setFont('helvetica', 'bold');
    pdf.text(currentSchool?.name?.toUpperCase() || 'ÉTABLISSEMENT', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    pdf.setFontSize(14);
    pdf.text('BULLETIN DE NOTES', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
    pdf.text(`Élève: ${report.student.last_name} ${report.student.first_name}`, margin, yPos);
    pdf.text(`Classe: ${selectedClassData?.name || ''}`, pageWidth - margin - 40, yPos);
    yPos += 6;
    pdf.text(`Année scolaire: ${schoolYear}`, margin, yPos);
    pdf.text(`Trimestre: ${selectedTrimester}`, pageWidth - margin - 30, yPos);
    yPos += 10;

    const colWidths = [50, 20, 25, 25, 25, 35];
    const tableStart = margin;
    pdf.setFillColor(59, 130, 246); pdf.setTextColor(255, 255, 255);
    pdf.rect(tableStart, yPos, pageWidth - margin * 2, 8, 'F');
    pdf.setFontSize(9); pdf.setFont('helvetica', 'bold');
    let xPos = tableStart + 2;
    pdf.text('Matière', xPos, yPos + 5); xPos += colWidths[0];
    pdf.text('Coef.', xPos, yPos + 5); xPos += colWidths[1];
    pdf.text('Note/20', xPos, yPos + 5); xPos += colWidths[2];
    pdf.text('Moy. Cl.', xPos, yPos + 5); xPos += colWidths[3];
    pdf.text('Min/Max', xPos, yPos + 5); xPos += colWidths[4];
    pdf.text('Appréciation', xPos, yPos + 5);
    yPos += 10;

    pdf.setTextColor(0, 0, 0); pdf.setFont('helvetica', 'normal');
    for (const grade of report.grades) {
      xPos = tableStart + 2;
      pdf.setFontSize(8);
      pdf.text(grade.subjectName.substring(0, 20), xPos, yPos + 4); xPos += colWidths[0];
      pdf.text(grade.coefficient.toString(), xPos, yPos + 4); xPos += colWidths[1];
      const scoreColor = grade.score >= 10 ? [34, 197, 94] : [239, 68, 68];
      pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.text(grade.score.toFixed(2), xPos, yPos + 4);
      pdf.setTextColor(0, 0, 0); pdf.setFont('helvetica', 'normal');
      xPos += colWidths[2];
      pdf.text(grade.classAverage.toFixed(2), xPos, yPos + 4); xPos += colWidths[3];
      pdf.text(`${grade.classMin.toFixed(1)}/${grade.classMax.toFixed(1)}`, xPos, yPos + 4); xPos += colWidths[4];
      pdf.setFontSize(7);
      pdf.text(grade.appreciation, xPos, yPos + 4);
      yPos += 7;
      pdf.line(tableStart, yPos, pageWidth - margin, yPos);
    }
    yPos += 10;

    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPos, pageWidth - margin * 2, 25, 'F');
    yPos += 8;
    pdf.setFontSize(12); pdf.setFont('helvetica', 'bold');
    const avgColor = report.trimesterAverage >= 10 ? [34, 197, 94] : [239, 68, 68];
    pdf.setTextColor(avgColor[0], avgColor[1], avgColor[2]);
    pdf.text(`Moyenne générale: ${report.trimesterAverage.toFixed(2)}/20`, margin + 5, yPos);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Rang: ${report.classRank}/${report.totalStudents}`, pageWidth / 2, yPos);
    yPos += 10;
    pdf.setFontSize(10); pdf.setFont('helvetica', 'normal');
    pdf.text(`Appréciation générale: ${report.generalAppreciation}`, margin + 5, yPos);
    yPos += 20;
    pdf.setFontSize(9);
    pdf.text('Le Chef d\'établissement', margin, yPos);
    pdf.text('Le Professeur Principal', pageWidth / 2 - 20, yPos);
    pdf.text('Parent/Tuteur', pageWidth - margin - 25, yPos);
    pdf.setFontSize(8);
    pdf.text(`${currentSchool?.name || 'Établissement'} - Excellence et Innovation`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    pdf.save(`Bulletin_${report.student.last_name}_${report.student.first_name}_T${selectedTrimester}.pdf`);
    toast.success('Bulletin téléchargé');
  };

  const generateAllPDFs = async () => {
    setGenerating(true);
    try {
      for (const report of reports) { await generatePDF(report); await new Promise(resolve => setTimeout(resolve, 500)); }
      toast.success('Tous les bulletins ont été générés');
    } catch { toast.error('Erreur lors de la génération'); } finally { setGenerating(false); }
  };

  const selectedClassData = classes.find(c => c.id === selectedClass);

  return (
    <DashboardLayout navItems={navItems} title="Bulletins scolaires">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Award className="w-5 h-5 text-primary" />Génération des bulletins</CardTitle>
            <CardDescription>Sélectionnez une classe et un trimestre pour générer les bulletins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium">Classe</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger>
                  <SelectContent>{classes.map((cls) => <SelectItem key={cls.id} value={cls.id}>{cls.name} - {cls.level}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trimestre</label>
                <Select value={selectedTrimester} onValueChange={setSelectedTrimester}>
                  <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1er Trimestre</SelectItem>
                    <SelectItem value="2">2ème Trimestre</SelectItem>
                    <SelectItem value="3">3ème Trimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Année scolaire</label>
                <Select value={schoolYear} onValueChange={setSchoolYear}>
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-2025">2024-2025</SelectItem>
                    <SelectItem value="2025-2026">2025-2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {reports.length > 0 && (
                <Button onClick={generateAllPDFs} disabled={generating}>
                  {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
                  Télécharger tous les bulletins
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedClass && (
          <Card>
            <CardHeader>
              <CardTitle>{selectedClassData?.name}</CardTitle>
              <CardDescription>{reports.length} élèves • Trimestre {selectedTrimester}</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : reports.length > 0 ? (
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-12">Rang</TableHead>
                        <TableHead>Élève</TableHead>
                        <TableHead className="text-center">Moyenne</TableHead>
                        <TableHead>Appréciation</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.student.id}>
                          <TableCell className="font-bold text-center">
                            {report.classRank <= 3 ? (
                              <Badge variant="default" className={report.classRank === 1 ? 'bg-yellow-500' : report.classRank === 2 ? 'bg-gray-400' : 'bg-amber-600'}>
                                {report.classRank}
                              </Badge>
                            ) : report.classRank}
                          </TableCell>
                          <TableCell className="font-medium">{report.student.last_name} {report.student.first_name}</TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold text-lg ${report.trimesterAverage >= 10 ? 'text-primary' : 'text-destructive'}`}>
                              {report.trimesterAverage.toFixed(2)}
                            </span>
                            <span className="text-muted-foreground">/20</span>
                          </TableCell>
                          <TableCell><Badge variant="outline">{report.generalAppreciation}</Badge></TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => generatePDF(report)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium text-lg mb-2">Aucune donnée</h3>
                  <p className="text-muted-foreground">Aucune note trouvée pour cette classe et ce trimestre</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ReportCards;
