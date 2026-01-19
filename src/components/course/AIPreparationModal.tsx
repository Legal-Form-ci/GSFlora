import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader2, FileText, BookOpen, Eye, Download, X } from 'lucide-react';
import { useAIGenerator } from '@/hooks/useAIGenerator';
import { downloadPDF } from '@/utils/pdfGenerator';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface AIPreparationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseContent: (content: string, type: 'course' | 'assignment') => void;
  subjects: { id: string; name: string }[];
  classes: { id: string; name: string; level: string }[];
  teacherName: string;
  schoolName?: string;
}

const countries = [
  { code: 'CI', name: "Côte d'Ivoire", system: 'Système éducatif ivoirien' },
  { code: 'SN', name: 'Sénégal', system: 'Système éducatif sénégalais' },
  { code: 'CM', name: 'Cameroun', system: 'Système éducatif camerounais' },
  { code: 'BF', name: 'Burkina Faso', system: 'Système éducatif burkinabè' },
  { code: 'ML', name: 'Mali', system: 'Système éducatif malien' },
  { code: 'GN', name: 'Guinée', system: 'Système éducatif guinéen' },
  { code: 'BJ', name: 'Bénin', system: 'Système éducatif béninois' },
  { code: 'TG', name: 'Togo', system: 'Système éducatif togolais' },
  { code: 'FR', name: 'France', system: 'Éducation nationale française' },
];

const difficulties = [
  { value: 'facile', label: 'Facile' },
  { value: 'moyen', label: 'Moyen' },
  { value: 'difficile', label: 'Difficile' },
  { value: 'avance', label: 'Avancé' },
];

const AIPreparationModal = ({
  isOpen,
  onClose,
  onUseContent,
  subjects,
  classes,
  teacherName,
  schoolName = 'Groupe Scolaire Flora',
}: AIPreparationModalProps) => {
  const { generate, isGenerating, generatedContent, reset } = useAIGenerator();
  const [showFullContent, setShowFullContent] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'course' as 'course' | 'assignment',
    topic: '',
    description: '',
    subjectId: '',
    classId: '',
    country: 'CI',
    difficulty: 'moyen',
  });

  const selectedClass = classes.find(c => c.id === formData.classId);
  const selectedSubject = subjects.find(s => s.id === formData.subjectId);
  const selectedCountry = countries.find(c => c.code === formData.country);

  const handleGenerate = async () => {
    if (!formData.topic || !formData.subjectId || !formData.classId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    await generate({
      type: formData.type,
      topic: formData.topic,
      description: formData.description,
      level: selectedClass?.level || '',
      subject: selectedSubject?.name || '',
      className: selectedClass?.name,
      country: selectedCountry?.name,
      schoolSystem: selectedCountry?.system,
      teacherName,
      schoolName,
      difficulty: formData.difficulty,
    });
  };

  const handleDownloadPDF = async () => {
    if (!generatedContent) return;

    try {
      await downloadPDF({
        title: formData.topic,
        subject: selectedSubject?.name || '',
        className: selectedClass?.name || '',
        level: selectedClass?.level || '',
        teacherName,
        schoolName,
        content: generatedContent,
        type: formData.type,
      });
      toast.success('PDF téléchargé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du PDF');
    }
  };

  const handleUseContent = () => {
    onUseContent(generatedContent, formData.type);
    handleClose();
  };

  const handleClose = () => {
    reset();
    setFormData({
      type: 'course',
      topic: '',
      description: '',
      subjectId: '',
      classId: '',
      country: 'CI',
      difficulty: 'moyen',
    });
    setShowFullContent(false);
    onClose();
  };

  if (showFullContent) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {formData.type === 'course' ? (
                  <BookOpen className="w-5 h-5 text-primary" />
                ) : (
                  <FileText className="w-5 h-5 text-primary" />
                )}
                {formData.topic}
              </DialogTitle>
            </div>
            <DialogDescription>
              {selectedSubject?.name} - {selectedClass?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto prose prose-sm max-w-none p-4 bg-muted/30 rounded-lg">
            <ReactMarkdown>{generatedContent}</ReactMarkdown>
          </div>

          <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setShowFullContent(false)}>
              <X className="w-4 h-4 mr-2" />
              Fermer
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Générer PDF
              </Button>
              <Button onClick={handleUseContent}>
                <Sparkles className="w-4 h-4 mr-2" />
                Utiliser ce contenu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Préparation IA
          </DialogTitle>
          <DialogDescription>
            Laissez l'IA préparer votre cours ou devoir automatiquement
          </DialogDescription>
        </DialogHeader>

        {!generatedContent ? (
          <div className="space-y-4">
            {/* Type selection */}
            <div className="space-y-2">
              <Label>Type de document</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'course' | 'assignment') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="course">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Cours
                    </div>
                  </SelectItem>
                  <SelectItem value="assignment">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Devoir
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Thème / Sujet *</Label>
              <Input
                id="topic"
                placeholder="Ex: Les fonctions affines, La photosynthèse..."
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description additionnelle</Label>
              <Textarea
                id="description"
                placeholder="Précisions, objectifs spécifiques, points à couvrir..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Subject */}
              <div className="space-y-2">
                <Label>Matière *</Label>
                <Select
                  value={formData.subjectId}
                  onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Class */}
              <div className="space-y-2">
                <Label>Classe *</Label>
                <Select
                  value={formData.classId}
                  onValueChange={(value) => setFormData({ ...formData, classId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Country */}
              <div className="space-y-2">
                <Label>Pays / Système scolaire</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label>Niveau de difficulté</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff.value} value={diff.value}>
                        {diff.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Préparer avec l'IA
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary preview */}
            <div className="bg-flora-success/10 border border-flora-success/30 rounded-lg p-4">
              <h4 className="font-medium text-flora-success flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" />
                Contenu généré avec succès !
              </h4>
              <p className="text-sm text-muted-foreground">
                {formData.type === 'course' ? 'Cours' : 'Devoir'} sur "{formData.topic}" pour la classe{' '}
                {selectedClass?.name}
              </p>
            </div>

            {/* Preview */}
            <div className="max-h-[300px] overflow-y-auto prose prose-sm max-w-none p-4 bg-muted/30 rounded-lg border">
              <ReactMarkdown>
                {generatedContent.slice(0, 1500) + (generatedContent.length > 1500 ? '...' : '')}
              </ReactMarkdown>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 justify-between">
              <Button variant="outline" onClick={() => reset()}>
                <Sparkles className="w-4 h-4 mr-2" />
                Regénérer
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowFullContent(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Voir complet
                </Button>
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Générer PDF
                </Button>
                <Button onClick={handleUseContent}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Utiliser
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AIPreparationModal;
