import { GraduationCap, BookOpen, Users, Shield, Building2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: Building2, title: "Fondateur & Direction",
    description: "Supervisez l'ensemble de votre établissement avec des KPIs et rapports financiers.",
    features: ["Vue d'ensemble financière", "Gestion du personnel", "Statistiques globales", "Paramétrage école"],
    color: "bg-primary", gradient: "from-primary to-primary/70",
  },
  {
    icon: BookOpen, title: "Enseignants",
    description: "Créez des cours, gérez les devoirs, notez et suivez la progression des élèves.",
    features: ["Création de cours", "Devoirs & Quiz", "Saisie des notes", "Bulletins scolaires"],
    color: "bg-secondary", gradient: "from-secondary to-secondary/70",
  },
  {
    icon: GraduationCap, title: "Élèves",
    description: "Accédez à vos cours, devoirs, quiz et consultez vos résultats en temps réel.",
    features: ["Cours en ligne", "Devoirs numériques", "Quiz interactifs", "Notes & moyennes"],
    color: "bg-accent", gradient: "from-accent to-accent/70",
  },
  {
    icon: Users, title: "Parents",
    description: "Suivez la scolarité de vos enfants et communiquez avec l'équipe pédagogique.",
    features: ["Suivi des notes", "Absences & retards", "Bulletins", "Messagerie directe"],
    color: "bg-flora-success", gradient: "from-flora-success to-emerald-400",
  },
];

const UserRolesSection = () => {
  return (
    <section id="roles" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block bg-secondary/20 text-foreground font-medium px-4 py-2 rounded-full text-sm mb-4">
            Pour tous les acteurs
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Un espace dédié pour
            <span className="text-secondary"> chaque rôle</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            14+ rôles configurables pour s'adapter à l'organigramme de chaque établissement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role) => (
            <div key={role.title} className="group relative bg-card rounded-3xl overflow-hidden shadow-flora hover:shadow-flora-lg transition-all duration-500">
              <div className={`bg-gradient-to-r ${role.gradient} p-6 text-white`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <role.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold">{role.title}</h3>
                    <p className="text-white/80 text-sm">{role.description}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${role.color}`} />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full mt-6 border-2 hover:bg-muted" asChild>
                  <Link to="/auth?mode=signup">Commencer gratuitement</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UserRolesSection;
