import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell,
} from "recharts";
import { BarChart3, TrendingUp, Award, Calendar } from "lucide-react";
import { format, subDays, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval, subMonths, startOfMonth, endOfMonth, eachWeekOfInterval } from "date-fns";

interface Habit {
  id: string;
  label: string;
  icon: string;
}

interface HabitLog {
  [date: string]: string[];
}

const STORAGE_KEY_HABITS = "quittr_habits";
const STORAGE_KEY_LOG = "quittr_habit_log";

const DEFAULT_HABITS: Habit[] = [
  { id: "meditation", label: "Meditation", icon: "🧘" },
  { id: "exercise", label: "Exercise", icon: "💪" },
  { id: "journaling", label: "Journaling", icon: "📝" },
  { id: "reading", label: "Reading", icon: "📖" },
  { id: "gratitude", label: "Gratitude", icon: "🙏" },
  { id: "sleep", label: "Good Sleep", icon: "😴" },
];

function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HABITS);
    return raw ? JSON.parse(raw) : DEFAULT_HABITS;
  } catch { return DEFAULT_HABITS; }
}

function loadLog(): HabitLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOG);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

export default function HabitReportsWidget() {
  const habits = useMemo(loadHabits, []);
  const log = useMemo(loadLog, []);
  const [tab, setTab] = useState("weekly");

  // Weekly: last 4 weeks, each bar = avg completion % for that week
  const weeklyData = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(new Date(), 3 - i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd > new Date() ? new Date() : weekEnd });
      let total = 0;
      let count = 0;
      days.forEach(d => {
        const key = format(d, "yyyy-MM-dd");
        const done = (log[key] || []).length;
        total += habits.length > 0 ? (done / habits.length) * 100 : 0;
        count++;
      });
      const avg = count > 0 ? Math.round(total / count) : 0;
      return {
        label: format(weekStart, "MMM d"),
        completion: avg,
        days: count,
      };
    });
  }, [log, habits]);

  // Monthly: last 30 days, daily completion % as area chart
  const monthlyData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = subDays(new Date(), 29 - i);
      const key = format(d, "yyyy-MM-dd");
      const done = (log[key] || []).length;
      const pct = habits.length > 0 ? Math.round((done / habits.length) * 100) : 0;
      return { day: format(d, "d"), date: format(d, "MMM d"), completion: pct };
    });
  }, [log, habits]);

  // Per-habit breakdown for current period
  const habitBreakdown = useMemo(() => {
    const days = tab === "weekly" ? 7 : 30;
    return habits.map(h => {
      let completed = 0;
      for (let i = 0; i < days; i++) {
        const key = format(subDays(new Date(), i), "yyyy-MM-dd");
        if ((log[key] || []).includes(h.id)) completed++;
      }
      return {
        name: `${h.icon} ${h.label}`,
        rate: Math.round((completed / days) * 100),
        completed,
        total: days,
      };
    }).sort((a, b) => b.rate - a.rate);
  }, [log, habits, tab]);

  // Summary stats
  const stats = useMemo(() => {
    const days = tab === "weekly" ? 7 : 30;
    let perfectDays = 0;
    let totalCompletion = 0;
    for (let i = 0; i < days; i++) {
      const key = format(subDays(new Date(), i), "yyyy-MM-dd");
      const done = (log[key] || []).length;
      if (done >= habits.length && habits.length > 0) perfectDays++;
      totalCompletion += habits.length > 0 ? done / habits.length : 0;
    }
    const avgRate = Math.round((totalCompletion / days) * 100);
    const bestHabit = habitBreakdown[0];
    return { perfectDays, avgRate, bestHabit };
  }, [log, habits, tab, habitBreakdown]);

  return (
    <Card className="bg-card/60 border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Habit Reports
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="weekly" className="flex-1 text-xs">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 text-xs">Monthly</TabsTrigger>
          </TabsList>

          {/* Summary stats row */}
          <div className="grid grid-cols-3 gap-2 pt-3">
            <div className="rounded-lg bg-secondary/30 border border-border/20 p-3 text-center">
              <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{stats.avgRate}%</div>
              <div className="text-[10px] text-muted-foreground">Avg Rate</div>
            </div>
            <div className="rounded-lg bg-secondary/30 border border-border/20 p-3 text-center">
              <Award className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{stats.perfectDays}</div>
              <div className="text-[10px] text-muted-foreground">Perfect Days</div>
            </div>
            <div className="rounded-lg bg-secondary/30 border border-border/20 p-3 text-center">
              <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{stats.bestHabit?.rate ?? 0}%</div>
              <div className="text-[10px] text-muted-foreground truncate">Best Habit</div>
            </div>
          </div>

          <TabsContent value="weekly" className="mt-3 space-y-4">
            <div className="text-xs text-muted-foreground">Weekly completion average (last 4 weeks)</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, "Completion"]}
                />
                <Bar dataKey="completion" radius={[4, 4, 0, 0]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="monthly" className="mt-3 space-y-4">
            <div className="text-xs text-muted-foreground">Daily completion % (last 30 days)</div>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} interval={4} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 100]} unit="%" />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ""}
                  formatter={(v: number) => [`${v}%`, "Completion"]}
                />
                <Area type="monotone" dataKey="completion" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>

        {/* Per-habit breakdown */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            Habit breakdown ({tab === "weekly" ? "7 days" : "30 days"})
          </div>
          <div className="space-y-2">
            {habitBreakdown.map(h => (
              <div key={h.name} className="flex items-center gap-3">
                <span className="text-sm w-28 truncate">{h.name}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${h.rate}%` }}
                  />
                </div>
                <Badge variant="outline" className="text-[10px] min-w-[3rem] justify-center">
                  {h.rate}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
