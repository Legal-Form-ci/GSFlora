import { ArrowRight, Building2, GraduationCap, Heart, BookOpen, Briefcase, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const roles = [
  {
    icon: Building2,
    role: "Administration",
    title: "Pilotez sans effort",
    desc: "Inscriptions, paiements, scolarité, finances et reporting consolidés.",
    cta: "Démarrer mon établissement",
    href: "/auth?mode=signup",
    accent: "from-primary to-primary-glow",
  },
  {
    icon: BookOpen,
    role: "Enseignants",
    title: "Plus de pédagogie, moins de papier",
    desc: "Cours IA, devoirs, quiz, notes et bulletins en quelques clics.",
    cta: "Découvrir l'espace prof",
    href: "/auth?mode=login",
    accent: "from-secondary to-secondary/70",
  },
  {
    icon: GraduationCap,
    role: "Élèves",
    title: "Apprendre en confiance",
    desc: "Emploi du temps, cours, devoirs et notes — toujours à portée.",
    cta: "Accéder à mon espace",
    href: "/auth?mode=login",
    accent: "from-accent to-yellow-500",
  },
  {
    icon: Heart,
    role: "Parents",
    title: "Suivre, échanger, comprendre",
    desc: "Présences, bulletins, communications et paiements Mobile Money.",
    cta: "Suivre mon enfant",
    href: "/auth?mode=login",
    accent: "from-rose-500 to-rose-400",
  },
];

const benefits = [
  "Aucune installation",
  "Données sécurisées RGPD",
  "URL par établissement",
  "Multi-rôles complet",
  "Mobile Money intégré",
  "Mises à jour incluses",
];

const CTASection = () => {
  return (
    <section id="cta" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium mb-5 backdrop-blur-sm border border-white/15 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" /> Une plateforme, tous les rôles
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-5 tracking-tight">
            Prêt à digitaliser
            <span className="block text-accent">votre établissement&nbsp;?</span>
          </h2>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Choisissez votre profil et démarrez en quelques minutes. SchoolHub Pro
            s'adapte à toutes les équipes — du fondateur au parent d'élève.
          </p>
        </div>

        {/* Role-based CTA grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12 max-w-6xl mx-auto">
          {roles.map((r, i) => (
            <div
              key={r.role}
              className="group relative rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${r.accent} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${r.accent} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <r.icon className="w-6 h-6 text-white" />
              </div>
              <div className="relative">
                <p className="text-xs uppercase tracking-widest text-white/60 mb-1">{r.role}</p>
                <h3 className="text-lg font-display font-bold text-white mb-2 leading-snug">{r.title}</h3>
                <p className="text-sm text-white/70 mb-5 leading-relaxed">{r.desc}</p>
                <Link
                  to={r.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:gap-2.5 transition-all"
                >
                  {r.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-3xl mx-auto">
          {benefits.map((b, i) => (
            <div
              key={b}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/85 text-sm animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
              {b}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="xl" className="group" asChild>
            <Link to="/auth?mode=signup">
              <Briefcase className="w-5 h-5" />
              Créer mon établissement gratuitement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button variant="hero-outline" size="xl" asChild>
            <Link to="/auth?mode=login">Se connecter</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
