import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';

const GradesChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: grades } = await supabase
      .from('grades')
      .select('score, max_score, created_at')
      .order('created_at', { ascending: true });

    if (!grades?.length) return;

    // Group by month
    const byMonth: Record<string, { total: number; count: number }> = {};
    grades.forEach((g) => {
      const month = g.created_at.substring(0, 7);
      if (!byMonth[month]) byMonth[month] = { total: 0, count: 0 };
      byMonth[month].total += (g.score / (g.max_score || 20)) * 20;
      byMonth[month].count++;
    });

    const chartData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, { total, count }]) => ({
        mois: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        Moyenne: Number((total / count).toFixed(1)),
      }));

    setData(chartData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-5 h-5" />
          Évolution des moyennes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" fontSize={11} />
                <YAxis domain={[0, 20]} fontSize={11} />
                <Tooltip />
                <ReferenceLine y={10} stroke="hsl(0 75% 55%)" strokeDasharray="3 3" label="Moy. min" />
                <Line type="monotone" dataKey="Moyenne" stroke="hsl(215 70% 25%)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucune donnée de notes</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GradesChart;
