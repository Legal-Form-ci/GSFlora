import { GraduationCap, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo and description */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-flora-gold rounded-xl flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-flora-blue" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">GS Flora Digital</h3>
                <p className="text-sm text-primary-foreground/70">Groupe Scolaire Flora Daloa</p>
              </div>
            </div>
            <p className="text-primary-foreground/70 max-w-md mb-4">
              Enseignement général de la 6ème à la Terminale. Une éducation de qualité 
              pour préparer les leaders de demain.
            </p>
            <p className="text-flora-gold font-display italic text-lg">"Si tu veux, tu peux !"</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold mb-4">Liens rapides</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/70 hover:text-flora-gold transition-colors">Accueil</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-flora-gold transition-colors">Connexion</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-flora-gold transition-colors">À propos</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-flora-gold transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/70 hover:text-flora-gold transition-colors">Cours en ligne</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-flora-gold transition-colors">Espace élève</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-flora-gold transition-colors">Espace parent</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-flora-gold transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/70 text-sm">
            © 2024 Groupe Scolaire Flora. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-flora-gold hover:text-flora-blue transition-all">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-flora-gold hover:text-flora-blue transition-all">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-flora-gold hover:text-flora-blue transition-all">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-flora-gold hover:text-flora-blue transition-all">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
