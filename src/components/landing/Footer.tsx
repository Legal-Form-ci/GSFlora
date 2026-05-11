import Logo from "@/components/Logo";
import { Mail, Phone, MapPin, Twitter, Linkedin, Facebook, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-sidebar text-sidebar-foreground pt-16 pb-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-mesh opacity-10" />
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12 relative">
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-3 inline-block mb-5">
              <Logo className="h-10" />
            </div>
            <p className="text-sidebar-foreground/70 max-w-md mb-6 text-sm leading-relaxed">
              SchoolHub Pro — la plateforme SaaS qui digitalise, gère et fait
              grandir les établissements scolaires. Multi-tenant, sécurisée, et
              déployée en 48h.
            </p>
            <div className="flex gap-2">
              {[Twitter, Linkedin, Facebook, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-full bg-sidebar-accent hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sidebar-foreground">Écosystème</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                ["Fonctionnalités", "#features"],
                ["Solutions par rôle", "#roles"],
                ["Plateforme", "#platform"],
                ["Tarifs", "#pricing"],
                ["Roadmap", "#"],
              ].map(([l, h]) => (
                <li key={l}><a href={h} className="text-sidebar-foreground/70 hover:text-accent transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sidebar-foreground">Contact</h4>
            <ul className="space-y-2.5 text-sm text-sidebar-foreground/70">
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-accent" /> contact@schoolhub.pro</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent" /> +221 33 800 00 00</li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-accent mt-0.5" /> Dakar · Abidjan · Paris</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-border pt-6 flex flex-col md:flex-row justify-between items-center gap-4 relative">
          <p className="text-sidebar-foreground/60 text-xs">
            © {new Date().getFullYear()} SchoolHub Pro · digitaliser. gérer. grandir.
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
