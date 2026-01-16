import { GraduationCap, BookOpen, Users, Shield, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const roles = [
  {
    icon: GraduationCap,
    title: "Élèves",
    description: "Accédez à vos cours, soumettez vos devoirs, passez des quiz et consultez vos notes.",
    features: ["Cours en ligne", "Devoirs numériques", "Quiz interactifs", "Notes et moyennes"],
    color: "bg-flora-blue",
    gradient: "from-flora-blue to-flora-blue-light",
  },
  {
    icon: BookOpen,
    title: "Enseignants",
    description: "Gérez vos classes, créez du contenu pédagogique et suivez la progression des élèves.",
    features: ["Création de cours", "Gestion des devoirs", "Quiz personnalisés", "Saisie des notes"],
    color: "bg-flora-coral",
    gradient: "from-flora-coral to-flora-coral-dark",
  },
  {
    icon: Users,
    title: "Parents",
    description: "Suivez la scolarité de vos enfants et communiquez avec l'équipe pédagogique.",
    features: ["Suivi des notes", "Absences & retards", "Bulletins scolaires", "Messagerie"],
    color: "bg-flora-gold",
    gradient: "from-flora-gold to-flora-gold-light",
  },
  {
    icon: Shield,
    title: "Administration",
    description: "Gérez l'ensemble de l'établissement avec des outils puissants et intuitifs.",
    features: ["Gestion des utilisateurs", "Emplois du temps", "Comptabilité", "Statistiques"],
    color: "bg-flora-success",
    gradient: "from-flora-success to-emerald-400",
  },
];

const UserRolesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block bg-flora-coral/20 text-flora-coral-dark font-medium px-4 py-2 rounded-full text-sm mb-4">
            Pour tous
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Un espace dédié pour
            <span className="text-flora-coral"> chaque utilisateur</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Que vous soyez élève, enseignant, parent ou administrateur, GS Flora Digital s'adapte à vos besoins.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className="group relative bg-card rounded-3xl overflow-hidden shadow-flora hover:shadow-flora-lg transition-all duration-500"
            >
              {/* Gradient header */}
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

              {/* Features list */}
              <div className="p-6">
                <ul className="space-y-3">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${role.color}`} />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full mt-6 border-2 hover:bg-muted"
                >
                  Se connecter en tant que {role.title.toLowerCase().slice(0, -1)}
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
