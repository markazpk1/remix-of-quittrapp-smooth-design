import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, DollarSign, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Eye, BookOpen, MessageSquare, AlertTriangle, Clock, CheckCircle2, Zap, Globe, Smartphone, Monitor, Handshake, Trophy, UserPlus, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { api } from "@/services/api";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topContent, setTopContent] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [deviceData] = useState([
    { name: "Mobile", value: 62, color: "hsl(var(--primary))" },
    { name: "Desktop", value: 28, color: "hsl(210, 80%, 55%)" },
    { name: "Tablet", value: 10, color: "hsl(150, 60%, 45%)" },
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, growthRes, contentRes, activityRes, pendingRes] = await Promise.all([
        api.getDashboardStats(),
        api.getUserGrowth(),
        api.getTopContent(),
        api.getRecentActivity(),
        api.getPendingItems(),
      ]);

      // Format stats
      setStats([
        { label: "Total Users", value: statsRes.totalUsers?.toLocaleString() || "0", change: "+0%", up: true, icon: Users },
        { label: "Total Threads", value: statsRes.totalThreads?.toLocaleString() || "0", change: "+0%", up: true, icon: MessageSquare },
        { label: "Active Users", value: statsRes.activeUsers?.toLocaleString() || "0", change: "+0%", up: true, icon: Activity },
        { label: "Pending Reports", value: statsRes.pendingReports?.toString() || "0", change: "0", up: false, icon: AlertTriangle },
      ]);

      setChartData(growthRes);
      setTopContent(contentRes);
      setRecentActivity(activityRes);
      setPendingItems(pendingRes);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your platform metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
            <CheckCircle2 className="w-3 h-3 mr-1" /> All Systems Operational
          </Badge>
          <Button variant="outline" size="sm" className="text-xs border-border/30" onClick={fetchDashboardData} disabled={loading}>
            <Zap className="w-3 h-3 mr-1.5" /> {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s) => (
              <Card key={s.label} className="bg-card/60 border-border/40">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <s.icon className="w-5 h-5 text-muted-foreground" />
                    <span className={`text-xs font-medium flex items-center gap-0.5 ${s.up ? "text-green-400" : "text-red-400"}`}>
                      {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {s.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold font-display text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-card/60 border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(270, 80%, 60%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(270, 80%, 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 16%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(240, 5%, 55%)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(240, 5%, 55%)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(240, 15%, 8%)", border: "1px solid hsl(240, 10%, 16%)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "hsl(0, 0%, 95%)" }} />
                    <Area type="monotone" dataKey="users" stroke="hsl(270, 80%, 60%)" fill="url(#userGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/60 border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" stroke="none">
                      {deviceData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(240, 15%, 8%)", border: "1px solid hsl(240, 10%, 16%)", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                  {deviceData.map((d) => {
                    const Icon = d.name === "Mobile" ? Smartphone : d.name === "Desktop" ? Monitor : Globe;
                    return (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Icon className="w-3 h-3" />
                        <span>{d.name}</span>
                        <span className="text-foreground font-medium">{d.value}%</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Row: Pending Items + Top Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Pending Items */}
            <Card className="bg-card/60 border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Requires Attention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/20 border border-border/20">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`w-4 h-4 ${item.color}`} />
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs bg-secondary text-foreground border-border/30">{item.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Content */}
            <Card className="bg-card/60 border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topContent.length > 0 ? topContent.map((item, i) => (
                  <div key={item.title} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground font-medium truncate">{item.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[9px] bg-secondary text-muted-foreground border-border/30">{item.type}</Badge>
                        <span className="text-[10px] text-muted-foreground">{item.views?.toLocaleString() || 0} views</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-foreground">{item.completion}%</div>
                      <Progress value={item.completion} className="h-1 w-14 mt-1" />
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-sm text-muted-foreground py-4">No content yet</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-foreground">Recent Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length > 0 ? recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                        {a.avatar}
                      </div>
                      <div>
                        <div className="text-sm text-foreground font-medium">{a.user}</div>
                        <div className="text-xs text-muted-foreground">{a.action}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{a.time}</div>
                  </div>
                )) : (
                  <div className="text-center text-sm text-muted-foreground py-4">No recent activity</div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
