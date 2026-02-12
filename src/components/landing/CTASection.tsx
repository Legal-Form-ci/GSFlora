import { ArrowRight, Building2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const benefits = [
  "Aucune installation requise",
  "Données 100% sécurisées",
  "URL personnalisée pour votre école",
  "Support multi-rôles complet",
  "Mises à jour automatiques",
  "Essai gratuit",
];

const CTASection = () => {
  return (
    <section id="pricing" className="py-20 bg-gradient-hero relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            Prêt à digitaliser
            <span className="text-accent"> votre établissement ?</span>
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Rejoignez SchoolHub Pro et offrez à votre école une plateforme complète, 
            moderne et adaptée à tous les acteurs.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10 max-w-lg mx-auto">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2 text-white/80 text-sm">
                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="xl" className="group" asChild>
              <Link to="/auth?mode=signup">
                <Building2 className="w-5 h-5" />
                Créer mon établissement
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/auth?mode=login">
                Se connecter
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
