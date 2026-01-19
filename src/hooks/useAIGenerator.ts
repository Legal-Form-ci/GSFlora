import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface GenerateParams {
  type: 'course' | 'assignment' | 'quiz';
  topic: string;
  description?: string;
  level: string;
  subject: string;
  country?: string;
  schoolSystem?: string;
  className?: string;
  teacherName?: string;
  schoolName?: string;
  difficulty?: string;
  duration?: number;
}

export const useAIGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async (params: GenerateParams) => {
    setIsGenerating(true);
    setGeneratedContent('');
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-course-generator`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de requêtes atteinte. Veuillez réessayer plus tard.');
        }
        if (response.status === 402) {
          throw new Error('Crédits insuffisants. Veuillez recharger votre compte.');
        }
        throw new Error('Erreur lors de la génération');
      }

      if (!response.body) {
        throw new Error('Pas de réponse du serveur');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullContent += content;
              setGeneratedContent(fullContent);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      return fullContent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGeneratedContent('');
    setError(null);
  }, []);

  return {
    generate,
    reset,
    isGenerating,
    generatedContent,
    error,
  };
};
