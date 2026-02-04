import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  HelpCircle,
  Book,
  ChevronRight,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  X,
  GraduationCap,
  Users,
  Calendar,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  FileText,
  Settings,
  Shield,
  MessageSquare,
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  steps: string[];
  tips?: string[];
}

interface UserGuideProps {
  role: 'super_admin' | 'admin' | 'director' | 'founder' | 'censor' | 'educator' | 'teacher' | 'principal_teacher' | 'student' | 'parent';
  onClose?: () => void;
}

const roleGuides: Record<string, GuideSection[]> = {
  super_admin: [
    {
      id: 'users',
      title: 'Gestion des utilisateurs',
      icon: <Users className="w-5 h-5" />,
      description: 'Créer et gérer tous les comptes utilisateurs',
      steps: [
        'Accédez à "Utilisateurs" dans le menu',
        'Cliquez sur "Nouvel utilisateur" pour ajouter un membre',
        'Remplissez les informations (nom, prénom, email, rôle)',
        'Pour les enseignants, assignez les matières enseignées',
        'Le mot de passe par défaut est "GSFlora"',
        'Informez l\'utilisateur de changer son mot de passe à la première connexion',
      ],
      tips: [
        'Les rôles définissent les accès dans le système',
        'Un enseignant peut avoir plusieurs matières',
        'Vérifiez les emails avant la création',
      ],
    },
    {
      id: 'classes',
      title: 'Gestion des classes',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Créer et organiser les classes par niveau',
      steps: [
        'Allez dans "Classes" depuis le tableau de bord',
        'Créez une nouvelle classe avec son niveau (6ème, 5ème, etc.)',
        'Assignez les élèves à chaque classe',
        'Définissez le cycle (collège ou lycée)',
      ],
      tips: [
        'Nommez les classes clairement (ex: 6ème A, 2nd D)',
        'Respectez l\'organigramme ivoirien',
      ],
    },
    {
      id: 'subjects',
      title: 'Gestion des matières',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Configurer les matières et leurs coefficients',
      steps: [
        'Accédez à "Matières"',
        'Ajoutez chaque matière avec son code et coefficient',
        'Les coefficients sont utilisés pour calculer les moyennes',
      ],
    },
    {
      id: 'schedules',
      title: 'Génération d\'emplois du temps',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Créer les emplois du temps automatiquement',
      steps: [
        'Allez dans "Emplois du temps"',
        'Le système détecte automatiquement les matières et enseignants',
        'Configurez les horaires (7h-18h en semaine, 7h-12h mercredi)',
        'Entrez le nombre de salles disponibles',
        'Cliquez sur "Générer l\'emploi du temps"',
        'Partagez avec tous les utilisateurs',
      ],
      tips: [
        'Nommez vos salles Salle 1, Salle 2, etc.',
        'Vérifiez les conflits après génération',
      ],
    },
    {
      id: 'cards',
      title: 'Cartes d\'élèves',
      icon: <FileText className="w-5 h-5" />,
      description: 'Imprimer les cartes avec QR code',
      steps: [
        'Accédez à "Cartes élèves"',
        'Sélectionnez une classe ou tous les élèves',
        'Cochez les élèves à imprimer',
        'Cliquez sur "Imprimer"',
        'Imprimez sur papier cartonné 250g/m²',
      ],
    },
  ],
  admin: [
    {
      id: 'users',
      title: 'Gestion des utilisateurs',
      icon: <Users className="w-5 h-5" />,
      description: 'Créer et gérer les comptes',
      steps: [
        'Accédez à "Utilisateurs" dans le menu',
        'Créez les comptes avec le mot de passe par défaut "GSFlora"',
        'Assignez les rôles appropriés',
        'Gérez les classes et les élèves',
      ],
    },
    {
      id: 'announcements',
      title: 'Annonces',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Publier des annonces pour la communauté',
      steps: [
        'Allez dans "Annonces"',
        'Créez une nouvelle annonce',
        'Choisissez la cible (tous, classe spécifique)',
        'Marquez comme urgent si nécessaire',
      ],
    },
  ],
  director: [
    {
      id: 'overview',
      title: 'Vue d\'ensemble',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Surveiller les indicateurs clés',
      steps: [
        'Consultez le tableau de bord pour les statistiques',
        'Suivez le taux de présence et les moyennes',
        'Analysez les tendances mensuelles',
      ],
    },
    {
      id: 'schedules',
      title: 'Emplois du temps',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Générer et gérer les plannings',
      steps: [
        'Accédez à "Emplois du temps"',
        'Vérifiez les configurations automatiques',
        'Ajustez les horaires si nécessaire',
        'Publiez pour tous les utilisateurs',
      ],
    },
    {
      id: 'staff',
      title: 'Gestion du personnel',
      icon: <Users className="w-5 h-5" />,
      description: 'Superviser les enseignants et éducateurs',
      steps: [
        'Consultez la liste du personnel',
        'Vérifiez les affectations de matières',
        'Suivez les statistiques de présence',
      ],
    },
  ],
  founder: [
    {
      id: 'strategy',
      title: 'Vue stratégique',
      icon: <Shield className="w-5 h-5" />,
      description: 'Piloter l\'établissement',
      steps: [
        'Consultez les indicateurs globaux',
        'Analysez la croissance des effectifs',
        'Suivez les performances académiques',
        'Prenez des décisions stratégiques',
      ],
    },
    {
      id: 'reports',
      title: 'Rapports',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Générer des rapports complets',
      steps: [
        'Accédez à "Statistiques"',
        'Sélectionnez la période',
        'Exportez les rapports en PDF',
      ],
    },
  ],
  educator: [
    {
      id: 'attendance',
      title: 'Gestion des présences',
      icon: <ClipboardCheck className="w-5 h-5" />,
      description: 'Faire l\'appel quotidien',
      steps: [
        'Sélectionnez votre classe',
        'Choisissez la date (aujourd\'hui par défaut)',
        'Marquez chaque élève: Présent, Absent, Retard, Excusé',
        'Utilisez "Scanner QR" pour un appel rapide',
        'Enregistrez les présences',
      ],
      tips: [
        'L\'heure d\'arrivée est enregistrée automatiquement pour les retards',
        'Les parents sont notifiés des absences',
      ],
    },
    {
      id: 'students',
      title: 'Suivi des élèves',
      icon: <Users className="w-5 h-5" />,
      description: 'Consulter les informations des élèves',
      steps: [
        'Accédez à "Élèves"',
        'Consultez les fiches individuelles',
        'Suivez l\'historique des présences',
      ],
    },
  ],
  censor: [
    {
      id: 'discipline',
      title: 'Discipline',
      icon: <Shield className="w-5 h-5" />,
      description: 'Gérer la discipline scolaire',
      steps: [
        'Surveillez les absences répétées',
        'Contactez les parents si nécessaire',
        'Appliquez les mesures disciplinaires',
      ],
    },
    {
      id: 'supervision',
      title: 'Supervision',
      icon: <Users className="w-5 h-5" />,
      description: 'Coordonner les éducateurs',
      steps: [
        'Vérifiez les rapports de présence',
        'Coordonnez avec les éducateurs',
        'Transmettez les informations au directeur',
      ],
    },
  ],
  teacher: [
    {
      id: 'courses',
      title: 'Gestion des cours',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Créer et gérer vos cours',
      steps: [
        'Accédez à "Mes cours"',
        'Créez un nouveau cours avec le titre et le contenu',
        'Sélectionnez la classe et la matière',
        'Publiez quand le cours est prêt',
        'Utilisez l\'IA pour générer du contenu',
      ],
      tips: [
        'Structurez vos cours par chapitres',
        'Exportez en PDF ou Word pour l\'impression',
      ],
    },
    {
      id: 'assignments',
      title: 'Devoirs',
      icon: <FileText className="w-5 h-5" />,
      description: 'Créer et corriger les devoirs',
      steps: [
        'Allez dans "Devoirs"',
        'Créez un nouveau devoir avec la date limite',
        'Les élèves soumettent leurs travaux',
        'Corrigez et notez les soumissions',
      ],
    },
    {
      id: 'quizzes',
      title: 'Quiz',
      icon: <ClipboardCheck className="w-5 h-5" />,
      description: 'Créer des évaluations interactives',
      steps: [
        'Accédez à "Quiz"',
        'Créez un quiz avec les paramètres',
        'Ajoutez des questions (QCM, vrai/faux, etc.)',
        'Publiez pour les élèves',
        'Consultez les résultats automatiques',
      ],
    },
    {
      id: 'grades',
      title: 'Notes',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Saisir et gérer les notes',
      steps: [
        'Allez dans "Notes"',
        'Sélectionnez la classe et la matière',
        'Entrez les notes des élèves',
        'Ajoutez des commentaires si nécessaire',
      ],
    },
    {
      id: 'report-cards',
      title: 'Bulletins',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Générer les bulletins scolaires',
      steps: [
        'Accédez à "Bulletins"',
        'Sélectionnez la classe et le trimestre',
        'Vérifiez les moyennes calculées',
        'Générez les PDF',
      ],
    },
  ],
  principal_teacher: [
    {
      id: 'class-management',
      title: 'Gestion de classe',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Superviser votre classe principale',
      steps: [
        'Consultez le tableau de bord de votre classe',
        'Suivez les moyennes et présences',
        'Coordonnez avec les autres enseignants',
        'Préparez les conseils de classe',
      ],
    },
    {
      id: 'parent-contact',
      title: 'Contact parents',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Communiquer avec les parents',
      steps: [
        'Accédez à "Messages"',
        'Contactez les parents d\'élèves',
        'Partagez les informations importantes',
      ],
    },
  ],
  student: [
    {
      id: 'courses',
      title: 'Mes cours',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Accéder à vos cours',
      steps: [
        'Consultez la liste de vos cours',
        'Lisez le contenu de chaque cours',
        'Téléchargez les supports si disponibles',
      ],
    },
    {
      id: 'assignments',
      title: 'Devoirs',
      icon: <FileText className="w-5 h-5" />,
      description: 'Voir et soumettre vos devoirs',
      steps: [
        'Accédez à "Devoirs"',
        'Consultez les devoirs à rendre',
        'Soumettez votre travail avant la date limite',
        'Consultez les corrections et notes',
      ],
    },
    {
      id: 'quizzes',
      title: 'Quiz',
      icon: <ClipboardCheck className="w-5 h-5" />,
      description: 'Passer les quiz',
      steps: [
        'Allez dans "Quiz"',
        'Sélectionnez un quiz disponible',
        'Répondez aux questions',
        'Consultez votre score',
      ],
    },
    {
      id: 'grades',
      title: 'Mes notes',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Consulter vos résultats',
      steps: [
        'Accédez à "Mes notes"',
        'Visualisez vos notes par matière',
        'Suivez votre moyenne générale',
      ],
    },
    {
      id: 'schedule',
      title: 'Emploi du temps',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Consulter votre planning',
      steps: [
        'Allez dans "Emploi du temps"',
        'Visualisez votre semaine',
        'Notez les salles de cours',
      ],
    },
  ],
  parent: [
    {
      id: 'children',
      title: 'Suivi des enfants',
      icon: <Users className="w-5 h-5" />,
      description: 'Suivre la scolarité de vos enfants',
      steps: [
        'Sélectionnez l\'enfant à consulter',
        'Visualisez ses notes et moyennes',
        'Consultez son historique de présence',
      ],
    },
    {
      id: 'grades',
      title: 'Notes et bulletins',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Consulter les résultats scolaires',
      steps: [
        'Accédez à l\'onglet "Notes"',
        'Visualisez les notes récentes',
        'Téléchargez les bulletins',
      ],
    },
    {
      id: 'attendance',
      title: 'Présences',
      icon: <ClipboardCheck className="w-5 h-5" />,
      description: 'Suivre les présences',
      steps: [
        'Consultez l\'onglet "Présences"',
        'Vérifiez les absences et retards',
        'Contactez l\'établissement si nécessaire',
      ],
    },
    {
      id: 'contact',
      title: 'Communication',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Contacter l\'établissement',
      steps: [
        'Accédez à l\'onglet "Contact"',
        'Écrivez votre message',
        'Envoyez à l\'établissement',
      ],
    },
  ],
};

