import { Building2 } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">SchoolHub Pro</h3>
                <p className="text-sm text-primary-foreground/70">Plateforme éducative SaaS</p>
              </div>
            </div>
            <p className="text-primary-foreground/70 max-w-md mb-4">
              La plateforme de gestion scolaire multi-établissement la plus complète. 
              Digitalisez votre école en quelques minutes.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Plateforme</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-primary-foreground/70 hover:text-accent transition-colors">Fonctionnalités</a></li>
              <li><a href="#roles" className="text-primary-foreground/70 hover:text-accent transition-colors">Pour qui ?</a></li>
              <li><a href="#pricing" className="text-primary-foreground/70 hover:text-accent transition-colors">Tarifs</a></li>
              <li><a href="#contact" className="text-primary-foreground/70 hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Ressources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">Documentation</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">Support</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">Confidentialité</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">Conditions</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/70 text-sm">
            © {new Date().getFullYear()} SchoolHub Pro. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
