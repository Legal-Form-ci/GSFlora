import { ArrowRight, Sparkles, Play, CheckCircle2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import heroVideo from "@/assets/hero-school-video.mp4.asset.json";

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
            <HeroVideo />
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
                {["Académie Digitale", "Concordia School", "Lycée Lumière", "Saint-Joseph", "EduPro Institut", "Cours Florent", "La Croix Blanche", "Horizon Campus"].map((n) => (
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

/* ---------------- HeroVideo: real MP4 with floating UI overlay ---------------- */
const HeroVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 rounded-[2rem] blur-2xl opacity-60 animate-pulse-soft" />

      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-flora-lg border border-border bg-card">
        <video
          ref={videoRef}
          src={heroVideo.url}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-secondary/20" />

        {/* Mute button */}
        <button
          onClick={toggleMute}
          aria-label={muted ? "Activer le son" : "Couper le son"}
          className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-md border border-border hover:bg-background transition-colors flex items-center justify-center"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Live KPI overlay (top-left) */}
        <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md rounded-xl border border-border px-3 py-2 shadow-flora animate-slide-up">
          <div className="flex items-center gap-2">
            <span className="relative flex w-2 h-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-flora-success opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-flora-success" />
            </span>
            <span className="text-[10px] font-semibold text-foreground uppercase tracking-wide">En direct</span>
          </div>
          <p className="text-sm font-bold font-display text-foreground mt-1">1 247 élèves connectés</p>
        </div>
      </div>

      {/* Floating glass cards */}
      <div className="absolute -top-4 -right-3 md:-right-8 bg-card/95 backdrop-blur-md rounded-2xl shadow-flora-lg border border-border p-3 animate-float max-w-[200px]">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-flora-success/10 text-flora-success flex items-center justify-center text-lg">📊</div>
          <div>
            <p className="text-xs font-bold text-foreground">Présence aujourd'hui</p>
            <p className="text-base font-display font-bold text-flora-success leading-none">98.4%</p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-3 md:-left-8 bg-card/95 backdrop-blur-md rounded-2xl shadow-flora-lg border border-border p-3 animate-float max-w-[210px]" style={{ animationDelay: "2s" }}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-accent/15 text-accent flex items-center justify-center text-lg">🎓</div>
          <div>
            <p className="text-xs font-bold text-foreground">Bulletin Trim. 2</p>
            <p className="text-[10px] text-muted-foreground">CM2 · Moy. classe 14.2/20</p>
          </div>
        </div>
      </div>

      <div className="hidden md:block absolute top-1/2 -right-10 -translate-y-1/2 bg-card/95 backdrop-blur-md rounded-2xl shadow-flora-lg border border-border p-3 animate-float" style={{ animationDelay: "1s" }}>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center text-lg">💬</div>
          <div>
            <p className="text-xs font-bold text-foreground">+12 messages</p>
            <p className="text-[10px] text-muted-foreground">Parents · Aujourd'hui</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
