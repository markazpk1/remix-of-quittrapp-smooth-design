import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Heart, Smile, Meh, Frown, Angry } from "lucide-react";
import { format, subDays } from "date-fns";

const moodValues: Record<string, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  struggling: 1,
};

const moodLabels: Record<number, { label: string; color: string; icon: React.ElementType }> = {
  5: { label: "Great", color: "text-green-400", icon: Heart },
  4: { label: "Good", color: "text-emerald-400", icon: Smile },
  3: { label: "Okay", color: "text-yellow-400", icon: Meh },
  2: { label: "Low", color: "text-orange-400", icon: Frown },
  1: { label: "Struggling", color: "text-red-400", icon: Angry },
};

function generateMockMoodData() {
  const data: { date: string; label: string; mood: number }[] = [];
  const moods = ["great", "good", "okay", "good", "great", "good", "okay", "low", "good", "great",
    "good", "good", "okay", "good", "great", "great", "good", "okay", "good", "good",
    "great", "okay", "low", "good", "great", "good", "good", "okay", "good", "great"];

  for (let i = 29; i >= 0; i--) {
    const d = subDays(new Date(), i);
    const m = moods[29 - i];
    data.push({
      date: format(d, "yyyy-MM-dd"),
      label: format(d, "MMM d"),
      mood: moodValues[m],
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value as number;
  const info = moodLabels[val];
  if (!info) return null;
  const Icon = info.icon;

  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
      <div className="text-muted-foreground mb-1">{payload[0]?.payload?.label}</div>
      <div className={`flex items-center gap-1.5 font-medium ${info.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {info.label}
      </div>
    </div>
  );
};

export default function MoodHistoryChart() {
  const moodData = useMemo(() => generateMockMoodData(), []);

  const avgMood = useMemo(() => {
    const sum = moodData.reduce((acc, d) => acc + d.mood, 0);
    return (sum / moodData.length).toFixed(1);
  }, [moodData]);

  const currentStreak = useMemo(() => {
    let streak = 0;
    for (let i = moodData.length - 1; i >= 0; i--) {
      if (moodData[i].mood >= 4) streak++;
      else break;
    }
    return streak;
  }, [moodData]);

  const moodYTick = (value: number) => {
    const info = moodLabels[value];
    return info ? info.label : "";
  };

  return (
    <Card className="bg-card/60 border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" /> Mood History — Last 30 Days
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              Avg: <span className="font-semibold text-foreground">{avgMood}/5</span>
            </div>
            {currentStreak > 0 && (
              <div className="text-xs text-muted-foreground">
                Good streak: <span className="font-semibold text-green-400">{currentStreak}d</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={moodData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="label"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              interval={4}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={moodYTick}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
              width={65}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="mood"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.12}
              strokeWidth={2}
              dot={{ r: 2, fill: "hsl(var(--primary))", strokeWidth: 0 }}
              activeDot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
