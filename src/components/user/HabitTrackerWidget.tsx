import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Target, Plus, Flame, CheckCircle2, Trash2, Settings2, Bell, BellOff } from "lucide-react";
import { format, subDays, startOfWeek, eachDayOfInterval } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { requestNotificationPermission, isNotificationEnabled } from "@/hooks/useHabitNotifications";

interface Habit {
  id: string;
  label: string;
  icon: string;
}

interface HabitGoals {
  [habitId: string]: number; // days per week target
}

interface HabitLog {
  [date: string]: string[];
}

const DEFAULT_HABITS: Habit[] = [
  { id: "meditation", label: "Meditation", icon: "🧘" },
  { id: "exercise", label: "Exercise", icon: "💪" },
  { id: "journaling", label: "Journaling", icon: "📝" },
  { id: "reading", label: "Reading", icon: "📖" },
  { id: "gratitude", label: "Gratitude", icon: "🙏" },
  { id: "sleep", label: "Good Sleep", icon: "😴" },
];

const STORAGE_KEY_HABITS = "quittr_habits";
const STORAGE_KEY_LOG = "quittr_habit_log";
const STORAGE_KEY_GOALS = "quittr_habit_goals";

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

function loadGoals(): HabitGoals {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GOALS);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function calcHabitStreak(log: HabitLog, habits: Habit[]): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = format(subDays(today, i), "yyyy-MM-dd");
    const done = log[d] || [];
    if (done.length >= Math.ceil(habits.length / 2)) {
      streak++;
    } else if (i > 0) break;
    else break;
  }
  return streak;
}

function getWeekDays(): Date[] {
  const ws = startOfWeek(new Date(), { weekStartsOn: 1 });
  const today = new Date();
  return eachDayOfInterval({ start: ws, end: today });
}

