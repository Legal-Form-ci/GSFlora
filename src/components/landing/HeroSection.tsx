import { ArrowRight, Sparkles, Play, GraduationCap, BookOpen, Calendar, Wallet, Users, MessageSquare, Bell, BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const rotatingWords = [
  "Inscriptions en ligne",
  "Bulletins en 1 clic",
  "Facturation automatique",
  "Communication parents",
  "Appel dématérialisé",
  "Cahier de textes",
  "Cantine & transport",
  "Emplois du temps",
];

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32 bg-background">
      {/* Animated mesh background */}
      <div className="absolute inset-0 -z-10 bg-gradient-mesh opacity-70" />
      <div className="absolute inset-0 -z-10 grid-bg opacity-[0.35]" />
      <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/20 blur-3xl animate-blob" />
      <div className="absolute top-40 -right-32 w-[520px] h-[520px] rounded-full bg-secondary/20 blur-3xl animate-blob" style={{ animationDelay: "4s" }} />
      <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-accent/20 blur-3xl animate-blob" style={{ animationDelay: "8s" }} />

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left */}
          <div className="lg:col-span-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur px-4 py-1.5 text-xs font-semibold text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Le système d'exploitation de l'éducation
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] text-foreground mb-6">
              Arrêtez de gérer.
              <br />
              <span className="text-primary">Libérez-vous du temps</span>
              <br />
              pour <span className="relative inline-block">
                éduquer.
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 9 Q 100 -2 198 7" stroke="hsl(var(--accent))" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-xl">
              Pendant que vous vous noyez dans l'administratif, vos élèves attendent.
              <strong className="text-foreground"> SchoolHub Pro automatise tout le reste.</strong>
            </p>

            {/* Rotating tags */}
            <div className="flex flex-wrap gap-2 mb-8 max-w-xl">
              {rotatingWords.map((w, i) => (
                <span
                  key={w}
                  className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:border-primary/40 hover:text-primary transition-colors"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <CheckCircle2 className="w-3 h-3 text-primary" />
                  {w}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="rounded-full shadow-flora-lg" asChild>
                <Link to="/create-school">
                  Voir la magie en action
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full" asChild>
                <Link to="#features">
                  <Play className="w-4 h-4" />
                  Découvrir la solution
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mt-12 max-w-xl">
              {[
                { v: "500+", l: "Établissements" },
                { v: "45K+", l: "Utilisateurs" },
                { v: "48h", l: "Déploiement" },
                { v: "24/7", l: "Disponibilité" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-2xl md:text-3xl font-bold text-primary font-display">{s.v}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right – animated dashboard hero (Nexora-inspired) */}
          <div className="lg:col-span-6 relative">
            <HeroAnimation />
          </div>
        </div>
      </div>

      {/* Trusted by marquee */}
      <div className="container mx-auto px-4 mt-20">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">
          Ils nous font confiance
        </p>
        <div className="relative overflow-hidden mask-fade">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, k) => (
              <div key={k} className="flex gap-12 shrink-0 items-center">
                {["GS Flora", "Académie Digitale", "Concordia School", "Lycée Lumière", "Saint-Joseph", "EduPro Institut", "Cours Florent", "La Croix Blanche"].map((n) => (
                  <span key={n + k} className="text-2xl font-display font-bold text-muted-foreground/40 hover:text-primary transition-colors">
                    {n}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------------- HeroAnimation: layered, dynamic dashboard mockup ---------------- */
const HeroAnimation = () => {
  const widgets = [
    { icon: GraduationCap, label: "1 247", sub: "Élèves actifs", color: "text-primary", bg: "bg-primary/10" },
    { icon: BookOpen, label: "86", sub: "Cours en ligne", color: "text-secondary", bg: "bg-secondary/10" },
    { icon: Calendar, label: "98%", sub: "Présence", color: "text-flora-success", bg: "bg-flora-success/10" },
    { icon: Wallet, label: "12.4M", sub: "Recettes (FCFA)", color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <div className="relative mx-auto max-w-xl aspect-square">
      {/* Floating decorative shapes */}
      <div className="absolute inset-0 animate-spin-slow opacity-60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-accent rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary rounded-full" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-full" />
      </div>

      {/* Main "browser" panel */}
      <div className="absolute inset-6 bg-card rounded-3xl shadow-flora-lg border border-border overflow-hidden animate-tilt">
        <div className="h-8 bg-muted/50 border-b border-border flex items-center gap-1.5 px-3">
          <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <span className="w-2.5 h-2.5 rounded-full bg-flora-success" />
          <span className="ml-3 text-[10px] text-muted-foreground font-mono">schoolhub.app/gs-flora/admin</span>
        </div>

        <div className="p-4 space-y-3">
          {/* KPI grid */}
          <div className="grid grid-cols-2 gap-2">
            {widgets.map((w, i) => (
              <div
                key={w.sub}
                className="rounded-xl border border-border p-3 bg-background hover:border-primary/40 transition-colors animate-slide-up"
                style={{ animationDelay: `${0.2 + i * 0.1}s`, animationFillMode: "both" }}
              >
                <div className={`w-8 h-8 rounded-lg ${w.bg} ${w.color} flex items-center justify-center mb-2`}>
                  <w.icon className="w-4 h-4" />
                </div>
                <p className="text-lg font-bold font-display text-foreground leading-none">{w.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{w.sub}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="rounded-xl border border-border p-3 bg-background">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-primary" /> Performance
              </p>
              <span className="text-[10px] text-flora-success font-semibold">+18%</span>
            </div>
            <div className="flex items-end gap-1.5 h-16">
              {[40, 65, 50, 80, 60, 90, 75, 95, 70, 85, 100, 88].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t animate-slide-up"
                  style={{ height: `${h}%`, animationDelay: `${0.5 + i * 0.05}s`, animationFillMode: "both" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <div className="absolute -top-2 -left-4 bg-card rounded-2xl shadow-flora-lg border border-border p-3 animate-float max-w-[180px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold">Nouveau message</p>
            <p className="text-[10px] text-muted-foreground">Mme Diop · Maths</p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-2 -right-2 bg-card rounded-2xl shadow-flora-lg border border-border p-3 animate-float max-w-[180px]" style={{ animationDelay: "2s" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold">Bulletin disponible</p>
            <p className="text-[10px] text-muted-foreground">Trimestre 2 · CM2</p>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -right-6 bg-card rounded-2xl shadow-flora-lg border border-border p-3 animate-float" style={{ animationDelay: "1s" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold">+24 élèves</p>
            <p className="text-[10px] text-muted-foreground">Cette semaine</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
