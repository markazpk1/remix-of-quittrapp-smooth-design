import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Calendar, Trophy, Target, TrendingUp, Zap, Clock, ArrowUp } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyData = [
  { week: "W1", clean: 7, cravings: 3 },
  { week: "W2", clean: 7, cravings: 2 },
  { week: "W3", clean: 6, cravings: 4 },
  { week: "W4", clean: 7, cravings: 1 },
];

const moodData = [
  { day: "1", mood: 3 }, { day: "3", mood: 4 }, { day: "5", mood: 3 }, { day: "7", mood: 5 },
  { day: "9", mood: 4 }, { day: "11", mood: 6 }, { day: "13", mood: 5 }, { day: "14", mood: 7 },
];

const achievements = [
  { title: "First Step", desc: "Started your journey", unlocked: true, icon: "🚀" },
  { title: "3 Day Warrior", desc: "3 days without relapse", unlocked: true, icon: "⚔️" },
  { title: "Week Champion", desc: "1 full week clean", unlocked: true, icon: "🏆" },
  { title: "2 Week Hero", desc: "14 days strong", unlocked: true, icon: "🦸" },
  { title: "Month Master", desc: "30 days clean", unlocked: false, icon: "👑" },
  { title: "Lesson Lover", desc: "Complete 50 lessons", unlocked: true, icon: "📚" },
  { title: "Community Star", desc: "Help 10 people", unlocked: false, icon: "⭐" },
  { title: "Sound Healer", desc: "100 min of sound therapy", unlocked: true, icon: "🎵" },
  { title: "Century Club", desc: "100 days clean", unlocked: false, icon: "💯" },
  { title: "AI Partner", desc: "50 AI conversations", unlocked: false, icon: "🤖" },
];

const stats = [
  { label: "Current Streak", value: "14 days", icon: Flame, color: "text-orange-400 bg-orange-500/20" },
  { label: "Best Streak", value: "14 days", icon: Trophy, color: "text-yellow-400 bg-yellow-500/20" },
  { label: "Total Clean Days", value: "27 / 42", icon: Calendar, color: "text-primary bg-primary/20" },
  { label: "Cravings Resisted", value: "34", icon: Target, color: "text-green-400 bg-green-500/20" },
  { label: "Avg Daily Score", value: "82/100", icon: TrendingUp, color: "text-blue-400 bg-blue-500/20" },
  { label: "Time Saved", value: "42 hrs", icon: Clock, color: "text-purple-400 bg-purple-500/20" },
];

export default function UserProgress() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Progress</h1>
        <p className="text-sm text-muted-foreground">Track your journey and celebrate every win.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="bg-card/60 border-border/40">
            <CardContent className="p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${s.color.split(" ")[1]}`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color.split(" ")[0]}`} />
              </div>
              <div className="text-lg font-bold text-foreground">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Weekly Clean Days */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Clean Days vs Cravings (This Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="clean" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Clean Days" />
                <Bar dataKey="cravings" fill="hsl(0 60% 50%)" radius={[4, 4, 0, 0]} opacity={0.6} name="Cravings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Mood Trend */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Mood Trend (14 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="mood" stroke="hsl(150, 60%, 45%)" fill="hsl(150, 60%, 45%)" fillOpacity={0.15} strokeWidth={2} name="Mood" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-foreground">Achievements</CardTitle>
            <Badge variant="outline" className="text-[10px] bg-primary/20 text-primary border-primary/30">
              {achievements.filter((a) => a.unlocked).length}/{achievements.length} Unlocked
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {achievements.map((a) => (
              <div key={a.title} className={`p-3 rounded-xl border text-center transition-colors ${a.unlocked ? "bg-primary/5 border-primary/20" : "bg-secondary/20 border-border/20 opacity-50"}`}>
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-xs font-medium text-foreground">{a.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
