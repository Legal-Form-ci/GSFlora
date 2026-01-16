import { ArrowRight, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-hero relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-flora-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-flora-coral/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            Prêt à moderniser votre
            <span className="text-flora-gold"> expérience scolaire ?</span>
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Rejoignez GS Flora Digital et accédez à une plateforme éducative complète, 
            moderne et adaptée aux besoins de chacun.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button variant="hero" size="xl" className="group">
              Commencer maintenant
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="hero-outline" size="xl">
              Contacter l'administration
            </Button>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-flora-gold rounded-xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-flora-blue" />
              </div>
              <h4 className="text-white font-semibold mb-2">Téléphone</h4>
              <p className="text-white/70 text-sm">78 78 23 06</p>
              <p className="text-white/70 text-sm">72 18 25 75</p>
              <p className="text-white/70 text-sm">86 72 61 69</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-flora-coral rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Email</h4>
              <p className="text-white/70 text-sm">contact@gsflora.ci</p>
              <p className="text-white/70 text-sm">inscription@gsflora.ci</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="w-12 h-12 bg-flora-success rounded-xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Adresse</h4>
              <p className="text-white/70 text-sm">Daloa, Côte d'Ivoire</p>
              <p className="text-white/70 text-sm">Code: 190063</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
