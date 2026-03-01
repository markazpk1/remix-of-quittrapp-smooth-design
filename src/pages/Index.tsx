import { useEffect } from "react";
import { useLenis } from "@/hooks/useLenis";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import LogoBar from "@/components/landing/LogoBar";
import Stats from "@/components/landing/Stats";
import HowItWorks from "@/components/landing/HowItWorks";
import Creators from "@/components/landing/Creators";
import Testimonials from "@/components/landing/Testimonials";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  useLenis();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    document.querySelectorAll(".animate-scroll-in").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <LogoBar />
      <Stats />
      <HowItWorks />
      <Creators />
      <Testimonials />
      <FeaturesGrid />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
