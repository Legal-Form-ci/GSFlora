import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DashboardVideoSection from "@/components/landing/DashboardVideoSection";
import UserRolesSection from "@/components/landing/UserRolesSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DashboardVideoSection />
        <UserRolesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
