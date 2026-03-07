import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSchool } from '@/contexts/SchoolContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { parentNavItems } from '@/config/roleNavItems';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Users, GraduationCap, Calendar, Bell, MessageSquare,
  TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, Send, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const ParentDashboard = () => {
  const { user, profile } = useAuth();
  const { currentSchool } = useSchool();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (user && currentSchool) {
      fetchChildren();
      fetchAnnouncements();
    }
  }, [user, currentSchool]);

  useEffect(() => {
    if (selectedChild && currentSchool) fetchChildData(selectedChild);
  }, [selectedChild, currentSchool]);

  const fetchChildren = async () => {
    if (!currentSchool) return;
    try {
      const { data: relationships } = await supabase
        .from('student_parent_relationships')
        .select('student_id, relationship')
        .eq('parent_id', user?.id)
        .eq('school_id', currentSchool.id);

      if (relationships && relationships.length > 0) {
        const studentIds = relationships.map(r => r.student_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', studentIds);

        setChildren(profiles || []);
        if (profiles && profiles.length > 0) setSelectedChild(profiles[0].id);
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildData = async (childId: string) => {
    if (!currentSchool) return;
    try {
      const [gradesRes, attendanceRes] = await Promise.all([
        supabase.from('grades')
          .select('id, score, max_score, graded_at, courses(subjects(name))')
          .eq('student_id', childId).eq('school_id', currentSchool.id)
          .order('graded_at', { ascending: false }).limit(10),
        supabase.from('attendance')
          .select('id, date, status, notes')
          .eq('student_id', childId).eq('school_id', currentSchool.id)
          .order('date', { ascending: false }).limit(30),
      ]);

      setGrades((gradesRes.data || []).map((g: any) => ({
        id: g.id, score: g.score, max_score: g.max_score,
        subject_name: g.courses?.subjects?.name || 'N/A', graded_at: g.graded_at,
      })));
      setAttendance(attendanceRes.data || []);
    } catch (error) {
      console.error('Error fetching child data:', error);
    }
  };

  const fetchAnnouncements = async () => {
    if (!currentSchool) return;
    const { data } = await supabase.from('announcements').select('*')
      .eq('school_id', currentSchool.id)
      .order('created_at', { ascending: false }).limit(5);
    setAnnouncements(data || []);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSendingMessage(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Message envoyé à l\'établissement');
    setMessage('');
    setSendingMessage(false);
  };

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0;
    return (grades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0) / grades.length).toFixed(2);
  };

  const getAttendanceStats = () => {
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    return { present, absent, late };
  };

  const attendanceStats = getAttendanceStats();
  const selectedChildData = children.find(c => c.id === selectedChild);

  if (loading) {
    return (
      <DashboardLayout navItems={parentNavItems} title="Tableau de bord Parent">
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={parentNavItems} title="Tableau de bord Parent">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
          <h2 className="text-2xl font-bold">Bienvenue, {profile?.first_name} {profile?.last_name}</h2>
          <p className="text-muted-foreground mt-1">Suivez la scolarité de vos enfants</p>
        </div>

        {children.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {children.map((child: any) => (
              <Button key={child.id} variant={selectedChild === child.id ? 'default' : 'outline'} onClick={() => setSelectedChild(child.id)}>
                {child.first_name} {child.last_name}
              </Button>
            ))}
          </div>
        )}

        {selectedChildData && (
          <>
            <div className="grid md:grid-cols-4 gap-4">
              <StatCard title="Moyenne générale" value={`${calculateAverageGrade()}/20`} icon={<GraduationCap className="w-5 h-5" />} trend={Number(calculateAverageGrade()) >= 10 ? { value: 5, isPositive: true } : { value: -5, isPositive: false }} />
              <StatCard title="Présences" value={`${attendanceStats.present} jours`} icon={<CheckCircle2 className="w-5 h-5" />} iconClassName="bg-flora-success/20 text-flora-success" />
              <StatCard title="Absences" value={`${attendanceStats.absent} jours`} icon={<XCircle className="w-5 h-5" />} iconClassName="bg-destructive/20 text-destructive" />
              <StatCard title="Retards" value={`${attendanceStats.late} fois`} icon={<Clock className="w-5 h-5" />} iconClassName="bg-amber-500/20 text-amber-600" />
            </div>

            <Tabs defaultValue="grades" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="grades">Notes</TabsTrigger>
                <TabsTrigger value="attendance">Présences</TabsTrigger>
                <TabsTrigger value="announcements">Annonces</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="grades">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5" />Dernières notes de {selectedChildData.first_name}</CardTitle></CardHeader>
                  <CardContent>
                    {grades.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucune note disponible</p> : (
                      <div className="space-y-3">
                        {grades.map((grade: any) => (
                          <div key={grade.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div><p className="font-medium">{grade.subject_name}</p><p className="text-sm text-muted-foreground">{new Date(grade.graded_at).toLocaleDateString('fr-FR')}</p></div>
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${grade.score / grade.max_score >= 0.5 ? 'text-flora-success' : 'text-destructive'}`}>{grade.score}/{grade.max_score}</span>
                              {grade.score / grade.max_score >= 0.5 ? <TrendingUp className="w-4 h-4 text-flora-success" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attendance">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="w-5 h-5" />Historique des présences</CardTitle></CardHeader>
                  <CardContent>
                    {attendance.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucune donnée de présence disponible</p> : (
                      <div className="space-y-2">
                        {attendance.map((record: any) => (
                          <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {record.status === 'present' && <CheckCircle2 className="w-5 h-5 text-flora-success" />}
                              {record.status === 'absent' && <XCircle className="w-5 h-5 text-destructive" />}
                              {record.status === 'late' && <Clock className="w-5 h-5 text-amber-600" />}
                              <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <Badge variant={record.status === 'present' ? 'default' : record.status === 'absent' ? 'destructive' : 'secondary'}>
                              {record.status === 'present' ? 'Présent' : record.status === 'absent' ? 'Absent' : 'En retard'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="announcements">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" />Annonces de l'établissement</CardTitle></CardHeader>
                  <CardContent>
                    {announcements.length === 0 ? <p className="text-muted-foreground text-center py-8">Aucune annonce disponible</p> : (
                      <div className="space-y-4">
                        {announcements.map((a: any) => (
                          <div key={a.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold">{a.title}</h4>
                              {a.is_urgent && <Badge variant="destructive">Urgent</Badge>}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{a.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">{new Date(a.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5" />Contacter l'établissement</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea placeholder="Écrivez votre message..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} />
                    <Button onClick={handleSendMessage} disabled={!message.trim() || sendingMessage} className="w-full">
                      {sendingMessage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      Envoyer le message
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {children.length === 0 && (
          <Card><CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">Aucun enfant associé</h3>
            <p className="text-muted-foreground">Contactez l'administration pour associer vos enfants à votre compte.</p>
          </CardContent></Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
