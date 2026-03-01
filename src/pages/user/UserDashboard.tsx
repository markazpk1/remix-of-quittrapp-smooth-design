import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Flame, Calendar, Trophy, Heart, Zap, TrendingUp, Clock, Star, Mic, Play, Sunrise, Moon, Sun, Brain, ShieldCheck, Sparkles, Share2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import DailyCheckInModal from "@/components/user/DailyCheckInModal";
import MoodHistoryChart from "@/components/user/MoodHistoryChart";
import WeeklyMoodSummary from "@/components/user/WeeklyMoodSummary";
import DailyQuoteWidget from "@/components/user/DailyQuoteWidget";
import { toast } from "sonner";
import HabitTrackerWidget from "@/components/user/HabitTrackerWidget";
import HabitReportsWidget from "@/components/user/HabitReportsWidget";
import { useHabitNotifications } from "@/hooks/useHabitNotifications";

const streakData = [
  { day: "Mon", score: 85 },
  { day: "Tue", score: 72 },
  { day: "Wed", score: 90 },
  { day: "Thu", score: 65 },
  { day: "Fri", score: 88 },
  { day: "Sat", score: 95 },
  { day: "Sun", score: 78 },
];

const milestones = [
  { label: "1 Week Clean", achieved: true, date: "Feb 15", icon: Star },
  { label: "2 Weeks Clean", achieved: true, date: "Feb 22", icon: Star },
  { label: "1 Month Clean", achieved: false, date: "In 6 days", icon: Trophy },
  { label: "100 Lessons Done", achieved: false, date: "87/100", icon: Zap },
];

const recentActivity = [
  { text: "Completed lesson: Understanding Triggers", time: "2h ago", type: "lesson" },
  { text: "Listened to Ocean Waves (15 min)", time: "5h ago", type: "sound" },
  { text: "Shared in community: 14 day milestone!", time: "1d ago", type: "community" },
  { text: "Used Panic Button successfully", time: "2d ago", type: "panic" },
  { text: "Completed daily check-in", time: "2d ago", type: "checkin" },
];

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

const recommendedTracks: Record<string, { title: string; therapist: string; duration: string; category: string; icon: React.ElementType }[]> = {
  morning: [
    { title: "Morning Mindfulness", therapist: "Dr. Sarah Wells", duration: "10:00", category: "Mindfulness", icon: Sparkles },
    { title: "Building Inner Strength", therapist: "Dr. Marcus Lee", duration: "15:00", category: "Motivation", icon: Sunrise },
    { title: "Gratitude & Positivity", therapist: "AI Voice — Luna", duration: "9:30", category: "Motivation", icon: Sunrise },
  ],
  afternoon: [
    { title: "Overcoming Urges", therapist: "Dr. James Hart", duration: "8:45", category: "Recovery", icon: ShieldCheck },
    { title: "Self-Compassion Practice", therapist: "AI Voice — Atlas", duration: "14:20", category: "Mindfulness", icon: Sparkles },
    { title: "Rewiring Habits", therapist: "Dr. Marcus Lee", duration: "11:15", category: "Recovery", icon: Brain },
  ],
  evening: [
    { title: "Evening Wind Down", therapist: "Dr. Emily Tran", duration: "16:00", category: "Sleep", icon: Moon },
    { title: "Letting Go of Anxiety", therapist: "Dr. Sarah Wells", duration: "12:30", category: "Anxiety", icon: Brain },
    { title: "Deep Relaxation Body Scan", therapist: "Dr. Emily Tran", duration: "18:00", category: "Anxiety", icon: Brain },
  ],
  night: [
    { title: "Sleep & Recovery", therapist: "AI Voice — Luna", duration: "20:00", category: "Sleep", icon: Moon },
    { title: "Evening Wind Down", therapist: "Dr. Emily Tran", duration: "16:00", category: "Sleep", icon: Moon },
    { title: "Deep Relaxation Body Scan", therapist: "Dr. Emily Tran", duration: "18:00", category: "Anxiety", icon: Brain },
  ],
};

const timeLabels: Record<string, { greeting: string; emoji: string; recLabel: string }> = {
  morning: { greeting: "Good Morning", emoji: "☀️", recLabel: "this morning" },
  afternoon: { greeting: "Good Afternoon", emoji: "🌤️", recLabel: "this afternoon" },
  evening: { greeting: "Good Evening", emoji: "🌅", recLabel: "tonight" },
  night: { greeting: "Good Night", emoji: "🌙", recLabel: "bedtime" },
};

