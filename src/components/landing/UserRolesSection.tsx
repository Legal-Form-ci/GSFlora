import {
  Crown, Shield, GraduationCap, Users, BookOpen, ClipboardCheck,
  Wallet, ShieldCheck, Stethoscope, UtensilsCrossed, Bus, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const roles = [
  { icon: Crown, name: "Fondateur", desc: "Vue groupe, finances, gouvernance.", color: "from-accent to-flora-gold-light" },
  { icon: Briefcase, name: "Directeur Général", desc: "Pilotage opérationnel, RH, KPIs.", color: "from-primary to-flora-success" },
  { icon: Shield, name: "Censeur", desc: "Discipline, présences, sanctions.", color: "from-flora-coral to-flora-coral-dark" },
  { icon: ClipboardCheck, name: "Éducateur", desc: "Vie scolaire, classes, registres.", color: "from-secondary to-flora-blue-light" },
  { icon: BookOpen, name: "Professeur Principal", desc: "Coordination de classe, conseils.", color: "from-primary to-secondary" },
  { icon: GraduationCap, name: "Enseignant", desc: "Cours, devoirs, notes, quiz.", color: "from-flora-success to-secondary" },
  { icon: Users, name: "Parent", desc: "Suivi enfants, paiements, messages.", color: "from-secondary to-primary" },
  { icon: Users, name: "Élève", desc: "Cours, devoirs, bulletins, quiz.", color: "from-accent to-primary" },
  { icon: Wallet, name: "Comptable", desc: "Encaissements, dépenses, états.", color: "from-flora-gold to-accent" },
  { icon: Stethoscope, name: "Infirmier", desc: "Fiches santé, passages, soins.", color: "from-flora-coral to-accent" },
  { icon: UtensilsCrossed, name: "Cantinier", desc: "Menus, abonnements, repas.", color: "from-flora-success to-primary" },
  { icon: Bus, name: "Responsable Transport", desc: "Lignes, élèves, présences bus.", color: "from-secondary to-accent" },
  { icon: ShieldCheck, name: "Surveillant", desc: "Pointage entrées/sorties.", color: "from-primary to-secondary" },
  { icon: Crown, name: "Super Admin", desc: "Plateforme, écoles, abonnements.", color: "from-accent to-primary" },
];

const UserRolesSection = () => {
  return (
    <section id="roles" className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <span className="inline-block bg-secondary/15 text-secondary font-semibold px-4 py-1.5 rounded-full text-xs mb-4 uppercase tracking-wider">
            14 rôles configurables
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-5">
            Un espace dédié pour <span className="text-secondary">chaque acteur</span> de l'école
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            De la fondation à la cantine, chaque rôle dispose d'un tableau de
            bord, de droits et de modules pensés pour son métier.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 md:gap-4 mb-10">
          {roles.map((r, i) => (
            <div
              key={r.name}
              className="group bg-card rounded-2xl p-4 border border-border/60 hover:border-primary/30 hover:shadow-flora-md transition-all hover:-translate-y-1 animate-slide-up text-center"
              style={{ animationDelay: `${i * 0.03}s`, animationFillMode: "both" }}
            >
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${r.color} text-white flex items-center justify-center mb-3 shadow-flora group-hover:scale-110 transition-transform`}>
                <r.icon className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-foreground text-sm mb-1">{r.name}</h4>
              <p className="text-[11px] text-muted-foreground leading-tight">{r.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" className="rounded-full shadow-flora-lg" asChild>
            <Link to="/create-school">Créer mon établissement gratuitement</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UserRolesSection;
