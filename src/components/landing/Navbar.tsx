import { useState } from "react";
import { Menu, X, LogIn, Building2 } from "lucide-react";
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
            <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 md:w-7 md:h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg md:text-xl font-bold text-foreground">SchoolHub Pro</h1>
              <p className="text-xs text-muted-foreground -mt-1">Plateforme éducative</p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Fonctionnalités</a>
            <a href="#roles" className="text-muted-foreground hover:text-primary transition-colors">Pour qui ?</a>
            <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Tarifs</a>
            <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/auth?mode=login">Se connecter</Link>
            </Button>
            <Button asChild>
              <Link to="/auth?mode=signup">
                <LogIn className="w-4 h-4" />
                Créer un établissement
              </Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-muted-foreground py-2" onClick={() => setIsOpen(false)}>Fonctionnalités</a>
              <a href="#roles" className="text-muted-foreground py-2" onClick={() => setIsOpen(false)}>Pour qui ?</a>
              <a href="#pricing" className="text-muted-foreground py-2" onClick={() => setIsOpen(false)}>Tarifs</a>
              <a href="#contact" className="text-muted-foreground py-2" onClick={() => setIsOpen(false)}>Contact</a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/auth?mode=login">Se connecter</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/auth?mode=signup">
                    <LogIn className="w-4 h-4" />
                    Créer un établissement
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
