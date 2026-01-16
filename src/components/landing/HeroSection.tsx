import { BookOpen, GraduationCap, Users, ChartBar } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoFlora from "@/assets/logo-flora.jpeg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-flora-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-flora-coral/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse-soft" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <GraduationCap className="w-5 h-5 text-flora-gold" />
              <span className="text-flora-gold text-sm font-medium">Enseignement Général • De la 6ème à la Terminale</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Groupe Scolaire
              <span className="block text-flora-gold">Flora Digital</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-4 max-w-xl mx-auto lg:mx-0">
              Plateforme de Gestion Scolaire Numérique Complète
            </p>
            
            <p className="text-flora-coral font-display text-2xl italic mb-8">
              "Si tu veux, tu peux !"
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl">
                <BookOpen className="w-5 h-5" />
                Accéder à la plateforme
              </Button>
              <Button variant="hero-outline" size="xl">
                En savoir plus
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <p className="text-3xl font-bold text-flora-gold">500+</p>
                <p className="text-sm text-white/70">Élèves</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-flora-gold">30+</p>
                <p className="text-sm text-white/70">Enseignants</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-flora-gold">15+</p>
                <p className="text-sm text-white/70">Matières</p>
              </div>
            </div>
          </div>

          {/* Right content - Logo and cards */}
          <div className="flex-1 relative" style={{ animationDelay: "0.3s" }}>
            <div className="relative">
              {/* Main logo card */}
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-flora-lg border border-white/20 animate-float">
                <img 
                  src={logoFlora} 
                  alt="Groupe Scolaire Flora" 
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-lg"
                />
              </div>

              {/* Floating feature cards */}
              <div className="absolute -left-4 top-1/4 bg-white rounded-2xl p-4 shadow-flora-md animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-flora-blue rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-flora-blue text-sm">Cours en ligne</p>
                    <p className="text-xs text-muted-foreground">Accès 24/7</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 top-1/3 bg-white rounded-2xl p-4 shadow-flora-md animate-float" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-flora-coral rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-flora-blue text-sm">Suivi parents</p>
                    <p className="text-xs text-muted-foreground">Notes & Absences</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 left-1/4 bg-white rounded-2xl p-4 shadow-flora-md animate-float" style={{ animationDelay: "1.5s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-flora-gold rounded-xl flex items-center justify-center">
                    <ChartBar className="w-5 h-5 text-flora-blue" />
                  </div>
                  <div>
                    <p className="font-semibold text-flora-blue text-sm">Quiz interactifs</p>
                    <p className="text-xs text-muted-foreground">Auto-correction</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path 
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
            fill="hsl(45 30% 98%)"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
