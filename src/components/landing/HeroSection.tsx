import { BookOpen, GraduationCap, Building2, Globe, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse-soft" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Globe className="w-5 h-5 text-accent" />
              <span className="text-accent text-sm font-medium">Plateforme SaaS • Multi-établissement</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              SchoolHub
              <span className="block text-accent">Pro</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-4 max-w-xl mx-auto lg:mx-0">
              La plateforme de gestion scolaire numérique pour tous les établissements. 
              Créez, gérez et développez votre école en quelques clics.
            </p>
            
            <p className="text-secondary font-display text-xl italic mb-8">
              "Digitalisez votre établissement dès aujourd'hui"
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" asChild>
                <Link to="/auth?mode=signup">
                  <Building2 className="w-5 h-5" />
                  Créer mon établissement
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/auth?mode=login">
                  Se connecter
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">∞</p>
                <p className="text-sm text-white/70">Établissements</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">14+</p>
                <p className="text-sm text-white/70">Rôles</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">100%</p>
                <p className="text-sm text-white/70">Cloud</p>
              </div>
            </div>
          </div>

          {/* Right content - Feature cards */}
          <div className="flex-1 relative">
            <div className="relative">
              <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-flora-lg border border-white/20 animate-float">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: GraduationCap, label: "Gestion élèves", desc: "Notes, absences, bulletins" },
                    { icon: BookOpen, label: "Cours en ligne", desc: "Contenus pédagogiques" },
                    { icon: Shield, label: "Multi-rôles", desc: "14+ rôles configurables" },
                    { icon: Zap, label: "Temps réel", desc: "Synchronisation live" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/10 rounded-2xl p-4 text-center">
                      <item.icon className="w-8 h-8 text-accent mx-auto mb-2" />
                      <p className="text-white font-semibold text-sm">{item.label}</p>
                      <p className="text-white/60 text-xs">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute -left-4 top-1/4 bg-white rounded-2xl p-4 shadow-flora-md animate-float" style={{ animationDelay: "1s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">GS Flora</p>
                    <p className="text-xs text-muted-foreground">Actif ✓</p>
                  </div>
                </div>
              </div>

              <div className="absolute -right-4 bottom-1/4 bg-white rounded-2xl p-4 shadow-flora-md animate-float" style={{ animationDelay: "2s" }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">500+ élèves</p>
                    <p className="text-xs text-muted-foreground">En temps réel</p>
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
