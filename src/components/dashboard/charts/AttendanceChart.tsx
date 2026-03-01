import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const AttendanceChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: attendance } = await supabase
      .from('attendance')
      .select('date, status')
      .gte('date', thirtyDaysAgo);

    if (!attendance?.length) return;

    const byDate: Record<string, { present: number; absent: number; late: number }> = {};
    attendance.forEach((a) => {
      if (!byDate[a.date]) byDate[a.date] = { present: 0, absent: 0, late: 0 };
      if (a.status === 'present') byDate[a.date].present++;
      else if (a.status === 'absent') byDate[a.date].absent++;
      else byDate[a.date].late++;
    });

    const chartData = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, counts]) => ({
        date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
        Présents: counts.present,
        Absents: counts.absent,
        Retards: counts.late,
      }));

    setData(chartData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="w-5 h-5" />
          Présences (14 derniers jours)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="Présents" fill="hsl(145 65% 40%)" stackId="a" />
                <Bar dataKey="Retards" fill="hsl(45 90% 55%)" stackId="a" />
                <Bar dataKey="Absents" fill="hsl(0 75% 55%)" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucune donnée de présence</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;
