import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home, Building2, Users, Search, MoreHorizontal, CheckCircle, XCircle,
  Loader2, Shield, Globe, Crown,
} from 'lucide-react';
import { toast } from 'sonner';

const navItems = [
  { label: 'Plateforme', href: '/platform-admin', icon: <Shield className="w-5 h-5" /> },
  { label: 'Établissements', href: '/platform-admin/schools', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Tableau de bord', href: '/admin', icon: <Home className="w-5 h-5" /> },
];

interface SchoolRow {
  id: string; name: string; slug: string; email: string | null; phone: string | null;
  is_active: boolean; is_verified: boolean; subscription_plan: string | null;
  max_students: number | null; max_teachers: number | null; created_at: string;
  address: string | null; member_count?: number;
}

const PlatformAdmin = () => {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });

  useEffect(() => { fetchSchools(); }, []);

  const fetchSchools = async () => {
    try {
      const { data, error } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
      if (error) throw error;

      const schoolsWithCounts = await Promise.all(
        (data || []).map(async (school) => {
          const { count } = await supabase.from('school_members').select('*', { count: 'exact', head: true }).eq('school_id', school.id).eq('is_active', true);
          return { ...school, member_count: count || 0 } as SchoolRow;
        })
      );

      setSchools(schoolsWithCounts);
      setStats({
        total: schoolsWithCounts.length,
        active: schoolsWithCounts.filter(s => s.is_active).length,
        pending: schoolsWithCounts.filter(s => !s.is_active || !s.is_verified).length,
      });
    } catch (error) { console.error(error); toast.error('Erreur de chargement'); } finally { setLoading(false); }
  };

  const toggleActive = async (school: SchoolRow) => {
    const newStatus = !school.is_active;
    const { error } = await supabase.from('schools').update({ is_active: newStatus, is_verified: newStatus }).eq('id', school.id);
    if (error) { toast.error('Erreur'); return; }
    toast.success(newStatus ? `${school.name} activé` : `${school.name} désactivé`);
    fetchSchools();
  };

  const updatePlan = async (schoolId: string, plan: string) => {
    const { error } = await supabase.from('schools').update({ subscription_plan: plan }).eq('id', schoolId);
    if (error) { toast.error('Erreur'); return; }
    toast.success('Plan mis à jour');
    fetchSchools();
  };

  const filtered = schools.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.slug.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) return <DashboardLayout navItems={navItems} title="Administration Plateforme"><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></DashboardLayout>;

  return (
    <DashboardLayout navItems={navItems} title="Administration Plateforme">
      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total établissements</p><p className="text-3xl font-bold">{stats.total}</p></div><Building2 className="w-10 h-10 text-primary opacity-50" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Actifs</p><p className="text-3xl font-bold text-emerald-600">{stats.active}</p></div><CheckCircle className="w-10 h-10 text-emerald-500 opacity-50" /></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">En attente</p><p className="text-3xl font-bold text-amber-600">{stats.pending}</p></div><XCircle className="w-10 h-10 text-amber-500 opacity-50" /></div></CardContent></Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher un établissement..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>

        {/* Table */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> Établissements ({filtered.length})</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Établissement</TableHead><TableHead>Slug</TableHead><TableHead>Plan</TableHead><TableHead>Membres</TableHead><TableHead>Statut</TableHead><TableHead>Créé le</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell><div><p className="font-medium">{school.name}</p><p className="text-sm text-muted-foreground">{school.email}</p></div></TableCell>
                    <TableCell><Badge variant="outline">{school.slug}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={school.subscription_plan === 'premium' ? 'default' : 'secondary'}>
                        {school.subscription_plan === 'premium' && <Crown className="w-3 h-3 mr-1" />}
                        {school.subscription_plan || 'free'}
                      </Badge>
                    </TableCell>
                    <TableCell><div className="flex items-center gap-1"><Users className="w-4 h-4 text-muted-foreground" /> {school.member_count}</div></TableCell>
                    <TableCell>
                      {school.is_active && school.is_verified ? (
                        <Badge className="bg-emerald-100 text-emerald-800">Actif</Badge>
                      ) : (
                        <Badge variant="destructive">Inactif</Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(school.created_at!).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toggleActive(school)}>
                            {school.is_active ? <><XCircle className="w-4 h-4 mr-2" /> Désactiver</> : <><CheckCircle className="w-4 h-4 mr-2" /> Activer</>}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updatePlan(school.id, 'free')}>Plan Free</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updatePlan(school.id, 'standard')}>Plan Standard</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updatePlan(school.id, 'premium')}>Plan Premium</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PlatformAdmin;
