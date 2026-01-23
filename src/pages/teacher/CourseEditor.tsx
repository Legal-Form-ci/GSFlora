import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { downloadPDF } from '@/utils/pdfGenerator';
import { downloadWord } from '@/utils/wordGenerator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  BookOpen,
  FileText,
  ClipboardList,
  BarChart3,
  Users,
  Calendar,
  Save,
  Eye,
  FileDown,
  ArrowLeft,
  Sparkles,
  Loader2,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import AIPreparationModal from '@/components/course/AIPreparationModal';

const navItems = [
  { label: 'Tableau de bord', href: '/teacher', icon: <Home className="w-5 h-5" /> },
  { label: 'Mes cours', href: '/teacher/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Devoirs', href: '/teacher/assignments', icon: <FileText className="w-5 h-5" /> },
  { label: 'Quiz', href: '/teacher/quizzes', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Notes', href: '/teacher/grades', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Élèves', href: '/teacher/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/teacher/schedule', icon: <Calendar className="w-5 h-5" /> },
];

interface SubjectOption {
  id: string;
  name: string;
}

interface ClassOption {
  id: string;
  name: string;
  level: string;
}

const CourseEditor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [duration, setDuration] = useState('60');
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);

  useEffect(() => {
    fetchSubjectsAndClasses();
    
    // Check for AI-generated content in URL
    const aiContent = searchParams.get('aiContent');
    if (aiContent) {
      setContent(decodeURIComponent(aiContent));
    }
    
    if (isEditing) {
      fetchCourse();
    }
  }, [id]);

  const fetchSubjectsAndClasses = async () => {
    try {
      const [subjectsRes, classesRes] = await Promise.all([
        supabase.from('subjects').select('id, name').order('name'),
        supabase.from('classes').select('id, name, level').order('name'),
      ]);

      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (classesRes.data) setClasses(classesRes.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const fetchCourse = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setTitle(data.title);
        setChapter(data.chapter || '');
        setContent(data.content || '');
        setSubjectId(data.subject_id);
        setClassId(data.class_id);
        setDifficulty(data.difficulty || 'intermediate');
        setDuration(data.duration_minutes?.toString() || '60');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Erreur lors du chargement du cours');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish = false) => {
    if (!title || !subjectId || !classId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      const courseData = {
        title,
        chapter: chapter || null,
        content,
        subject_id: subjectId,
        class_id: classId,
        teacher_id: user?.id,
        difficulty,
        duration_minutes: parseInt(duration),
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', id);
        if (error) throw error;
        toast.success('Cours mis à jour avec succès');
      } else {
        const { error } = await supabase
          .from('courses')
          .insert(courseData);
        if (error) throw error;
        toast.success(publish ? 'Cours publié avec succès' : 'Brouillon enregistré');
      }

      navigate('/teacher/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    const selectedClass = classes.find(c => c.id === classId);
    const selectedSubject = subjects.find(s => s.id === subjectId);
    
    await downloadPDF({
      title,
      content,
      type: 'course',
      className: selectedClass?.name || '',
      level: selectedClass?.level || '',
      subject: selectedSubject?.name || '',
      teacherName: profile ? `${profile.first_name} ${profile.last_name}` : '',
      schoolName: 'Groupe Scolaire Flora',
    });
    
    toast.success('PDF généré avec succès');
  };

  const handleGenerateWord = async () => {
    const selectedClass = classes.find(c => c.id === classId);
    const selectedSubject = subjects.find(s => s.id === subjectId);
    
    await downloadWord({
      title,
      content,
      type: 'course',
      className: selectedClass?.name || '',
      level: selectedClass?.level || '',
      subject: selectedSubject?.name || '',
      teacherName: profile ? `${profile.first_name} ${profile.last_name}` : '',
      schoolName: 'Groupe Scolaire Flora',
    });
    
    toast.success('Document Word généré avec succès');
  };

  const teacherName = profile ? `${profile.first_name} ${profile.last_name}` : '';

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title={isEditing ? 'Modifier le cours' : 'Nouveau cours'}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title={isEditing ? 'Modifier le cours' : 'Nouveau cours'}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/teacher/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAIModal(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Aide IA
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={!content}>
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleGeneratePDF}>
                  <FileDown className="w-4 h-4 mr-2" />
                  Télécharger en PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGenerateWord}>
                  <FileText className="w-4 h-4 mr-2" />
                  Télécharger en Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informations du cours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du cours *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Introduction aux équations"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chapter">Chapitre</Label>
                <Input
                  id="chapter"
                  placeholder="Ex: Chapitre 3"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Matière *</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Classe *</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Difficulté</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Débutant</SelectItem>
                    <SelectItem value="intermediate">Intermédiaire</SelectItem>
                    <SelectItem value="advanced">Avancé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Durée (min)</Label>
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="15"
                  step="15"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Contenu du cours</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor content={content} onChange={setContent} />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Enregistrer brouillon
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
            Publier
          </Button>
        </div>
      </div>

      {/* AI Modal */}
      <AIPreparationModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onUseContent={(aiContent: string) => setContent(aiContent)}
        subjects={subjects}
        classes={classes}
        teacherName={teacherName}
      />
    </DashboardLayout>
  );
};

export default CourseEditor;
