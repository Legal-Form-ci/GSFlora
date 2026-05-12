import {
  GraduationCap, Users, Wallet, Calendar, BookOpen, ClipboardCheck,
  MessageSquare, Bell, BarChart3, FileText, Award, Bus, UtensilsCrossed,
  Library, Stethoscope, Building2, ShieldCheck, Smartphone, Brain,
  Receipt, QrCode, Globe, Lock, Sparkles
} from "lucide-react";

const groups = [
  {
    title: "Pédagogie",
    accent: "from-primary to-flora-success",
    items: [
      { icon: BookOpen, title: "Cours en ligne", desc: "Éditeur riche TipTap, multimédia, génération IA." },
      { icon: FileText, title: "Devoirs & exercices", desc: "Création, dépôt, correction, échéances." },
      { icon: ClipboardCheck, title: "Quiz auto-corrigés", desc: "QCM, vrai/faux, libre, statistiques par question." },
      { icon: Brain, title: "IA pédagogique", desc: "Génération de cours, exercices et corrigés." },
      { icon: BarChart3, title: "Notes & moyennes", desc: "Coefficients, trimestres, moyennes pondérées." },
      { icon: Award, title: "Bulletins PDF", desc: "Bulletins paysage, classements, signatures." },
    ],
  },
  {
    title: "Vie scolaire",
    accent: "from-secondary to-flora-blue-light",
    items: [
      { icon: Calendar, title: "Emplois du temps", desc: "Génération automatique, salles, contraintes." },
      { icon: Users, title: "Présences & retards", desc: "Appel numérique, justifications, alertes parents." },
      { icon: ShieldCheck, title: "Discipline", desc: "Sanctions, conseils de discipline, suivi conduite." },
      { icon: QrCode, title: "Cartes scolaires QR", desc: "Cartes 85.6×54mm, pointage par QR code." },
      { icon: UtensilsCrossed, title: "Cantine", desc: "Menus, abonnements, badges repas." },
      { icon: Bus, title: "Transport", desc: "Lignes, arrêts, suivi GPS optionnel." },
    ],
  },
  {
    title: "Administration & Finance",
    accent: "from-accent to-flora-gold-light",
    items: [
      { icon: Building2, title: "Multi-établissements", desc: "Une URL slug par école, données isolées." },
      { icon: Wallet, title: "Comptabilité", desc: "Frais, paiements Mobile Money, dépenses." },
      { icon: Receipt, title: "Reçus REC numérotés", desc: "Numérotation automatique horodatée." },
      { icon: Library, title: "Bibliothèque", desc: "Catalogue, prêts, retours, retards." },
      { icon: Stethoscope, title: "Infirmerie", desc: "Fiches santé, passages, traitements." },
      { icon: Globe, title: "Inscriptions en ligne", desc: "Formulaires publics, dossiers, validation." },
    ],
  },
  {
    title: "Communication & Sécurité",
    accent: "from-flora-coral to-flora-coral-dark",
    items: [
      { icon: MessageSquare, title: "Messagerie interne", desc: "Conversations 1-1 et groupes par école." },
      { icon: Bell, title: "Notifications temps réel", desc: "Alertes push, in-app, par rôle." },
      { icon: Smartphone, title: "Application mobile PWA", desc: "Installable iOS/Android, mode hors-ligne." },
      { icon: Lock, title: "Sécurité RLS", desc: "Isolation stricte par school_id, rôles, RLS." },
      { icon: GraduationCap, title: "Espaces parents", desc: "Suivi multi-enfants, paiements, bulletins." },
      { icon: Sparkles, title: "Branding personnalisé", desc: "Logo, couleurs, sous-domaine de l'école." },
    ],
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/3 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-5">
            <Sparkles className="w-3.5 h-3.5" /> 24 modules · 1 plateforme
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-5">
            La plateforme <span className="text-primary">tout-en-un</span> pour
            piloter votre établissement
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            De la pédagogie quotidienne à la comptabilité, en passant par la
            cantine, le transport et l'infirmerie. Tout est connecté, en temps
            réel, et isolé par école.
          </p>
        </div>

        <div className="space-y-16">
          {groups.map((group, gi) => (
            <div key={group.title}>
              <div className="flex items-center gap-3 mb-6">
                <span className={`h-1 w-12 rounded-full bg-gradient-to-r ${group.accent}`} />
                <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
                  {group.title}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {String(gi + 1).padStart(2, "0")} / 04
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((f, i) => (
                  <div
                    key={f.title}
                    className="group relative bg-card rounded-2xl p-5 border border-border/60 hover:border-primary/30 hover:shadow-flora-md transition-all hover:-translate-y-1 animate-slide-up"
                    style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${group.accent} text-white flex items-center justify-center mb-3 shadow-flora group-hover:scale-110 transition-transform`}>
                      <f.icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-1.5">{f.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
