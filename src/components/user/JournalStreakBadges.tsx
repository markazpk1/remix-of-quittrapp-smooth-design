import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Flame, Award, Star, Zap, Crown, Target, Feather, BookOpen, Calendar, Lock } from "lucide-react";
import { format, subDays, differenceInCalendarDays, parseISO } from "date-fns";

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  content: string;
  createdAt: string;
}

interface JournalBadge {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  check: (entries: JournalEntry[]) => boolean;
}

const badges: JournalBadge[] = [
  {
    id: "first_entry", label: "First Words", description: "Write your first journal entry",
    icon: Feather, color: "text-blue-400", bg: "bg-blue-500/15",
    check: (e) => e.length >= 1,
  },
  {
    id: "streak_3", label: "3-Day Streak", description: "Journal 3 days in a row",
    icon: Flame, color: "text-orange-400", bg: "bg-orange-500/15",
    check: (e) => calcStreak(e) >= 3 || calcMaxStreak(e) >= 3,
  },
  {
    id: "streak_7", label: "Week Warrior", description: "Journal 7 days in a row",
    icon: Flame, color: "text-orange-400", bg: "bg-orange-500/15",
    check: (e) => calcStreak(e) >= 7 || calcMaxStreak(e) >= 7,
  },
  {
    id: "entries_5", label: "Getting Started", description: "Write 5 journal entries",
    icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/15",
    check: (e) => e.length >= 5,
  },
  {
    id: "entries_10", label: "Dedicated Writer", description: "Write 10 journal entries",
    icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/15",
    check: (e) => e.length >= 10,
  },
  {
    id: "entries_25", label: "Storyteller", description: "Write 25 journal entries",
    icon: Award, color: "text-purple-400", bg: "bg-purple-500/15",
    check: (e) => e.length >= 25,
  },
  {
    id: "streak_14", label: "Two Week Titan", description: "Journal 14 days in a row",
    icon: Crown, color: "text-amber-400", bg: "bg-amber-500/15",
    check: (e) => calcStreak(e) >= 14 || calcMaxStreak(e) >= 14,
  },
  {
    id: "streak_30", label: "Monthly Master", description: "Journal 30 days in a row",
    icon: Crown, color: "text-primary", bg: "bg-primary/15",
    check: (e) => calcStreak(e) >= 30 || calcMaxStreak(e) >= 30,
  },
  {
    id: "long_entry", label: "Deep Dive", description: "Write an entry over 500 characters",
    icon: Target, color: "text-cyan-400", bg: "bg-cyan-500/15",
    check: (e) => e.some((x) => x.content.length > 500),
  },
  {
    id: "all_moods", label: "Full Spectrum", description: "Log all 5 mood types",
    icon: Zap, color: "text-pink-400", bg: "bg-pink-500/15",
    check: (e) => {
      const moods = new Set(e.map((x) => x.mood));
      return moods.size >= 5;
    },
  },
];

function getUniqueDays(entries: JournalEntry[]): string[] {
  const days = new Set(entries.map((e) => e.date));
  return Array.from(days).sort();
}

function calcStreak(entries: JournalEntry[]): number {
  const days = getUniqueDays(entries);
  if (days.length === 0) return 0;
  const today = format(new Date(), "yyyy-MM-dd");
  const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
  if (!days.includes(today) && !days.includes(yesterday)) return 0;

  let streak = 0;
  let current = days.includes(today) ? new Date() : subDays(new Date(), 1);
  const daySet = new Set(days);
  while (daySet.has(format(current, "yyyy-MM-dd"))) {
    streak++;
    current = subDays(current, 1);
  }
  return streak;
}

function calcMaxStreak(entries: JournalEntry[]): number {
  const days = getUniqueDays(entries);
  if (days.length === 0) return 0;
  let max = 1, current = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = differenceInCalendarDays(parseISO(days[i]), parseISO(days[i - 1]));
    if (diff === 1) { current++; max = Math.max(max, current); }
    else { current = 1; }
  }
  return Math.max(max, current);
}

interface Props {
  entries: JournalEntry[];
}

export default function JournalStreakBadges({ entries }: Props) {
  const [showAll, setShowAll] = useState(false);

  const currentStreak = useMemo(() => calcStreak(entries), [entries]);
  const bestStreak = useMemo(() => calcMaxStreak(entries), [entries]);
  const earned = useMemo(() => badges.filter((b) => b.check(entries)), [entries]);
  const locked = useMemo(() => badges.filter((b) => !b.check(entries)), [entries]);

  return (
    <>
      {/* Streak + Badges summary row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Current Streak</div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-2xl font-bold text-foreground">{bestStreak}</span>
            </div>
            <div className="text-xs text-muted-foreground">Best Streak</div>
          </CardContent>
        </Card>
        <Card
          className="bg-card/60 border-border/40 cursor-pointer hover:border-primary/30 transition-colors"
          onClick={() => setShowAll(true)}
        >
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-2xl font-bold text-foreground">{earned.length}<span className="text-sm text-muted-foreground">/{badges.length}</span></span>
            </div>
            <div className="text-xs text-muted-foreground">Badges Earned</div>
          </CardContent>
        </Card>
      </div>

      {/* Earned badges preview */}
      {earned.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {earned.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Badge
                  variant="outline"
                  className={`gap-1 py-1 px-2 text-xs cursor-pointer hover:scale-105 transition-transform ${b.color} border-current/20`}
                  onClick={() => setShowAll(true)}
                >
                  <Icon className="w-3 h-3" /> {b.label}
                </Badge>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* All badges dialog */}
      <Dialog open={showAll} onOpenChange={setShowAll}>
        <DialogContent className="sm:max-w-md border-border/60 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Journal Badges
            </DialogTitle>
            <DialogDescription>
              {earned.length} of {badges.length} earned — keep writing!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-[60vh] overflow-y-auto">
            {badges.map((b) => {
              const Icon = b.icon;
              const isEarned = b.check(entries);
              return (
                <div
                  key={b.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                    isEarned ? `${b.bg} border-current/10` : "bg-secondary/20 border-border/20 opacity-50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${isEarned ? b.bg : "bg-secondary/40"}`}>
                    {isEarned
                      ? <Icon className={`w-5 h-5 ${b.color}`} />
                      : <Lock className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>{b.label}</div>
                    <div className="text-xs text-muted-foreground">{b.description}</div>
                  </div>
                  {isEarned && (
                    <Badge variant="outline" className="text-[9px] bg-green-500/15 text-green-400 border-green-500/25">
                      Earned
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
