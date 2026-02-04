import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  Printer,
  QrCode,
  Download,
  Search,
  Loader2,
  CreditCard,
  CheckSquare,
  Square,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const navItems = [
  { label: 'Tableau de bord', href: '/admin', icon: <Home className="w-5 h-5" /> },
  { label: 'Utilisateurs', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
  { label: 'Classes', href: '/admin/classes', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Matières', href: '/admin/subjects', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Emplois du temps', href: '/admin/schedules', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Cartes élèves', href: '/admin/student-cards', icon: <CreditCard className="w-5 h-5" /> },
  { label: 'Statistiques', href: '/admin/stats', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Annonces', href: '/admin/announcements', icon: <Bell className="w-5 h-5" /> },
  { label: 'Paramètres', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
];

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string | null;
  class_name?: string;
  class_id?: string;
}

interface ClassData {
  id: string;
  name: string;
  level: string;
}

const StudentCards = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    } else {
      fetchAllStudents();
    }
  }, [selectedClass]);

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
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data: studentClasses, error } = await supabase
        .from('student_classes')
        .select(`
          student_id,
          class_id,
          classes!student_classes_class_id_fkey(name),
          profiles!student_classes_student_id_fkey(id, first_name, last_name, email, date_of_birth)
        `)
        .eq('class_id', selectedClass);

      if (error) throw error;

      const studentsData: Student[] = studentClasses
        ?.map((sc: any) => ({
          id: sc.profiles.id,
          first_name: sc.profiles.first_name,
          last_name: sc.profiles.last_name,
          email: sc.profiles.email,
          date_of_birth: sc.profiles.date_of_birth,
          class_name: sc.classes?.name,
          class_id: sc.class_id,
        }))
        .sort((a, b) => a.last_name.localeCompare(b.last_name)) || [];

      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    setLoading(true);
    try {
      const { data: studentClasses, error } = await supabase
        .from('student_classes')
        .select(`
          student_id,
          class_id,
          classes!student_classes_class_id_fkey(name),
          profiles!student_classes_student_id_fkey(id, first_name, last_name, email, date_of_birth)
        `);

      if (error) throw error;

      const studentsData: Student[] = studentClasses
        ?.map((sc: any) => ({
          id: sc.profiles.id,
          first_name: sc.profiles.first_name,
          last_name: sc.profiles.last_name,
          email: sc.profiles.email,
          date_of_birth: sc.profiles.date_of_birth,
          class_name: sc.classes?.name,
          class_id: sc.class_id,
        }))
        .sort((a, b) => a.last_name.localeCompare(b.last_name)) || [];

      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = (studentId: string): string => {
    // Generate a base64 encoded QR code placeholder
    // In production, use a real QR code library like qrcode
    const data = `FLORA-STUDENT-${studentId}`;
    return data;
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const filteredStudents = students.filter(student => 
    `${student.first_name} ${student.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePDF = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Veuillez sélectionner au moins un élève');
      return;
    }

    setPrinting(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const cardWidth = 85.6; // mm - standard card size
      const cardHeight = 54; // mm - standard card size
      const margin = 10;
      const cardsPerRow = 2;
      const cardsPerPage = 8;
      
      let cardIndex = 0;

      for (const studentId of selectedStudents) {
        const student = students.find(s => s.id === studentId);
        if (!student) continue;

        if (cardIndex > 0 && cardIndex % cardsPerPage === 0) {
          pdf.addPage();
        }

        const pageIndex = cardIndex % cardsPerPage;
        const row = Math.floor(pageIndex / cardsPerRow);
        const col = pageIndex % cardsPerRow;
        
        const x = margin + (col * (cardWidth + 5));
        const y = margin + (row * (cardHeight + 5));

        // Card background
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(0, 100, 50);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'FD');

        // Header with gradient effect
        pdf.setFillColor(0, 100, 50);
        pdf.rect(x, y, cardWidth, 15, 'F');
        
        // School name
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('GROUPE SCOLAIRE FLORA', x + cardWidth / 2, y + 7, { align: 'center' });
        pdf.setFontSize(7);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Carte d\'élève', x + cardWidth / 2, y + 12, { align: 'center' });

        // Photo placeholder
        pdf.setFillColor(240, 240, 240);
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(x + 5, y + 18, 20, 25, 'FD');
        pdf.setFontSize(6);
        pdf.setTextColor(150, 150, 150);
        pdf.text('PHOTO', x + 15, y + 32, { align: 'center' });

        // Student info
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${student.last_name.toUpperCase()}`, x + 30, y + 23);
        pdf.setFont('helvetica', 'normal');
        pdf.text(student.first_name, x + 30, y + 28);
        
        pdf.setFontSize(7);
        pdf.setTextColor(80, 80, 80);
        pdf.text(`Classe: ${student.class_name || 'N/A'}`, x + 30, y + 34);
        
        if (student.date_of_birth) {
          const dob = new Date(student.date_of_birth).toLocaleDateString('fr-FR');
          pdf.text(`Né(e) le: ${dob}`, x + 30, y + 39);
        }

        // QR Code area
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(0, 100, 50);
        pdf.rect(x + cardWidth - 25, y + 18, 20, 20, 'D');
        
        // QR Code placeholder (simple pattern)
        pdf.setFillColor(0, 0, 0);
        const qrSize = 18;
        const qrX = x + cardWidth - 24;
        const qrY = y + 19;
        
        // Generate simple QR pattern
        for (let i = 0; i < 6; i++) {
          for (let j = 0; j < 6; j++) {
            if ((i + j) % 2 === 0 || (i === 0 || i === 5 || j === 0 || j === 5)) {
              pdf.rect(qrX + i * 3, qrY + j * 3, 2.5, 2.5, 'F');
            }
          }
        }

        // Student ID
        pdf.setFontSize(6);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`ID: ${studentId.substring(0, 8).toUpperCase()}`, x + cardWidth - 15, y + 42, { align: 'center' });

        // Footer
        pdf.setFillColor(0, 100, 50);
        pdf.rect(x, y + cardHeight - 8, cardWidth, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(6);
        pdf.text(`Année scolaire ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, x + cardWidth / 2, y + cardHeight - 3, { align: 'center' });

        cardIndex++;
      }

      pdf.save(`cartes_eleves_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`${selectedStudents.length} carte(s) générée(s) avec succès`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erreur lors de la génération des cartes');
    } finally {
      setPrinting(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Cartes d'élèves">
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Impression de cartes d'élèves</h2>
                <p className="text-muted-foreground">
                  Générez des cartes avec QR code pour le scan de présence
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Sélection des élèves
            </CardTitle>
            <CardDescription>
              Filtrez et sélectionnez les élèves pour générer leurs cartes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium">Classe</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les classes</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - {cls.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Nom, prénom ou classe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={generatePDF}
                disabled={selectedStudents.length === 0 || printing}
                className="gap-2"
              >
                {printing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                Imprimer {selectedStudents.length > 0 && `(${selectedStudents.length})`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Liste des élèves</CardTitle>
              <CardDescription>
                {filteredStudents.length} élève(s) • {selectedStudents.length} sélectionné(s)
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedStudents.length === filteredStudents.length ? (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Tout désélectionner
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Tout sélectionner
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Élève</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Date de naissance</TableHead>
                      <TableHead className="w-24 text-center">QR Code</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow 
                        key={student.id}
                        className={selectedStudents.includes(student.id) ? 'bg-primary/5' : ''}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={() => handleSelectStudent(student.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {student.last_name} {student.first_name}
                            </p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{student.class_name || 'Non assigné'}</TableCell>
                        <TableCell>
                          {student.date_of_birth 
                            ? new Date(student.date_of_birth).toLocaleDateString('fr-FR')
                            : 'Non renseignée'}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              <QrCode className="w-5 h-5 text-muted-foreground" />
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucun élève trouvé</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Instructions d'impression
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Sélectionnez les élèves dont vous souhaitez imprimer les cartes</p>
            <p>2. Cliquez sur le bouton "Imprimer" pour générer le PDF</p>
            <p>3. Imprimez le PDF sur du papier cartonné (250g/m² recommandé)</p>
            <p>4. Découpez les cartes aux lignes de coupe</p>
            <p>5. Les cartes peuvent être plastifiées pour plus de durabilité</p>
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="font-medium text-foreground">💡 Note importante</p>
              <p className="mt-1">
                Le QR code de chaque carte est unique et lié à l'élève. Il permet le scan rapide 
                lors de la gestion des présences par les éducateurs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentCards;
