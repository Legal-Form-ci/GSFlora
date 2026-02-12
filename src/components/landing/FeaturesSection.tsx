import { 
  BookOpen, FileText, ClipboardCheck, BarChart3, 
  Calendar, MessageSquare, Users, Award, Building2, 
  Shield, Globe, Wallet 
} from "lucide-react";

const features = [
  { icon: Building2, title: "Multi-établissement", description: "Chaque école dispose de son espace isolé avec URL personnalisée.", color: "bg-primary" },
  { icon: Shield, title: "14+ rôles", description: "Fondateur, directeur, censeur, éducateur, enseignant, élève, parent et plus.", color: "bg-secondary" },
  { icon: BookOpen, title: "Cours en ligne", description: "Créez et partagez des cours enrichis avec contenus multimédias.", color: "bg-primary" },
  { icon: FileText, title: "Devoirs & Quiz", description: "Devoirs numériques et quiz auto-corrigés avec suivi détaillé.", color: "bg-accent" },
  { icon: BarChart3, title: "Notes & Bulletins", description: "Saisie des notes, moyennes automatiques et bulletins PDF.", color: "bg-flora-success" },
  { icon: Calendar, title: "Emplois du temps", description: "Génération automatique d'emplois du temps optimisés.", color: "bg-primary" },
  { icon: ClipboardCheck, title: "Gestion présences", description: "Suivi des absences et retards en temps réel.", color: "bg-secondary" },
  { icon: MessageSquare, title: "Messagerie", description: "Communication intégrée entre tous les acteurs.", color: "bg-primary" },
  { icon: Wallet, title: "Comptabilité", description: "Frais de scolarité, paiements et dépenses de l'école.", color: "bg-accent" },
  { icon: Globe, title: "URL personnalisée", description: "Chaque établissement possède son propre lien d'accès.", color: "bg-primary" },
  { icon: Users, title: "Espace parents", description: "Suivi de la scolarité des enfants et communication.", color: "bg-secondary" },
  { icon: Award, title: "Temps réel", description: "Toutes les données synchronisées instantanément.", color: "bg-accent" },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <span className="inline-block bg-accent/20 text-foreground font-medium px-4 py-2 rounded-full text-sm mb-4">
            Fonctionnalités
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Tout ce dont votre établissement
            <span className="text-primary"> a besoin</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            SchoolHub Pro offre une suite complète d'outils pour digitaliser et optimiser la gestion de tout établissement scolaire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-6 shadow-flora hover:shadow-flora-md transition-all duration-300 hover:-translate-y-1 border border-border/50"
            >
              <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
