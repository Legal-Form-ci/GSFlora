import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { studentNavItems } from '@/config/roleNavItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';

const StudentGrades = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [trimester, setTrimester] = useState('all');

  useEffect(() => {
    if (user) fetchGrades();
  }, [user]);

  const fetchGrades = async () => {
    try {
      const { data } = await supabase
        .from('grades')
        .select('*, courses(title, subjects(name, coefficient))')
        .eq('student_id', user?.id)
        .order('graded_at', { ascending: false });
      setGrades(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = trimester === 'all' ? grades : grades.filter(g => String(g.trimester) === trimester);

  const average = filtered.length > 0
    ? filtered.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / filtered.length
    : 0;

  // Group by subject
  const bySubject: Record<string, { total: number; count: number; coeff: number }> = {};
  filtered.forEach(g => {
    const subj = g.courses?.subjects?.name || 'Autre';
    if (!bySubject[subj]) bySubject[subj] = { total: 0, count: 0, coeff: g.courses?.subjects?.coefficient || 1 };
    bySubject[subj].total += (g.score / g.max_score) * 20;
    bySubject[subj].count++;
  });

  return (
    <DashboardLayout navItems={studentNavItems} title="Mes Notes">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={trimester} onValueChange={setTrimester}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Trimestre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les trimestres</SelectItem>
              <SelectItem value="1">1er Trimestre</SelectItem>
              <SelectItem value="2">2ème Trimestre</SelectItem>
              <SelectItem value="3">3ème Trimestre</SelectItem>
            </SelectContent>
          </Select>

          <Card className="flex-1 min-w-[200px]">
            <CardContent className="py-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${average >= 10 ? 'bg-flora-success/20' : 'bg-destructive/20'}`}>
                {average >= 10 ? <TrendingUp className="w-6 h-6 text-flora-success" /> : <TrendingDown className="w-6 h-6 text-destructive" />}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Moyenne générale</p>
                <p className={`text-2xl font-bold ${average >= 10 ? 'text-flora-success' : 'text-destructive'}`}>
                  {average.toFixed(2)}/20
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject averages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Moyennes par matière
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(bySubject).length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Aucune note disponible</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(bySubject).map(([name, data]) => {
                  const avg = data.total / data.count;
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{name} <span className="text-muted-foreground">(coef {data.coeff})</span></span>
                        <span className={`font-bold ${avg >= 10 ? 'text-flora-success' : 'text-destructive'}`}>{avg.toFixed(2)}/20</span>
                      </div>
                      <Progress value={(avg / 20) * 100} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grades table */}
        <Card>
          <CardHeader>
            <CardTitle>Détail des notes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Matière</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Coef</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Commentaire</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">Aucune note</TableCell></TableRow>
                  ) : filtered.map(g => (
                    <TableRow key={g.id}>
                      <TableCell className="font-medium">{g.courses?.subjects?.name}</TableCell>
                      <TableCell><Badge variant="outline">{g.grade_type || 'Note'}</Badge></TableCell>
                      <TableCell className={`font-bold ${(g.score / g.max_score) >= 0.5 ? 'text-flora-success' : 'text-destructive'}`}>
                        {g.score}/{g.max_score}
                      </TableCell>
                      <TableCell>{g.coefficient}</TableCell>
                      <TableCell>{g.graded_at ? new Date(g.graded_at).toLocaleDateString('fr-FR') : '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{g.comments || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentGrades;
