import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Phone, BookOpen, Music, Brain, Shield, ArrowLeft } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  // ... (steps remain same)
  { title: "Breathe", desc: "Take 5 deep breaths. Inhale for 4 seconds, hold for 4, exhale for 4.", icon: Shield, color: "bg-blue-500/20 text-blue-400" },
  { title: "Ground Yourself", desc: "Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.", icon: Heart, color: "bg-green-500/20 text-green-400" },
  { title: "Call Someone", desc: "Reach out to your accountability partner or a trusted friend right now.", icon: Phone, color: "bg-yellow-500/20 text-yellow-400" },
  { title: "Read a Lesson", desc: "Redirect your mind by learning something new about your recovery.", icon: BookOpen, color: "bg-primary/20 text-primary" },
  { title: "Listen to Sounds", desc: "Play calming sounds to help shift your emotional state.", icon: Music, color: "bg-purple-500/20 text-purple-400" },
  { title: "Talk to AI", desc: "Your AI companion is available 24/7 to help you through this.", icon: Brain, color: "bg-cyan-500/20 text-cyan-400" },
];

const affirmations = [
  "This craving will pass. They always do.",
  "You are stronger than your urges.",
  "Every second you resist makes you stronger.",
  "You've made it this far. Don't give up now.",
  "Your future self will thank you for this moment.",
  "You are not your addiction. You are recovering.",
];

export default function UserPanic() {
  const { user } = useAuth();
  const [activated, setActivated] = useState(false);
  const [panicCount, setPanicCount] = useState(0);
  const [affirmation] = useState(affirmations[Math.floor(Math.random() * affirmations.length)]);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.getPanicStats();
      if (response.success) {
        setPanicCount(response.data.count);
      }
    } catch (error) {
      console.error("Panic stats error:", error);
    }
  };

  const handleActivate = async () => {
    setActivated(true);
    try {
      await api.logPanicEvent();
      fetchStats(); // Update count
    } catch (error) {
      console.error("Panic log error:", error);
    }
  };

  if (!activated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto">
        <h1 className="font-display text-2xl font-bold text-foreground">Panic Button</h1>
        <p className="text-sm text-muted-foreground">Feeling triggered or experiencing a strong urge? Press the button below for immediate support.</p>
        <Button
          onClick={handleActivate}
          className="w-40 h-40 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-lg font-bold shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <div className="flex flex-col items-center gap-2">
            <Heart className="w-10 h-10" />
            <span>HELP ME</span>
          </div>
        </Button>
        <p className="text-xs text-muted-foreground">You've used this {panicCount} times. It's saved you every time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Button variant="ghost" onClick={() => setActivated(false)} className="text-muted-foreground text-sm">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      {/* Affirmation */}
      <Card className="bg-gradient-to-r from-primary/10 to-card/60 border-primary/20">
        <CardContent className="p-6 text-center">
          <div className="text-lg font-display font-bold text-foreground mb-2">Remember:</div>
          <p className="text-primary text-base italic">"{affirmation}"</p>
        </CardContent>
      </Card>

      {/* Recovery Steps */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-foreground">Follow these steps:</h2>
        {steps.map((step, i) => (
          <Card key={step.title} className="bg-card/60 border-border/40 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="text-lg font-bold text-muted-foreground w-6">{i + 1}</div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
                <step.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.desc}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground pt-4">
        If you're in immediate danger, please call your local emergency services or a crisis helpline.
      </div>
    </div>
  );
}
