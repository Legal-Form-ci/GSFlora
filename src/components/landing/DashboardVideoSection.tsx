import { useRef, useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Sparkles, Zap, ZapOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMotionPreference } from "@/contexts/MotionPreferenceContext";

const DashboardVideoSection = () => {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const { reducedMotion, toggle: toggleReducedMotion } = useMotionPreference();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reducedMotion) { v.pause(); setPlaying(false); return; }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 }
    );
    obs.observe(v);
    return () => obs.disconnect();
  }, [reducedMotion]);

  const toggle = () => {
    const v = ref.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };
  const toggleMute = () => {
    const v = ref.current; if (!v) return;
    v.muted = !v.muted; setMuted(v.muted);
  };

  return (
    <section id="dashboard-video" className="relative py-24 overflow-hidden bg-gradient-to-b from-background via-secondary/5 to-background">
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent/10 blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
            <Sparkles className="w-4 h-4" /> Aperçu live
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight mb-5">
            Le tableau de bord qui pilote
            <span className="block bg-gradient-primary bg-clip-text text-transparent">votre établissement.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Indicateurs temps réel, notifications, présences, notes et finances —
            tout converge dans une expérience pensée pour les équipes scolaires.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto group">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 rounded-[2rem] blur-2xl opacity-60 group-hover:opacity-90 transition-opacity" />
          <div className="relative rounded-2xl overflow-hidden border border-border bg-sidebar shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 bg-sidebar/95 border-b border-sidebar-border">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 text-xs text-sidebar-foreground/60">app.schoolhub.pro / dashboard</span>
            </div>
            {reducedMotion ? (
              <img
                src="/dashboard-video-poster.jpg"
                alt="Aperçu du tableau de bord SchoolHub Pro"
                className="w-full aspect-video object-cover bg-black"
                loading="lazy"
              />
            ) : (
              <video
                ref={ref}
                src="/dashboard-video.mp4"
                poster="/dashboard-video-poster.jpg"
                className="w-full aspect-video object-cover bg-black"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
              />
            )}
            <div className="absolute bottom-4 right-4 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                onClick={toggleReducedMotion}
                aria-label={reducedMotion ? "Réactiver les animations" : "Réduire les animations"}
                title={reducedMotion ? "Réactiver les animations" : "Réduire les animations"}
              >
                {reducedMotion ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
              </Button>
              <Button size="icon" variant="secondary" onClick={toggle} aria-label="Lecture" disabled={reducedMotion}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button size="icon" variant="secondary" onClick={toggleMute} aria-label="Son" disabled={reducedMotion}>
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 max-w-5xl mx-auto">
          {[
            { k: "+1 200", l: "élèves connectés / jour" },
            { k: "96%", l: "présence moyenne" },
            { k: "24", l: "modules métier" },
            { k: "48h", l: "déploiement clé en main" },
          ].map((s, i) => (
            <div key={s.k} className="text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-3xl md:text-4xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">{s.k}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DashboardVideoSection;