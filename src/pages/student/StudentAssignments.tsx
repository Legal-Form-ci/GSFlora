import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { studentNavItems } from '@/config/roleNavItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

const StudentAssignments = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [assignRes, subRes] = await Promise.all([
        supabase.from('assignments')
          .select('*, courses(title, subjects(name), classes(name))')
          .eq('is_published', true)
          .order('due_date', { ascending: true }),
        supabase.from('assignment_submissions')
          .select('*')
          .eq('student_id', user?.id),
      ]);
      setAssignments(assignRes.data || []);
      setSubmissions(subRes.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubmission = (assignmentId: string) => submissions.find(s => s.assignment_id === assignmentId);
  const now = new Date();
  const pending = assignments.filter(a => new Date(a.due_date) >= now && !getSubmission(a.id));
  const overdue = assignments.filter(a => new Date(a.due_date) < now && !getSubmission(a.id));
  const submitted = assignments.filter(a => getSubmission(a.id));

  const renderAssignment = (a: any) => {
    const sub = getSubmission(a.id);
    const isOverdue = new Date(a.due_date) < now && !sub;
    const daysLeft = Math.ceil((new Date(a.due_date).getTime() - now.getTime()) / 86400000);

    return (
      <div key={a.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOverdue ? 'bg-destructive/10' : sub ? 'bg-flora-success/10' : 'bg-primary/10'}`}>
            {isOverdue ? <AlertTriangle className="w-5 h-5 text-destructive" /> :
             sub ? <CheckCircle className="w-5 h-5 text-flora-success" /> :
             <FileText className="w-5 h-5 text-primary" />}
          </div>
          <div>
            <p className="font-medium">{a.title}</p>
            <p className="text-sm text-muted-foreground">{a.courses?.subjects?.name} • {a.courses?.classes?.name}</p>
          </div>
        </div>
        <div className="text-right">
          {sub ? (
            <Badge variant="default">
              {sub.score !== null ? `${sub.score}/${a.max_score}` : 'Soumis'}
            </Badge>
          ) : isOverdue ? (
            <Badge variant="destructive">En retard</Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              {daysLeft === 0 ? "Aujourd'hui" : daysLeft === 1 ? 'Demain' : `${daysLeft}j`}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(a.due_date).toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout navItems={studentNavItems} title="Mes Devoirs">
      <div className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="pending">
            <TabsList>
              <TabsTrigger value="pending">À rendre ({pending.length})</TabsTrigger>
              <TabsTrigger value="overdue">En retard ({overdue.length})</TabsTrigger>
              <TabsTrigger value="submitted">Soumis ({submitted.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="pending">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {pending.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucun devoir à rendre</p>
                  ) : pending.map(renderAssignment)}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="overdue">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {overdue.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucun devoir en retard 🎉</p>
                  ) : overdue.map(renderAssignment)}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="submitted">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {submitted.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Aucun devoir soumis</p>
                  ) : submitted.map(renderAssignment)}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentAssignments;