export default function UserDashboard() {
  const navigate = useNavigate();
  const timeOfDay = useMemo(() => getTimeOfDay(), []);
  const tracks = recommendedTracks[timeOfDay];
  const { greeting, emoji, recLabel } = timeLabels[timeOfDay];

  useHabitNotifications();
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastCheckIn = localStorage.getItem("quittr_last_checkin");
    if (lastCheckIn !== today) {
      const timer = setTimeout(() => setShowCheckIn(true), 600);
      return () => clearTimeout(timer);
    }

    // Show weekly summary on Mondays if not seen this week
    const dayOfWeek = new Date().getDay();
    const weekKey = `quittr_weekly_summary_${format(new Date(), "yyyy-ww")}`;
    if (dayOfWeek === 1 && !localStorage.getItem(weekKey)) {
      const timer = setTimeout(() => setShowWeeklySummary(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCheckInComplete = (mood: string, note: string) => {
    localStorage.setItem("quittr_last_checkin", new Date().toDateString());
    setShowCheckIn(false);
    toast.success("Check-in saved! Keep going 💪");
  };

  const handleWeeklySummaryClose = () => {
    localStorage.setItem(`quittr_weekly_summary_${format(new Date(), "yyyy-ww")}`, "true");
    setShowWeeklySummary(false);
  };

  return (
    <div className="space-y-6">
      <DailyCheckInModal open={showCheckIn} onComplete={handleCheckInComplete} />
      <WeeklyMoodSummary open={showWeeklySummary} onClose={handleWeeklySummaryClose} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{emoji} {greeting}, John</h1>
          <p className="text-sm text-muted-foreground">Keep going — you're doing amazing.</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowWeeklySummary(true)}>
          Weekly Summary
        </Button>
      </div>

      {/* Daily Quote */}
      <DailyQuoteWidget daysClean={14} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">14</div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">14</div>
                <div className="text-xs text-muted-foreground">Days Clean</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">87</div>
                <div className="text-xs text-muted-foreground">Lessons Done</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/60 border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">6</div>
                <div className="text-xs text-muted-foreground">Panic Saves</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommended Voice Therapy */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Mic className="w-4 h-4 text-primary" /> Recommended for {recLabel}
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate("/app/voice-therapy")}>
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3">
            {tracks.map((track) => {
              const TrackIcon = track.icon;
              return (
                <div
                  key={track.title}
                  className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/20 hover:border-primary/30 transition-colors cursor-pointer group"
                  onClick={() => navigate("/app/voice-therapy")}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <TrackIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{track.title}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{track.therapist} · {track.duration}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 text-primary" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Mood/Score Chart */}
        <Card className="lg:col-span-2 bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Weekly Wellbeing Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={streakData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Milestones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestones.map((m) => (
              <div key={m.label} className={`flex items-center gap-3 p-2.5 rounded-lg ${m.achieved ? "bg-green-500/10 border border-green-500/20" : "bg-secondary/30 border border-border/20"}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.achieved ? "bg-green-500/20" : "bg-secondary/60"}`}>
                  <m.icon className={`w-4 h-4 ${m.achieved ? "text-green-400" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${m.achieved ? "text-green-400" : "text-foreground"}`}>{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.date}</div>
                </div>
                {m.achieved && (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={() => {
                        const shared = JSON.parse(localStorage.getItem("quittr_community_posts") || "[]");
                        const alreadyShared = shared.some((p: any) => p.milestone?.label === m.label);
                        if (alreadyShared) {
                          toast.info("You've already shared this milestone!");
                          return;
                        }
                        shared.unshift({
                          id: Date.now(),
                          author: "You",
                          avatar: "YO",
                          time: "Just now",
                          badge: m.label,
                          text: `I just achieved "${m.label}"! 🎉 Another step forward in my recovery journey.`,
                          category: "milestone",
                          likes: 0,
                          comments: 0,
                          liked: false,
                          milestone: { label: m.label },
                          reactions: [
                            { emoji: "🎉", label: "Celebrate", count: 0, reacted: false },
                            { emoji: "💪", label: "Strong", count: 0, reacted: false },
                          ],
                        });
                        localStorage.setItem("quittr_community_posts", JSON.stringify(shared));
                        toast.success("Milestone shared to community! 🎉");
                        navigate("/app/community");
                      }}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </Button>
                    <Badge variant="outline" className="text-[9px] bg-green-500/20 text-green-400 border-green-500/30">Done</Badge>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Habit Tracker */}
      <HabitTrackerWidget />

      {/* Habit Reports */}
      <HabitReportsWidget />

      {/* Mood History */}
      <MoodHistoryChart />

      {/* Recent Activity */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-foreground flex-1">{a.text}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
