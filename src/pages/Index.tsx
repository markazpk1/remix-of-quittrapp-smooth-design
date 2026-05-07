import { useEffect, useState } from "react";
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
import { fetchContentSectionsFromDatabase } from "@/services/supabase";

interface LandingSection {
  id: string;
  name: string;
  title?: string;
  subtitle?: string;
  content?: string;
  enabled: boolean;
}

const DynamicSectionRenderer = ({ section }: { section: LandingSection }) => {
  if (!section.enabled) return null;
  
  // Handle GrapesJS / Custom Content first if it exists
  if (section.content && (section.content.includes('{"html":') || section.name === 'Landing Page')) {
    try {
      const { html, css } = JSON.parse(section.content);
      return (
        <section id={section.id} className="relative overflow-hidden">
          <style dangerouslySetInnerHTML={{ __html: css }} />
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </section>
      );
    } catch (e) {
      // If not JSON, it might be raw HTML
      return <section id={section.id} dangerouslySetInnerHTML={{ __html: section.content }} />;
    }
  }
  
  const type = section.name.toLowerCase().replace(/\s+/g, '-');
  
  switch (type) {
    case 'hero': return <Hero title={section.title} subtitle={section.subtitle} />;
    case 'logo-bar': return <LogoBar />;
    case 'stats': return <Stats title={section.title} />;
    case 'how-it-works': return <HowItWorks title={section.title} subtitle={section.subtitle} />;
    case 'creators': return <Creators title={section.title} subtitle={section.subtitle} />;
    case 'testimonials': return <Testimonials />;
    case 'features-grid': return <FeaturesGrid />;
    case 'pricing': return <Pricing />;
    case 'faq': return <FAQ />;
    case 'final-cta': return <FinalCTA />;
    case 'landing-page': 
      // If it's the landing-page but didn't have parsed content above, 
      // it might be empty or in another format.
      return null;
    default: return null;
  }
};

const Index = () => {
  useLenis();
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        const res = await fetchContentSectionsFromDatabase();
        if (res.success && res.data) {
          setSections(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch sections:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSections();

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
      {loading ? (
        <div className="h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : sections.length > 0 ? (
        sections.map((section) => (
          <DynamicSectionRenderer key={section.id} section={section} />
        ))
      ) : (
        <>
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
        </>
      )}
      <Footer />
    </div>
  );
};

export default Index;
