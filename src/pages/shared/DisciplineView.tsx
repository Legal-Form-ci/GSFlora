import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, FileText, Shield } from 'lucide-react';

interface Props {
  navItems: { label: string; href: string; icon: React.ReactNode }[];
  title?: string;
}

const DisciplineView = ({ navItems, title = 'Gestion de la Discipline' }: Props) => {
  return (
    <DashboardLayout navItems={navItems} title={title}>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Gestion de la Discipline</h2>
              <p className="text-muted-foreground">Suivi des incidents et mesures disciplinaires</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Incidents ce mois</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <FileText className="w-10 h-10 mx-auto text-primary mb-3" />
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Avertissements</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="w-10 h-10 mx-auto text-flora-success mb-3" />
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Conseils de discipline</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Incidents récents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">Aucun incident enregistré</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DisciplineView;
