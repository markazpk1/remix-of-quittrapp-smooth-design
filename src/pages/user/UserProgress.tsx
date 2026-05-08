import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, Calendar, Trophy, Target, TrendingUp, Zap, Clock, ArrowUp } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

export default function UserProgress() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const response = await api.getUserProgress();
      if (response.error) {
        toast.error('Failed to load progress data');
        return;
      }
      
      const data = response.data || {};
      
      // Also fetch dashboard data for streaks and stats
      const dashResponse = await api.getUserDashboard();
      const dashData = dashResponse.data || {};

      setProgressData({
        monthlyData: data.monthlyData || [
          { week: "Week 1", clean: 0, cravings: 0 },
          { week: "Week 2", clean: 0, cravings: 0 },
          { week: "Week 3", clean: 0, cravings: 0 },
          { week: "Week 4", clean: 0, cravings: 0 },
        ],
        moodData: data.moodData || [],
        achievements: data.achievements || [],
        stats: [
          { label: "Day Streak", value: dashData.streak?.prayer_streak || "0", icon: "Flame", color: "bg-orange-500/20 text-orange-400" },
          { label: "Prayer Consistency", value: `${data.prayerConsistency || 0}%`, icon: "Calendar", color: "bg-primary/20 text-primary" },
          { label: "Lessons", value: data.lessonsCompleted || "0", icon: "Trophy", color: "bg-green-500/20 text-green-400" },
          { label: "Community", value: data.communityPosts || "0", icon: "Target", color: "bg-blue-500/20 text-blue-400" },
          { label: "Productivity", value: `${dashData.dailyGoals?.productivity_score || 0}%`, icon: "TrendingUp", color: "bg-purple-500/20 text-purple-400" },
          { label: "Library", value: `${data.quranProgress || 0}%`, icon: "Clock", color: "bg-amber-500/20 text-amber-400" },
        ],
        streaks: data.streaks || {}
      });
    } catch (error) {
      console.error('Progress data error:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const monthlyData = progressData?.monthlyData || [];
  const moodData = progressData?.moodData || [];
  const achievements = progressData?.achievements || [];
  const stats = progressData?.stats || [];
  const streaks = progressData?.streaks || {};
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">My Progress</h1>
        <p className="text-sm text-muted-foreground">Track your journey and celebrate every win.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s, index) => {
          const getIcon = (iconName: string) => {
            switch (iconName) {
              case 'Flame': return Flame;
              case 'Trophy': return Trophy;
              case 'Calendar': return Calendar;
              case 'Target': return Target;
              case 'TrendingUp': return TrendingUp;
              case 'Clock': return Clock;
              default: return Flame;
            }
          };
          const Icon = getIcon(s.icon);
          return (
            <Card key={index} className="bg-card/60 border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
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
