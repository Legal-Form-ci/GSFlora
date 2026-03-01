import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const RevenueChart = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [paymentsRes, expensesRes] = await Promise.all([
      supabase.from('student_payments').select('amount, payment_date').order('payment_date'),
      supabase.from('school_expenses').select('amount, expense_date').order('expense_date'),
    ]);

    const byMonth: Record<string, { revenus: number; depenses: number }> = {};

    paymentsRes.data?.forEach((p) => {
      const month = p.payment_date.substring(0, 7);
      if (!byMonth[month]) byMonth[month] = { revenus: 0, depenses: 0 };
      byMonth[month].revenus += Number(p.amount);
    });

    expensesRes.data?.forEach((e) => {
      const month = e.expense_date.substring(0, 7);
      if (!byMonth[month]) byMonth[month] = { revenus: 0, depenses: 0 };
      byMonth[month].depenses += Number(e.amount);
    });

    const chartData = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, vals]) => ({
        mois: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short' }),
        Revenus: vals.revenus,
        Dépenses: vals.depenses,
        Net: vals.revenus - vals.depenses,
      }));

    setData(chartData);
  };

  const formatAmount = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { notation: 'compact' }).format(val) + ' F';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="w-5 h-5" />
          Revenus & Dépenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={formatAmount} />
                <Tooltip formatter={(val: number) => formatAmount(val)} />
                <Area type="monotone" dataKey="Revenus" fill="hsl(145 65% 40% / 0.2)" stroke="hsl(145 65% 40%)" strokeWidth={2} />
                <Area type="monotone" dataKey="Dépenses" fill="hsl(0 75% 55% / 0.2)" stroke="hsl(0 75% 55%)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-center py-8">Aucune donnée financière</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
