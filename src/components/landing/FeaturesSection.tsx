import { 
  BookOpen, 
  FileText, 
  ClipboardCheck, 
  BarChart3, 
  Calendar, 
  MessageSquare, 
  Users, 
  Award 
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Cours en ligne",
    description: "Accédez aux cours enrichis avec vidéos, PDF et ressources téléchargeables.",
    color: "bg-flora-blue",
  },
  {
    icon: FileText,
    title: "Devoirs numériques",
    description: "Soumettez vos devoirs en ligne et recevez les corrections annotées.",
    color: "bg-flora-coral",
  },
  {
    icon: ClipboardCheck,
    title: "Quiz interactifs",
    description: "Testez vos connaissances avec des quiz auto-corrigés et détaillés.",
    color: "bg-flora-gold",
  },
  {
    icon: BarChart3,
    title: "Suivi des notes",
    description: "Consultez vos moyennes, progression et bulletins en temps réel.",
    color: "bg-flora-success",
  },
  {
    icon: Calendar,
    title: "Emploi du temps",
    description: "Visualisez votre planning hebdomadaire avec rappels automatiques.",
    color: "bg-flora-blue-light",
  },
  {
    icon: MessageSquare,
    title: "Communication",
    description: "Échangez facilement entre élèves, parents et enseignants.",
    color: "bg-flora-coral-dark",
  },
  {
    icon: Users,
    title: "Espace parents",
    description: "Suivez la scolarité de vos enfants et justifiez les absences.",
    color: "bg-primary",
  },
  {
    icon: Award,
    title: "Gamification",
    description: "Gagnez des badges et points pour votre assiduité et réussite.",
    color: "bg-flora-gold",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-slide-up">
          <span className="inline-block bg-flora-gold/20 text-flora-blue font-medium px-4 py-2 rounded-full text-sm mb-4">
            Fonctionnalités
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Une plateforme complète pour
            <span className="text-flora-blue"> votre réussite</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            GS Flora Digital vous offre tous les outils nécessaires pour un suivi scolaire moderne et efficace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group bg-card rounded-2xl p-6 shadow-flora hover:shadow-flora-md transition-all duration-300 hover:-translate-y-1 border border-border/50"
              style={{ animationDelay: `${index * 0.1}s` }}
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
