import { useState } from "react";
import { Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-flora">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo-flora.png" 
              alt="Groupe Scolaire Flora" 
              className="w-12 h-12 md:w-14 md:h-14 object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="font-display text-lg md:text-xl font-bold text-flora-blue">GS Flora</h1>
              <p className="text-xs text-muted-foreground -mt-1">Digital</p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-flora-blue transition-colors font-medium">Accueil</a>
            <a href="#features" className="text-muted-foreground hover:text-flora-blue transition-colors">Fonctionnalités</a>
            <a href="#about" className="text-muted-foreground hover:text-flora-blue transition-colors">À propos</a>
            <a href="#contact" className="text-muted-foreground hover:text-flora-blue transition-colors">Contact</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth?mode=login">Se connecter</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?mode=signup">
                <LogIn className="w-4 h-4" />
                Inscription
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#" className="text-foreground font-medium py-2">Accueil</a>
              <a href="#features" className="text-muted-foreground py-2">Fonctionnalités</a>
              <a href="#about" className="text-muted-foreground py-2">À propos</a>
              <a href="#contact" className="text-muted-foreground py-2">Contact</a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth?mode=login">Se connecter</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/auth?mode=signup">
                    <LogIn className="w-4 h-4" />
                    Inscription
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