export default function HabitTrackerWidget() {
  const [habits, setHabits] = useState<Habit[]>(loadHabits);
  const [log, setLog] = useState<HabitLog>(loadLog);
  const [goals, setGoals] = useState<HabitGoals>(loadGoals);
  const [addOpen, setAddOpen] = useState(false);
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newIcon, setNewIcon] = useState("✨");
  const [draftGoals, setDraftGoals] = useState<HabitGoals>({});
  const [notifEnabled, setNotifEnabled] = useState(isNotificationEnabled);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayDone = log[today] || [];

  useEffect(() => { localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(log)); }, [log]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals)); }, [goals]);

  const toggleHabit = useCallback((id: string) => {
    setLog(prev => {
      const done = prev[today] || [];
      const next = done.includes(id) ? done.filter(h => h !== id) : [...done, id];
      const updated = { ...prev, [today]: next };
      if (next.length === habits.length && !done.includes(id)) {
        toast.success("All habits completed today! 🎉");
      }
      return updated;
    });
  }, [today, habits.length]);

  const addHabit = useCallback(() => {
    if (!newLabel.trim()) return;
    const id = newLabel.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    setHabits(prev => [...prev, { id, label: newLabel.trim(), icon: newIcon || "✨" }]);
    setNewLabel("");
    setNewIcon("✨");
    setAddOpen(false);
    toast.success("Habit added!");
  }, [newLabel, newIcon]);

  const removeHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  }, []);

  const openGoals = useCallback(() => {
    setDraftGoals({ ...goals });
    setGoalsOpen(true);
  }, [goals]);

  const saveGoals = useCallback(() => {
    setGoals(draftGoals);
    setGoalsOpen(false);
    toast.success("Weekly goals saved!");
  }, [draftGoals]);

  const progress = habits.length > 0 ? Math.round((todayDone.length / habits.length) * 100) : 0;
  const streak = useMemo(() => calcHabitStreak(log, habits), [log, habits]);

  // Weekly goal progress per habit
  const weekProgress = useMemo(() => {
    const weekDays = getWeekDays();
    const result: Record<string, { done: number; target: number }> = {};
    habits.forEach(h => {
      let done = 0;
      weekDays.forEach(d => {
        const key = format(d, "yyyy-MM-dd");
        if ((log[key] || []).includes(h.id)) done++;
      });
      const target = goals[h.id] ?? 5;
      result[h.id] = { done, target };
    });
    return result;
  }, [log, habits, goals]);

  // Overall weekly goal progress
  const overallWeekPct = useMemo(() => {
    let totalDone = 0, totalTarget = 0;
    Object.values(weekProgress).forEach(({ done, target }) => {
      totalDone += Math.min(done, target);
      totalTarget += target;
    });
    return totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;
  }, [weekProgress]);

  // Last 7 days completion for mini heatmap
  const last7 = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
      const done = (log[d] || []).length;
      const pct = habits.length > 0 ? done / habits.length : 0;
      return { day: format(subDays(new Date(), 6 - i), "EEE"), pct, date: d };
    });
  }, [log, habits]);

  return (
    <Card className="bg-card/60 border-border/40">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Daily Habits
          </CardTitle>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <Badge variant="outline" className="text-[10px] bg-orange-500/10 text-orange-400 border-orange-500/20">
                <Flame className="w-3 h-3 mr-1" />{streak}d streak
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              title={notifEnabled ? "Reminders on" : "Enable reminders"}
              onClick={async () => {
                if (notifEnabled) {
                  toast.info("Reminders are managed in your browser settings");
                } else {
                  const granted = await requestNotificationPermission();
                  setNotifEnabled(granted);
                  if (granted) toast.success("Evening reminders enabled! 🔔");
                  else toast("Notifications blocked by browser");
                }
              }}
            >
              {notifEnabled ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={openGoals} title="Set weekly goals">
              <Settings2 className="w-4 h-4" />
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Add Habit</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 pt-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Emoji"
                      value={newIcon}
                      onChange={e => setNewIcon(e.target.value)}
                      className="w-16 text-center text-lg"
                      maxLength={2}
                    />
                    <Input
                      placeholder="Habit name"
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addHabit()}
                      className="flex-1"
                    />
                  </div>
                  <Button onClick={addHabit} className="w-full" disabled={!newLabel.trim()}>Add</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{todayDone.length}/{habits.length} completed</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Weekly goal progress */}
        <div className="space-y-1.5 rounded-lg bg-secondary/20 border border-border/20 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Target className="w-3 h-3" /> Weekly Goal
            </span>
            <Badge variant={overallWeekPct >= 100 ? "default" : "outline"} className="text-[10px]">
              {overallWeekPct}%
            </Badge>
          </div>
          <Progress value={Math.min(overallWeekPct, 100)} className="h-2" />
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
            {habits.map(h => {
              const wp = weekProgress[h.id];
              const pct = wp.target > 0 ? Math.min(Math.round((wp.done / wp.target) * 100), 100) : 0;
              const met = wp.done >= wp.target;
              return (
                <div key={h.id} className="flex items-center gap-1.5 text-[11px]">
                  <span>{h.icon}</span>
                  <span className={`flex-1 truncate ${met ? "text-primary" : "text-muted-foreground"}`}>
                    {wp.done}/{wp.target}d
                  </span>
                  <div className="w-12 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${met ? "bg-primary" : "bg-muted-foreground/40"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Habit list */}
        <div className="space-y-1.5">
          <AnimatePresence>
            {habits.map(habit => {
              const done = todayDone.includes(habit.id);
              return (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors cursor-pointer group ${
                    done ? "bg-primary/10 border border-primary/20" : "bg-secondary/30 border border-border/20 hover:border-primary/20"
                  }`}
                  onClick={() => toggleHabit(habit.id)}
                >
                  <Checkbox checked={done} className="pointer-events-none" />
                  <span className="text-base">{habit.icon}</span>
                  <span className={`text-sm flex-1 ${done ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {habit.label}
                  </span>
                  {done && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={e => { e.stopPropagation(); removeHabit(habit.id); }}
                  >
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* 7-day mini heatmap */}
        <div className="pt-1">
          <div className="text-xs text-muted-foreground mb-2">Last 7 days</div>
          <div className="flex gap-1.5">
            {last7.map(d => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full aspect-square rounded-md border border-border/20"
                  style={{
                    backgroundColor: d.pct === 0
                      ? "hsl(var(--secondary))"
                      : `hsl(var(--primary) / ${0.15 + d.pct * 0.6})`,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>

      {/* Goals dialog */}
      <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Weekly Goals</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Set how many days per week you want to complete each habit.</p>
          <div className="space-y-4 pt-2">
            {habits.map(h => {
              const val = draftGoals[h.id] ?? 5;
              return (
                <div key={h.id} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <span>{h.icon}</span> {h.label}
                    </span>
                    <Badge variant="outline" className="text-xs">{val} days/wk</Badge>
                  </div>
                  <Slider
                    value={[val]}
                    onValueChange={([v]) => setDraftGoals(prev => ({ ...prev, [h.id]: v }))}
                    min={1}
                    max={7}
                    step={1}
                    className="w-full"
                  />
                </div>
              );
            })}
            <Button onClick={saveGoals} className="w-full">Save Goals</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
