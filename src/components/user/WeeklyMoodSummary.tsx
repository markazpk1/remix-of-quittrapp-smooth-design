import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Minus, Award, Smile, Meh, Frown, Heart, Angry, X } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";

const moodValues: Record<string, number> = { great: 5, good: 4, okay: 3, low: 2, struggling: 1 };
const moodMeta: Record<number, { label: string; color: string; icon: React.ElementType }> = {
  5: { label: "Great", color: "text-green-400", icon: Heart },
  4: { label: "Good", color: "text-emerald-400", icon: Smile },
  3: { label: "Okay", color: "text-yellow-400", icon: Meh },
  2: { label: "Low", color: "text-orange-400", icon: Frown },
  1: { label: "Struggling", color: "text-red-400", icon: Angry },
};

function generateWeeklyMockData() {
  const thisWeek = ["good", "great", "good", "okay", "great", "good", "great"];
  const lastWeek = ["okay", "good", "low", "good", "okay", "good", "good"];
  return {
    thisWeek: thisWeek.map((m, i) => ({
      day: format(subDays(new Date(), 6 - i), "EEE"),
      date: format(subDays(new Date(), 6 - i), "MMM d"),
      mood: moodValues[m],
      label: m,
    })),
    lastWeek: lastWeek.map((m) => ({ mood: moodValues[m] })),
  };
}

interface WeeklyMoodSummaryProps {
  open: boolean;
  onClose: () => void;
}

export default function WeeklyMoodSummary({ open, onClose }: WeeklyMoodSummaryProps) {
  const { thisWeek, lastWeek } = useMemo(() => generateWeeklyMockData(), []);

  const thisAvg = useMemo(() => thisWeek.reduce((s, d) => s + d.mood, 0) / thisWeek.length, [thisWeek]);
  const lastAvg = useMemo(() => lastWeek.reduce((s, d) => s + d.mood, 0) / lastWeek.length, [lastWeek]);
  const diff = thisAvg - lastAvg;

  const bestDay = useMemo(() => [...thisWeek].sort((a, b) => b.mood - a.mood)[0], [thisWeek]);
  const moodCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    thisWeek.forEach((d) => { counts[d.mood] = (counts[d.mood] || 0) + 1; });
    return Object.entries(counts)
      .map(([k, v]) => ({ mood: Number(k), count: v }))
      .sort((a, b) => b.count - a.count);
  }, [thisWeek]);

  const dominantMood = moodMeta[moodCounts[0]?.mood] || moodMeta[4];
  const DominantIcon = dominantMood.icon;

  const TrendIcon = diff > 0.2 ? TrendingUp : diff < -0.2 ? TrendingDown : Minus;
  const trendColor = diff > 0.2 ? "text-green-400" : diff < -0.2 ? "text-red-400" : "text-yellow-400";
  const trendText = diff > 0.2 ? "Improving" : diff < -0.2 ? "Declining" : "Steady";

  const encouragement = thisAvg >= 4
    ? "You're doing amazing! Keep up the great work. 🎉"
    : thisAvg >= 3
    ? "Solid week! Small steps lead to big changes. 💪"
    : "Tough week, but you showed up. That takes courage. ❤️";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg border-border/60 bg-card">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-display flex items-center justify-center gap-2">
            <Award className="w-5 h-5 text-primary" /> Weekly Mood Summary
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-sm">
            {format(subDays(new Date(), 6), "MMM d")} — {format(new Date(), "MMM d, yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Trend + Average */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/20">
            <div>
              <div className="text-xs text-muted-foreground">Average Mood</div>
              <div className="text-2xl font-bold text-foreground">{thisAvg.toFixed(1)}<span className="text-sm text-muted-foreground">/5</span></div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">vs Last Week</div>
              <div className={`flex items-center gap-1 font-semibold ${trendColor}`}>
                <TrendIcon className="w-4 h-4" />
                {trendText} ({diff > 0 ? "+" : ""}{diff.toFixed(1)})
              </div>
            </div>
          </div>

          {/* Daily Breakdown */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Daily Breakdown</div>
            <div className="grid grid-cols-7 gap-1.5">
              {thisWeek.map((d) => {
                const info = moodMeta[d.mood];
                const Icon = info.icon;
                return (
                  <div key={d.date} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-secondary/20 border border-border/10">
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                    <Icon className={`w-5 h-5 ${info.color}`} />
                    <span className={`text-[10px] font-medium ${info.color}`}>{info.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dominant Mood + Best Day */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/20">
              <div className="text-xs text-muted-foreground mb-1">Dominant Mood</div>
              <div className={`flex items-center gap-1.5 font-medium ${dominantMood.color}`}>
                <DominantIcon className="w-4 h-4" />
                {dominantMood.label}
                <Badge variant="outline" className="text-[9px] ml-auto border-border/30">{moodCounts[0]?.count}d</Badge>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/20">
              <div className="text-xs text-muted-foreground mb-1">Best Day</div>
              <div className="font-medium text-foreground text-sm">{bestDay.day}, {bestDay.date}</div>
              <div className={`text-xs ${moodMeta[bestDay.mood].color}`}>{moodMeta[bestDay.mood].label}</div>
            </div>
          </div>

          {/* Encouragement */}
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center text-sm text-foreground">
            {encouragement}
          </div>

          <Button className="w-full" onClick={onClose}>Got it!</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
