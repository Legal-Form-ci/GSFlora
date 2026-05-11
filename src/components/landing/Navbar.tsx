import { useEffect, useState } from "react";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Écosystème", href: "#features" },
  { label: "Solutions", href: "#roles" },
  { label: "Plateforme", href: "#platform" },
  { label: "Tarifs", href: "#pricing" },
  { label: "Ressources", href: "#resources" },
  { label: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top promo bar (ecole-futee style) */}
      <div className="hidden md:block bg-primary text-primary-foreground text-xs">
        <div className="container mx-auto px-4 h-9 flex items-center justify-between">
          <span className="opacity-90">
            🚀 Déployez SchoolHub Pro en 48h — sans installation, sans complexité.
          </span>
          <Link to="/create-school" className="font-semibold hover:text-accent transition-colors inline-flex items-center gap-1">
            Prendre rendez-vous <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <nav
        className={cn(
          "sticky top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/85 backdrop-blur-xl shadow-flora border-b border-border/60"
            : "bg-background/60 backdrop-blur-md"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <Logo className="h-9 md:h-11" />
            </Link>

            {/* Desktop navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="group relative px-3 py-2 text-sm font-medium text-foreground/75 hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  {l.label}
                  <ChevronDown className="w-3 h-3 opacity-50 group-hover:rotate-180 transition-transform" />
                  <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 origin-left transition-transform" />
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth?mode=login">Se connecter</Link>
              </Button>
              <Button size="sm" className="rounded-full shadow-flora-md" asChild>
                <Link to="/create-school">
                  Démarrer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {isOpen && (
            <div className="lg:hidden py-4 border-t border-border animate-fade-in">
              <div className="flex flex-col gap-1">
                {navLinks.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="px-3 py-3 rounded-lg hover:bg-muted text-foreground/80"
                    onClick={() => setIsOpen(false)}
                  >
                    {l.label}
                  </a>
                ))}
                <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth?mode=login">Se connecter</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link to="/create-school">
                      Démarrer gratuitement
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
