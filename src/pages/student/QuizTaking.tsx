import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Home,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Calendar,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  Trophy,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const navItems = [
  { label: 'Tableau de bord', href: '/student', icon: <Home className="w-5 h-5" /> },
  { label: 'Mes cours', href: '/student/courses', icon: <BookOpen className="w-5 h-5" /> },
  { label: 'Quiz', href: '/student/quizzes', icon: <ClipboardList className="w-5 h-5" /> },
  { label: 'Notes', href: '/student/grades', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Emploi du temps', href: '/student/schedule', icon: <Calendar className="w-5 h-5" /> },
];

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[] | null;
  correct_answer: string;
  points: number;
  explanation?: string;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  max_score: number;
  passing_score: number;
  show_answers_after: boolean;
}

const QuizTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    maxScore: number;
    passed: boolean;
    correctAnswers: number;
    totalQuestions: number;
  } | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuizData();
    }
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuizData = async () => {
    try {
      // Fetch quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .select('*')
        .eq('id', id)
        .single();

      if (quizError) throw quizError;
      setQuiz(quizData);

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', id)
        .order('order_index');

      if (questionsError) throw questionsError;
      
      // Parse options from JSON
      const parsedQuestions = questionsData?.map(q => ({
        ...q,
        options: q.options as string[] | null,
      })) || [];
      
      setQuestions(parsedQuestions);

      // Create attempt
      const { data: attemptData, error: attemptError } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: id,
          student_id: user?.id,
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (attemptError) throw attemptError;
      setAttemptId(attemptData.id);

      // Set timer
      if (quizData.duration_minutes) {
        setTimeLeft(quizData.duration_minutes * 60);
      }
    } catch (error) {
      console.error('Error fetching quiz:', error);
      toast.error('Erreur lors du chargement du quiz');
      navigate('/student/quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setShowConfirmSubmit(false);

    try {
      // Calculate score
      let score = 0;
      let correctCount = 0;

      questions.forEach(question => {
        const userAnswer = answers[question.id];
        if (userAnswer && userAnswer.toLowerCase() === question.correct_answer.toLowerCase()) {
          score += question.points;
          correctCount++;
        }
      });

      const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
      const passed = quiz?.passing_score ? score >= quiz.passing_score : score >= maxScore * 0.5;

      // Update attempt
      await supabase
        .from('quiz_attempts')
        .update({
          answers,
          score,
          completed_at: new Date().toISOString(),
          time_spent_seconds: quiz?.duration_minutes ? 
            (quiz.duration_minutes * 60 - (timeLeft || 0)) : null,
        })
        .eq('id', attemptId);

      // Create grade record
      await supabase
        .from('grades')
        .insert({
          student_id: user?.id,
          quiz_id: id,
          course_id: null, // Will be linked via quiz
          score,
          max_score: maxScore,
          grade_type: 'quiz',
        });

      setResults({
        score,
        maxScore,
        passed,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
      });
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <DashboardLayout navItems={navItems} title="Quiz">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (showResults && results) {
    return (
      <DashboardLayout navItems={navItems} title="Résultats du Quiz">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center space-y-6">
              {results.passed ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-green-600">Félicitations !</h2>
                  <p className="text-muted-foreground">Vous avez réussi le quiz</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-red-600">Pas encore...</h2>
                  <p className="text-muted-foreground">Continuez à vous entraîner</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 py-6">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">{results.score}/{results.maxScore}</p>
                  <p className="text-sm text-muted-foreground">Score</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">{results.correctAnswers}/{results.totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Bonnes réponses</p>
                </div>
              </div>

              {quiz?.show_answers_after && (
                <div className="text-left space-y-4 border-t pt-6">
                  <h3 className="font-semibold">Correction</h3>
                  {questions.map((question, index) => {
                    const userAnswer = answers[question.id];
                    const isCorrect = userAnswer?.toLowerCase() === question.correct_answer.toLowerCase();
                    return (
                      <div key={question.id} className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                        <p className="font-medium">
                          {index + 1}. {question.question_text}
                        </p>
                        <div className="mt-2 text-sm space-y-1">
                          <p>Votre réponse: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{userAnswer || 'Non répondu'}</span></p>
                          {!isCorrect && (
                            <p>Bonne réponse: <span className="text-green-600 font-medium">{question.correct_answer}</span></p>
                          )}
                          {question.explanation && (
                            <p className="text-muted-foreground mt-2">{question.explanation}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Button onClick={() => navigate('/student/quizzes')} className="w-full">
                Retour aux quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title={quiz?.title || 'Quiz'}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{quiz?.title}</h2>
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} sur {questions.length}
            </p>
          </div>
          {timeLeft !== null && (
            <Badge variant={timeLeft < 60 ? 'destructive' : 'secondary'} className="text-lg px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              {formatTime(timeLeft)}
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{answeredCount} réponses</span>
            <span>{questions.length - answeredCount} restantes</span>
          </div>
        </div>

        {/* Question */}
        {currentQuestion && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {currentQuestion.question_type === 'mcq' ? 'QCM' : 'Vrai/Faux'}
                  </Badge>
                  <CardTitle className="text-lg">{currentQuestion.question_text}</CardTitle>
                </div>
                <Badge variant="secondary">{currentQuestion.points} pts</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) => handleAnswer(currentQuestion.id, value)}
              >
                {currentQuestion.question_type === 'true_false' ? (
                  <div className="space-y-3">
                    {['Vrai', 'Faux'].map((option) => (
                      <div key={option} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer flex-1">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentQuestion.options?.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>

          <div className="flex gap-1">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? 'bg-primary text-primary-foreground'
                    : answers[questions[index].id]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex === questions.length - 1 ? (
            <Button onClick={() => setShowConfirmSubmit(true)} disabled={submitting}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Terminer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question Navigation Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Navigation rapide</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-primary text-primary-foreground'
                      : answers[question.id]
                      ? 'bg-green-500 text-white'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span>Répondu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted"></div>
                <span>Non répondu</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirm Submit Dialog */}
      <Dialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Confirmer la soumission
            </DialogTitle>
            <DialogDescription>
              Vous avez répondu à {answeredCount} questions sur {questions.length}.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-yellow-600">
                  Attention : {questions.length - answeredCount} question(s) sans réponse !
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
              Continuer le quiz
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Soumettre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default QuizTaking;