const roleLabels: Record<string, string> = {
  super_admin: 'Super Administrateur',
  admin: 'Administrateur',
  director: 'Directeur',
  founder: 'Fondateur',
  censor: 'Censeur',
  educator: 'Éducateur',
  teacher: 'Enseignant',
  principal_teacher: 'Professeur Principal',
  student: 'Élève',
  parent: 'Parent',
};

export const UserGuide = ({ role, onClose }: UserGuideProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const guides = roleGuides[role] || roleGuides.student;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Book className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Guide d'utilisation
                <Badge variant="secondary">{roleLabels[role]}</Badge>
              </CardTitle>
              <CardDescription>
                Tout ce que vous devez savoir pour utiliser GS Flora Digital
              </CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Accordion type="single" collapsible value={expanded || ''} onValueChange={(v) => setExpanded(v || null)}>
          {guides.map((guide) => (
            <AccordionItem key={guide.id} value={guide.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2 rounded-lg bg-muted">
                    {guide.icon}
                  </div>
                  <div>
                    <p className="font-medium">{guide.title}</p>
                    <p className="text-sm text-muted-foreground">{guide.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-12 space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      Étapes à suivre
                    </p>
                    <ol className="space-y-1 text-sm text-muted-foreground ml-6">
                      {guide.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="font-medium text-primary">{index + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                  {guide.tips && guide.tips.length > 0 && (
                    <div className="space-y-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-medium flex items-center gap-2 text-amber-700">
                        <Lightbulb className="w-4 h-4" />
                        Conseils
                      </p>
                      <ul className="space-y-1 text-sm text-amber-700 ml-6">
                        {guide.tips.map((tip, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Besoin d'aide ?</p>
              <p className="text-muted-foreground">
                Si vous rencontrez des difficultés, contactez l'administration de l'établissement 
                ou consultez la documentation complète dans les paramètres.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserGuide;
