import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const quotesByStage: Record<string, { text: string; author: string }[]> = {
  early: [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
    { text: "You don't have to be perfect to be amazing.", author: "Unknown" },
    { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  ],
  building: [
    { text: "Strength does not come from winning. Your struggles develop your strengths.", author: "Arnold Schwarzenegger" },
    { text: "The only way out is through.", author: "Robert Frost" },
    { text: "You are braver than you believe, stronger than you seem.", author: "A.A. Milne" },
    { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
    { text: "Courage isn't having the strength to go on — it's going on when you don't have the strength.", author: "Napoleon Bonaparte" },
    { text: "Progress, not perfection.", author: "Unknown" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  ],
  strong: [
    { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
    { text: "Freedom is what you do with what's been done to you.", author: "Jean-Paul Sartre" },
    { text: "I am not what happened to me. I am what I choose to become.", author: "Carl Jung" },
    { text: "Character cannot be developed in ease and quiet.", author: "Helen Keller" },
    { text: "You were given this life because you are strong enough to live it.", author: "Unknown" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Stars can't shine without darkness.", author: "D.H. Sidebottom" },
  ],
};

function getStage(daysClean: number): string {
  if (daysClean < 14) return "early";
  if (daysClean < 60) return "building";
  return "strong";
}

function getDailyIndex(arrayLength: number): number {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return seed % arrayLength;
}

interface DailyQuoteWidgetProps {
  daysClean?: number;
}

export default function DailyQuoteWidget({ daysClean = 14 }: DailyQuoteWidgetProps) {
  const quote = useMemo(() => {
    const stage = getStage(daysClean);
    const quotes = quotesByStage[stage];
    const index = getDailyIndex(quotes.length);
    return quotes[index];
  }, [daysClean]);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="bg-primary/5 border-primary/15 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <CardContent className="p-4 relative">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-primary/70 uppercase tracking-wider mb-1">Daily Inspiration</div>
              <p className="text-sm font-medium text-foreground leading-relaxed italic">"{quote.text}"</p>
              <p className="text-xs text-muted-foreground mt-1.5">— {quote.author}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
