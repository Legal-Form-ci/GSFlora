import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['hsl(215,70%,25%)', 'hsl(145,65%,40%)', 'hsl(45,90%,55%)', 'hsl(5,65%,70%)', 'hsl(270,60%,60%)', 'hsl(195,70%,50%)', 'hsl(30,80%,55%)'];
const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Direction',
  admin: 'Admin',
  teacher: 'Enseignants',
  student: 'Élèves',
  parent: 'Parents',
  educator: 'Éducateurs',
  censor: 'Censeurs',
  founder: 'Fondateur',
  principal_teacher: 'Prof. Principal',
};

const RoleDistributionChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: roles } = await supabase.from('user_roles').select('role');
    if (!roles?.length) return;

    const counts: Record<string, number> = {};
    roles.forEach((r) => {
      counts[r.role] = (counts[r.role] || 0) + 1;
    });

    setData(
      Object.entries(counts).map(([role, value]) => ({
        name: ROLE_LABELS[role] || role,
        value,
      }))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-5 h-5" />
          Répartition des utilisateurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend fontSize={11} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucune donnée</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleDistributionChart;
