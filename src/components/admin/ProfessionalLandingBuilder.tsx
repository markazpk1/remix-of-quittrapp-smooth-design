import { useState, useEffect } from "react";
import { 
  GripVertical, Plus, Trash2, Eye, EyeOff, Settings, 
  ChevronRight, Monitor, Smartphone, Save, RotateCcw, 
  Layers, Layout, Type, Play, Users, Globe, Info, MessageSquare, DollarSign, Rocket
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Preview Components from the current project
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

export interface LandingSection {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
  content: any;
}

interface Props {
  initialSections: LandingSection[];
  onSave: (sections: LandingSection[]) => void;
}

const SECTION_TYPES = [
  { type: 'hero', label: 'Hero Section', icon: Layout, description: 'Main banner with headline and CTA' },
  { type: 'logo-bar', label: 'Partner Logos', icon: Globe, description: 'Trusted by logos' },
  { type: 'stats', label: 'Stats Bar', icon: Info, description: 'User metrics and trusted badges' },
  { type: 'how-it-works', label: 'How It Works', icon: Play, description: 'Step-by-step process' },
  { type: 'creators', label: 'Creators/Founders', icon: Users, description: 'Meet the team' },
  { type: 'testimonials', label: 'Testimonials', icon: MessageSquare, description: 'User success stories' },
  { type: 'features-grid', label: 'Features Grid', icon: Globe, description: 'Core app features' },
  { type: 'pricing', label: 'Pricing Plans', icon: DollarSign, description: 'Subscription tiers' },
  { type: 'faq', label: 'FAQ Accordion', icon: MessageSquare, description: 'Common questions' },
  { type: 'final-cta', label: 'Final CTA', icon: Rocket, description: 'Bottom call to action' },
];

export default function ProfessionalLandingBuilder({ initialSections, onSave }: Props) {
  const [sections, setSections] = useState<LandingSection[]>(initialSections);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  // Sync with initialSections when they load
  useEffect(() => {
    if (initialSections.length > 0) {
      setSections(initialSections);
    }
  }, [initialSections]);

  const handleAddSection = (type: string) => {
    const typeInfo = SECTION_TYPES.find(t => t.type === type);
    const newSection: LandingSection = {
      id: `sec-${Date.now()}`,
      type,
      label: typeInfo?.label || 'New Section',
      enabled: true,
      content: {},
    };
    setSections([...sections, newSection]);
    setSelectedId(newSection.id);
    setIsAddModalOpen(false);
  };

  const handleUpdate = (id: string, content: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, content: { ...s.content, ...content } } : s));
  };

  return (
    <div className="flex h-[800px] bg-background border rounded-xl overflow-hidden shadow-2xl">
      {/* Sidebar Controls */}
      <div className="w-[350px] border-r bg-card flex flex-col">
        <div className="p-4 border-b flex items-center justify-between bg-secondary/20">
          <h3 className="font-display font-semibold flex items-center gap-2 text-sm uppercase tracking-wider">
            <Layers size={16} className="text-primary" /> Landing Sections
          </h3>
          <Button size="sm" variant="outline" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={14} />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-2">
          <Reorder.Group axis="y" values={sections} onReorder={setSections} className="space-y-2">
            {sections.map((section) => (
              <Reorder.Item 
                key={section.id} 
                value={section}
                className={`group rounded-lg border transition-all ${
                  selectedId === section.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <div className="flex items-center p-3 gap-3">
                  <div className="cursor-grab text-muted-foreground hover:text-primary">
                    <GripVertical size={16} />
                  </div>
                  <div className="flex-1 cursor-pointer" onClick={() => setSelectedId(section.id)}>
                    <p className="text-sm font-medium">{section.label}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{section.type}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setSections(sections.map(s => s.id === section.id ? { ...s, enabled: !s.enabled } : s))}>
                      {section.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button onClick={() => setSections(sections.filter(s => s.id !== section.id))} className="text-destructive">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <AnimatePresence>
                  {selectedId === section.id && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-background/50">
                      <Separator />
                      <div className="p-4 space-y-4">
                        <SectionEditor section={section} onChange={(c) => handleUpdate(section.id, c)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </ScrollArea>

        <div className="p-4 border-t bg-secondary/10">
          <Button className="w-full" onClick={() => onSave(sections)}>
            <Save size={14} className="mr-2" /> Save Design
          </Button>
        </div>
      </div>

        <div className="flex-1 overflow-hidden bg-secondary/30 flex flex-col relative">
          <div className="p-2 border-b bg-background flex items-center justify-between z-10">
            <div className="flex bg-secondary p-1 rounded-lg">
              <button onClick={() => setPreviewMode('desktop')} className={`p-1.5 rounded-md flex items-center gap-2 text-xs transition-all ${previewMode === 'desktop' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Monitor size={14} /> Desktop
              </button>
              <button onClick={() => setPreviewMode('mobile')} className={`p-1.5 rounded-md flex items-center gap-2 text-xs transition-all ${previewMode === 'mobile' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                <Smartphone size={14} /> Mobile
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Live Viewport</span>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-[#0f1115] p-4 md:p-12 flex justify-center items-start custom-scrollbar">
            <div 
              className={`bg-background shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all duration-700 origin-top ${
                previewMode === 'mobile' 
                  ? "w-[375px] min-h-[667px] border-[12px] border-[#1a1a1a] rounded-[3rem]" 
                  : "w-full max-w-[1440px] min-h-full rounded-xl"
              }`}
              style={{ 
                transform: previewMode === 'desktop' ? 'scale(0.85)' : 'none',
                transformOrigin: 'top center'
              }}
            >
              <div className="h-full w-full">
                {sections.filter(s => s.enabled).map(s => (
                  <div key={s.id} className={`relative group/sec ${selectedId === s.id ? "ring-4 ring-primary/40 ring-inset" : ""}`}>
                    {selectedId === s.id && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-primary z-50 animate-pulse" />
                    )}
                    <PreviewRenderer section={s} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      {/* Add Section Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Section</DialogTitle>
            <DialogDescription>Choose a component to add to your landing page.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 p-4">
            {SECTION_TYPES.map(t => (
              <div key={t.type} className="flex gap-4 p-4 border rounded-xl hover:bg-primary/5 cursor-pointer transition-all" onClick={() => handleAddSection(t.type)}>
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-primary">
                  <t.icon size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{t.label}</h4>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionEditor({ section, onChange }: { section: LandingSection; onChange: (content: any) => void }) {
  const update = (f: string, v: any) => onChange({ ...section.content, [f]: v });
  const content = section.content || {};
  const type = section.type.toLowerCase();
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-[10px] uppercase font-bold text-primary tracking-widest">Section Title</Label>
        <Input 
          value={content.title || ''} 
          placeholder={type === 'hero' ? 'Welcome to our platform' : 'Our Services'}
          onChange={e => update('title', e.target.value)} 
          className="bg-background/50 border-primary/20 focus:border-primary transition-all"
        />
      </div>

      {(type.includes('hero') || type.includes('cta') || type.includes('how') || type.includes('creators')) && (
        <div className="space-y-2">
          <Label className="text-[10px] uppercase font-bold text-primary tracking-widest">Subtitle / Description</Label>
          <Textarea 
            value={content.subtitle || ''} 
            placeholder="Tell your users more about this..."
            onChange={e => update('subtitle', e.target.value)} 
            rows={3}
            className="bg-background/50 border-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>
      )}
      
      {type.includes('hero') && (
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Primary CTA</Label>
            <Input value={content.primaryBtn || ''} placeholder="Get Started" onChange={e => update('primaryBtn', e.target.value)} className="h-8 text-xs" />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Secondary CTA</Label>
            <Input value={content.secondaryBtn || ''} placeholder="Learn More" onChange={e => update('secondaryBtn', e.target.value)} className="h-8 text-xs" />
          </div>
        </div>
      )}
    </div>
  );
}

function PreviewRenderer({ section }: { section: LandingSection }) {
  const type = section.type.toLowerCase();
  const content = section.content || {};

  if (type.includes('hero')) {
    return <Hero title={content.title} subtitle={content.subtitle} />;
  }
  if (type.includes('logo-bar') || type.includes('logo')) {
    return <LogoBar />;
  }
  if (type.includes('stats')) {
    return <Stats title={content.title} />;
  }
  if (type.includes('how-it-works') || type.includes('how')) {
    return <HowItWorks title={content.title} subtitle={content.subtitle} />;
  }
  if (type.includes('creators') || type.includes('founder')) {
    return <Creators title={content.title} subtitle={content.subtitle} />;
  }
  if (type.includes('testimonial')) {
    return <Testimonials />;
  }
  if (type.includes('features')) {
    return <FeaturesGrid />;
  }
  if (type.includes('pricing')) {
    return <Pricing />;
  }
  if (type.includes('faq')) {
    return <FAQ />;
  }
  if (type.includes('final-cta') || type.includes('cta')) {
    return <FinalCTA />;
  }

  return (
    <div className="p-20 text-center bg-secondary/10 border border-dashed border-border/30 rounded-lg m-4">
      <p className="text-sm font-medium">{section.label}</p>
      <p className="text-[10px] text-muted-foreground uppercase mt-1">Component Ready</p>
    </div>
  );
}
