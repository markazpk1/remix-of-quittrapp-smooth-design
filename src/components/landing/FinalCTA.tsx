import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-purple opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 text-center animate-scroll-in">
        <h2 className="font-display text-3xl sm:text-5xl font-bold mb-6 max-w-2xl mx-auto">
          Ready to ship <span className="text-gradient-purple">faster</span>?
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-lg">
          Join 10,000+ teams building the future with LaunchKit. Start free today.
        </p>
        <Button size="lg" className="bg-gradient-purple text-primary-foreground purple-glow hover:opacity-90 transition-all text-base px-10 py-6">
          Get Started Free
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}
