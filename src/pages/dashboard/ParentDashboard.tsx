import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatCard from '@/components/dashboard/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Home,
  Users,
  GraduationCap,
  Calendar,
  Bell,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { label: 'Tableau de bord', href: '/parent', icon: <Home className="w-5 h-5" /> },
  { label: 'Mes enfants', href: '/parent/children', icon: <Users className="w-5 h-5" /> },
  { label: 'Notes', href: '/parent/grades', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Présences', href: '/parent/attendance', icon: <Calendar className="w-5 h-5" /> },
  { label: 'Messages', href: '/parent/messages', icon: <MessageSquare className="w-5 h-5" /> },
  { label: 'Annonces', href: '/parent/announcements', icon: <Bell className="w-5 h-5" /> },
];

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  class_name?: string;
}

interface Grade {
  id: string;
  score: number;
  max_score: number;
  subject_name: string;
  graded_at: string;
}

interface Attendance {
  id: string;
  date: string;
  status: string;
  notes?: string;
}

const ParentDashboard = () => {
  const { user, profile } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (user) {
      fetchChildren();
      fetchAnnouncements();
    }
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const { data: relationships, error } = await supabase
        .from('student_parent_relationships')
        .select(`
          student_id,
          relationship
        `)
        .eq('parent_id', user?.id);

      if (error) throw error;

      if (relationships && relationships.length > 0) {
        const studentIds = relationships.map(r => r.student_id);
        
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', studentIds);

        if (profileError) throw profileError;

        const childrenData: Child[] = profiles?.map(p => ({
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
        })) || [];

        setChildren(childrenData);
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildData = async (childId: string) => {
    try {
      // Fetch grades
      const { data: gradesData } = await supabase
        .from('grades')
        .select(`
          id,
          score,
          max_score,
          graded_at,
          courses(subjects(name))
        `)
        .eq('student_id', childId)
        .order('graded_at', { ascending: false })
        .limit(10);

      if (gradesData) {
        setGrades(gradesData.map((g: any) => ({
          id: g.id,
          score: g.score,
          max_score: g.max_score,
          subject_name: g.courses?.subjects?.name || 'N/A',
          graded_at: g.graded_at,
        })));
      }

      // Fetch attendance
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('id, date, status, notes')
        .eq('student_id', childId)
        .order('date', { ascending: false })
        .limit(30);

      if (attendanceData) {
        setAttendance(attendanceData);
      }
    } catch (error) {
      console.error('Error fetching child data:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    setSendingMessage(true);
    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Message envoyé à l\'établissement');
    setMessage('');
    setSendingMessage(false);
  };

  const calculateAverageGrade = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, g) => sum + (g.score / g.max_score) * 20, 0);
    return (total / grades.length).toFixed(2);
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
      <DashboardLayout navItems={navItems} title="Tableau de bord Parent">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Tableau de bord Parent">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
          <h2 className="text-2xl font-bold">
            Bienvenue, {profile?.first_name} {profile?.last_name}
          </h2>
          <p className="text-muted-foreground mt-1">
            Suivez la scolarité de vos enfants
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {children.map(child => (
              <Button
                key={child.id}
                variant={selectedChild === child.id ? 'default' : 'outline'}
                onClick={() => setSelectedChild(child.id)}
              >
                {child.first_name} {child.last_name}
              </Button>
            ))}
          </div>
        )}

        {selectedChildData && (
          <>
            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <StatCard
                title="Moyenne générale"
                value={`${calculateAverageGrade()}/20`}
                icon={<GraduationCap className="w-5 h-5" />}
                trend={Number(calculateAverageGrade()) >= 10 ? 
                  { value: 5, isPositive: true } : 
                  { value: -5, isPositive: false }}
              />
              <StatCard
                title="Présences"
                value={`${attendanceStats.present} jours`}
                icon={<CheckCircle2 className="w-5 h-5" />}
                iconClassName="bg-flora-success/20 text-flora-success"
              />
              <StatCard
                title="Absences"
                value={`${attendanceStats.absent} jours`}
                icon={<XCircle className="w-5 h-5" />}
                iconClassName="bg-destructive/20 text-destructive"
                trend={attendanceStats.absent > 5 ? 
                  { value: attendanceStats.absent, isPositive: false } : undefined}
              />
              <StatCard
                title="Retards"
                value={`${attendanceStats.late} fois`}
                icon={<Clock className="w-5 h-5" />}
                iconClassName="bg-amber-500/20 text-amber-600"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="grades" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="grades">Notes</TabsTrigger>
                <TabsTrigger value="attendance">Présences</TabsTrigger>
                <TabsTrigger value="announcements">Annonces</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              <TabsContent value="grades">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Dernières notes de {selectedChildData.first_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {grades.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Aucune note disponible
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {grades.map(grade => (
                          <div key={grade.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium">{grade.subject_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(grade.graded_at).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${
                                grade.score / grade.max_score >= 0.5 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {grade.score}/{grade.max_score}
                              </span>
                              {grade.score / grade.max_score >= 0.5 ? (
                                <TrendingUp className="w-4 h-4 text-green-600" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-600" />
                              )}
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
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Historique des présences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attendance.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Aucune donnée de présence disponible
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {attendance.map(record => (
                          <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {record.status === 'present' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                              {record.status === 'absent' && <XCircle className="w-5 h-5 text-red-600" />}
                              {record.status === 'late' && <Clock className="w-5 h-5 text-yellow-600" />}
                              <span>{new Date(record.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <Badge variant={
                              record.status === 'present' ? 'default' :
                              record.status === 'absent' ? 'destructive' : 'secondary'
                            }>
                              {record.status === 'present' ? 'Présent' :
                               record.status === 'absent' ? 'Absent' : 'En retard'}
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
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Annonces de l'établissement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {announcements.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Aucune annonce disponible
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {announcements.map(announcement => (
                          <div key={announcement.id} className="p-4 border rounded-lg">
                            <div className="flex items-start justify-between">
                              <h4 className="font-semibold">{announcement.title}</h4>
                              {announcement.is_urgent && (
                                <Badge variant="destructive">Urgent</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                              {announcement.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(announcement.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Contacter l'établissement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Écrivez votre message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!message.trim() || sendingMessage}
                      className="w-full"
                    >
                      {sendingMessage ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Envoyer le message
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {children.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Aucun enfant associé</h3>
              <p className="text-muted-foreground">
                Contactez l'administration pour associer vos enfants à votre compte.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
