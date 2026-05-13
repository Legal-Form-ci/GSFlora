import Logo from "@/components/Logo";
import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook, Youtube, ArrowRight, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const cols: { title: string; links: { l: string; h: string }[] }[] = [
  {
    title: "Plateforme",
    links: [
      { l: "Fonctionnalités", h: "#features" },
      { l: "Vidéo dashboard", h: "#dashboard-video" },
      { l: "Solutions par rôle", h: "#roles" },
      { l: "Tarifs", h: "#cta" },
    ],
  },
  {
    title: "Pour qui",
    links: [
      { l: "Administration", h: "/auth?mode=signup" },
      { l: "Enseignants", h: "/auth?mode=login" },
      { l: "Élèves", h: "/auth?mode=login" },
      { l: "Parents", h: "/auth?mode=login" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { l: "Centre d'aide", h: "#" },
      { l: "Guides pédagogiques", h: "#" },
      { l: "Statut plateforme", h: "#" },
      { l: "Changelog", h: "#" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="relative bg-sidebar text-sidebar-foreground pt-20 pb-8 overflow-hidden">
      {/* Decorative animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1.5s" }} />
        <div className="absolute inset-0 bg-gradient-mesh opacity-10" />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Newsletter band */}
        <div className="rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/15 border border-white/10 p-8 md:p-10 mb-16 backdrop-blur-sm grid md:grid-cols-2 gap-8 items-center animate-fade-in">
          <div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-sidebar-foreground mb-2">
              La newsletter EdTech, sans le spam.
            </h3>
            <p className="text-sidebar-foreground/70 text-sm">
              Conseils pratiques pour digitaliser votre école, nouveautés produit
              et retours d'expérience d'établissements.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 w-full"
          >
            <Input
              type="email"
              placeholder="votre@ecole.fr"
              className="bg-white/5 border-white/15 text-sidebar-foreground placeholder:text-sidebar-foreground/40 h-12"
              required
            />
            <Button type="submit" variant="hero" size="lg" className="group whitespace-nowrap">
              Je m'abonne
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          <div className="md:col-span-4">
            <div className="bg-white rounded-2xl p-3 inline-block mb-5 hover:scale-[1.02] transition-transform">
              <Logo className="h-10" />
            </div>
            <p className="text-sidebar-foreground/70 max-w-md mb-6 text-sm leading-relaxed">
              SchoolHub Pro — la plateforme SaaS qui digitalise, gère et fait grandir
              les établissements scolaires. Multi-tenant, sécurisée et déployée en 48h.
            </p>
            <div className="flex gap-2">
              {[Twitter, Linkedin, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Réseau social"
                  className="w-10 h-10 rounded-full bg-sidebar-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c, i) => (
            <div key={c.title} className="md:col-span-2 animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
              <h4 className="font-semibold mb-4 text-sidebar-foreground tracking-wide">{c.title}</h4>
              <ul className="space-y-2.5 text-sm">
                {c.links.map((lk) =>
                  lk.h.startsWith("/") ? (
                    <li key={lk.l}>
                      <Link
                        to={lk.h}
                        className="text-sidebar-foreground/70 hover:text-accent transition-colors story-link"
                      >
                        {lk.l}
                      </Link>
                    </li>
                  ) : (
                    <li key={lk.l}>
                      <a
                        href={lk.h}
                        className="text-sidebar-foreground/70 hover:text-accent transition-colors story-link"
                      >
                        {lk.l}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}

          <div className="md:col-span-2 animate-fade-in" style={{ animationDelay: "320ms" }}>
            <h4 className="font-semibold mb-4 text-sidebar-foreground tracking-wide">Contact</h4>
            <ul className="space-y-2.5 text-sm text-sidebar-foreground/70">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-accent" /> contact@schoolhub.pro</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent" /> +225 27 00 00 00</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-accent mt-0.5" /> Abidjan · Dakar · Paris</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sidebar-foreground/60 text-xs flex items-center gap-1.5">
            © {new Date().getFullYear()} SchoolHub Pro · digitaliser. gérer. grandir.
            <span className="hidden sm:inline-flex items-center gap-1 ml-2">
              · fait avec <Heart className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" /> en Afrique
            </span>
          </p>
          <div className="flex gap-6 text-xs text-sidebar-foreground/60">
            <a href="#" className="hover:text-accent transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-accent transition-colors">CGU</a>
            <a href="#" className="hover:text-accent transition-colors">Mentions légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
