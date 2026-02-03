import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, BookOpen, Loader2 } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string | null;
  coefficient: number | null;
}

interface TeacherSubjectsSelectProps {
  selectedSubjects: string[];
  onSubjectsChange: (subjects: string[]) => void;
  primarySubject?: string;
  onPrimaryChange?: (subjectId: string) => void;
}

const TeacherSubjectsSelect = ({
  selectedSubjects,
  onSubjectsChange,
  primarySubject,
  onPrimaryChange,
}: TeacherSubjectsSelectProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, code, coefficient')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      const newSelected = selectedSubjects.filter(id => id !== subjectId);
      onSubjectsChange(newSelected);
      // If removing primary, set new primary
      if (primarySubject === subjectId && newSelected.length > 0) {
        onPrimaryChange?.(newSelected[0]);
      }
    } else {
      const newSelected = [...selectedSubjects, subjectId];
      onSubjectsChange(newSelected);
      // If first selection, make it primary
      if (newSelected.length === 1) {
        onPrimaryChange?.(subjectId);
      }
    }
  };

  const handleSetPrimary = (subjectId: string) => {
    if (selectedSubjects.includes(subjectId)) {
      onPrimaryChange?.(subjectId);
    }
  };

  const getSubjectName = (id: string) => {
    return subjects.find(s => s.id === id)?.name || id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          Matières enseignées
        </Label>
        <p className="text-xs text-muted-foreground">
          Sélectionnez les matières que ce professeur enseigne. Cliquez sur une matière sélectionnée pour la définir comme principale.
        </p>
      </div>

      {/* Selected subjects preview */}
      {selectedSubjects.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
          {selectedSubjects.map((subjectId) => (
            <Badge
              key={subjectId}
              variant={primarySubject === subjectId ? 'default' : 'secondary'}
              className="cursor-pointer gap-1"
              onClick={() => handleSetPrimary(subjectId)}
            >
              {getSubjectName(subjectId)}
              {primarySubject === subjectId && (
                <span className="text-xs ml-1">(Principal)</span>
              )}
              <X
                className="w-3 h-3 ml-1 hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(subjectId);
                }}
              />
            </Badge>
          ))}
        </div>
      )}

      {/* Subject list */}
      <ScrollArea className="h-[200px] border rounded-lg p-3">
        <div className="space-y-2">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                selectedSubjects.includes(subject.id) ? 'bg-primary/5 border border-primary/20' : ''
              }`}
              onClick={() => handleToggle(subject.id)}
            >
              <Checkbox
                checked={selectedSubjects.includes(subject.id)}
                onCheckedChange={() => handleToggle(subject.id)}
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{subject.name}</p>
                {subject.code && (
                  <p className="text-xs text-muted-foreground">Code: {subject.code}</p>
                )}
              </div>
              {subject.coefficient && (
                <Badge variant="outline" className="text-xs">
                  Coef. {subject.coefficient}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {subjects.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          Aucune matière disponible. Créez des matières dans la gestion des matières.
        </p>
      )}
    </div>
  );
};

export default TeacherSubjectsSelect;
