import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Smile, Meh, Frown, Angry, Heart } from "lucide-react";

const moods = [
  { value: "great", label: "Great", icon: Heart, color: "text-green-400", bg: "bg-green-500/15 border-green-500/30 hover:bg-green-500/25" },
  { value: "good", label: "Good", icon: Smile, color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25" },
  { value: "okay", label: "Okay", icon: Meh, color: "text-yellow-400", bg: "bg-yellow-500/15 border-yellow-500/30 hover:bg-yellow-500/25" },
  { value: "low", label: "Low", icon: Frown, color: "text-orange-400", bg: "bg-orange-500/15 border-orange-500/30 hover:bg-orange-500/25" },
  { value: "struggling", label: "Struggling", icon: Angry, color: "text-red-400", bg: "bg-red-500/15 border-red-500/30 hover:bg-red-500/25" },
];

interface DailyCheckInModalProps {
  open: boolean;
  onComplete: (mood: string, note: string) => void;
}

export default function DailyCheckInModal({ open, onComplete }: DailyCheckInModalProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"mood" | "note">("mood");

  const handleMoodSelect = (mood: string) => {
    setSelected(mood);
    setTimeout(() => setStep("note"), 300);
  };

  const handleSubmit = () => {
    if (selected) {
      onComplete(selected, note);
    }
  };

  const handleSkip = () => {
    if (selected) {
      onComplete(selected, "");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md border-border/60 bg-card" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-display">
            {step === "mood" ? "How are you feeling today?" : "Anything on your mind?"}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            {step === "mood"
              ? "Your daily check-in helps us personalize your experience."
              : "Journaling your thoughts can help with recovery. This is optional."}
          </DialogDescription>
        </DialogHeader>

        {step === "mood" ? (
          <div className="grid grid-cols-5 gap-2 py-4">
            {moods.map((mood, i) => {
              const Icon = mood.icon;
              const isSelected = selected === mood.value;
              return (
                <motion.button
                  key={mood.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? `${mood.bg} ring-2 ring-primary/30 scale-105`
                      : `${mood.bg} opacity-70 hover:opacity-100`
                  }`}
                >
                  <Icon className={`w-7 h-7 ${mood.color}`} />
                  <span className="text-[11px] font-medium text-foreground">{mood.label}</span>
                </motion.button>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 py-2"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Mood:</span>
              {(() => {
                const m = moods.find((m) => m.value === selected);
                if (!m) return null;
                const Icon = m.icon;
                return (
                  <span className={`flex items-center gap-1 font-medium ${m.color}`}>
                    <Icon className="w-4 h-4" /> {m.label}
                  </span>
                );
              })()}
            </div>
            <Textarea
              placeholder="Write a quick thought, trigger, or win from today…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px] bg-secondary/30 border-border/40 resize-none"
            />
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={handleSkip}>
                Skip
              </Button>
              <Button className="flex-1" onClick={handleSubmit}>
                Save Check-In
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
