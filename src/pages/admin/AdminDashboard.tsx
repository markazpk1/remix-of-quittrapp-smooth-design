import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, DollarSign, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Eye, BookOpen, MessageSquare, AlertTriangle, Clock, CheckCircle2, Zap, Globe, Smartphone, Monitor, Handshake, Trophy, UserPlus, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const stats = [
  { label: "Total Users", value: "12,847", change: "+12.5%", up: true, icon: Users },
  { label: "Revenue", value: "$48,259", change: "+8.2%", up: true, icon: DollarSign },
  { label: "Growth Rate", value: "23.5%", change: "+4.1%", up: true, icon: TrendingUp },
  { label: "Active Now", value: "1,284", change: "-2.3%", up: false, icon: Activity },
];

const chartData = [
  { name: "Jan", users: 400, revenue: 2400 },
  { name: "Feb", users: 600, revenue: 3200 },
  { name: "Mar", users: 800, revenue: 4100 },
  { name: "Apr", users: 1100, revenue: 4800 },
  { name: "May", users: 1400, revenue: 5600 },
  { name: "Jun", users: 1900, revenue: 7200 },
  { name: "Jul", users: 2400, revenue: 8100 },
  { name: "Aug", users: 2900, revenue: 9400 },
  { name: "Sep", users: 3500, revenue: 10800 },
  { name: "Oct", users: 4200, revenue: 12400 },
  { name: "Nov", users: 5000, revenue: 14200 },
  { name: "Dec", users: 5800, revenue: 16800 },
];

const recentActivity = [
  { user: "Sarah Chen", action: "Upgraded to Pro", time: "2 min ago", avatar: "SC" },
  { user: "Marcus Rivera", action: "New signup", time: "5 min ago", avatar: "MR" },
  { user: "Aiko Tanaka", action: "Submitted support ticket", time: "12 min ago", avatar: "AT" },
  { user: "James O'Brien", action: "Payment received — $29", time: "18 min ago", avatar: "JO" },
  { user: "Priya Sharma", action: "Canceled subscription", time: "25 min ago", avatar: "PS" },
  { user: "Leo Martinez", action: "New signup", time: "32 min ago", avatar: "LM" },
];

const topContent = [
  { title: "Admit It's a Problem", type: "Lesson", views: 12400, completion: 87 },
  { title: "Identifying Triggers", type: "Lesson", views: 11200, completion: 74 },
  { title: "Ocean Waves", type: "Sound", views: 9800, completion: 92 },
  { title: "AI Companion Chat", type: "Feature", views: 9120, completion: 68 },
  { title: "Forest Rain", type: "Sound", views: 8600, completion: 95 },
];

const deviceData = [
  { name: "Mobile", value: 62, color: "hsl(var(--primary))" },
  { name: "Desktop", value: 28, color: "hsl(210, 80%, 55%)" },
  { name: "Tablet", value: 10, color: "hsl(150, 60%, 45%)" },
];

const pendingItems = [
  { label: "Support tickets", count: 3, icon: AlertTriangle, color: "text-red-400" },
  { label: "Flagged posts", count: 2, icon: MessageSquare, color: "text-yellow-400" },
  { label: "Pending reviews", count: 5, icon: Clock, color: "text-blue-400" },
  { label: "Draft lessons", count: 2, icon: BookOpen, color: "text-primary" },
];

const serverHealth = [
  { label: "API Response", value: "42ms", status: "good" },
  { label: "Uptime", value: "99.98%", status: "good" },
  { label: "DB Connections", value: "23/100", status: "good" },
  { label: "Error Rate", value: "0.02%", status: "good" },
];

const topAffiliates = [
  { name: "Alex Johnson", tier: "Platinum", referrals: 284, earnings: "$4,820", avatar: "AJ" },
  { name: "Maria Garcia", tier: "Gold", referrals: 196, earnings: "$3,140", avatar: "MG" },
  { name: "David Kim", tier: "Gold", referrals: 152, earnings: "$2,430", avatar: "DK" },
  { name: "Emma Wilson", tier: "Silver", referrals: 98, earnings: "$1,560", avatar: "EW" },
];

const recentReferrals = [
  { affiliate: "Alex Johnson", referred: "Tom Baker", status: "converted", time: "8 min ago" },
  { affiliate: "Maria Garcia", referred: "Lisa Park", status: "pending", time: "22 min ago" },
  { affiliate: "David Kim", referred: "Chris Lee", status: "converted", time: "1h ago" },
  { affiliate: "Emma Wilson", referred: "Nina Patel", status: "pending", time: "2h ago" },
];

const affiliateStats = { pendingPayouts: "$6,240", totalAffiliates: 142, conversionRate: "18.4%", monthlyReferrals: 347 };

export default function AdminDashboard() {
  const navigate = useNavigate();
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
        </div>
      </div>

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
            <CardTitle className="text-sm font-medium text-foreground">Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 16%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(240, 5%, 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(240, 5%, 55%)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "hsl(240, 15%, 8%)", border: "1px solid hsl(240, 10%, 16%)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "hsl(0, 0%, 95%)" }} />
                <Bar dataKey="revenue" fill="hsl(270, 80%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row: Pending Items + Top Content + Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pending Items / Quick Actions */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Requires Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/20 border border-border/20">
                <div className="flex items-center gap-3">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <Badge variant="outline" className="text-xs bg-secondary text-foreground border-border/30">{item.count}</Badge>
              </div>
            ))}
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-xs border-border/30">
                <Zap className="w-3 h-3 mr-1.5" /> Quick Notify
              </Button>
              <Button variant="outline" size="sm" className="text-xs border-border/30">
                <Eye className="w-3 h-3 mr-1.5" /> View Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Content */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topContent.map((item, i) => (
              <div key={item.title} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground font-medium truncate">{item.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[9px] bg-secondary text-muted-foreground border-border/30">{item.type}</Badge>
                    <span className="text-[10px] text-muted-foreground">{item.views.toLocaleString()} views</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-foreground">{item.completion}%</div>
                  <Progress value={item.completion} className="h-1 w-14 mt-1" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={140}>
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

      {/* Bottom Row: Activity + Server Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((a, i) => (
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
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {serverHealth.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/20 border border-border/20">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              </div>
            ))}
            <div className="text-[10px] text-muted-foreground text-center pt-1">Last checked: 30 seconds ago</div>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Program Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top Performers */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" /> Top Affiliates
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-border/30">{affiliateStats.totalAffiliates} total</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topAffiliates.map((a, i) => (
              <div key={a.name} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-foreground">{a.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground font-medium truncate">{a.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[9px] bg-secondary text-muted-foreground border-border/30">{a.tier}</Badge>
                    <span className="text-[10px] text-muted-foreground">{a.referrals} referrals</span>
                  </div>
                </div>
                <span className="text-xs font-medium text-foreground">{a.earnings}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Referrals */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" /> Recent Referrals
              </CardTitle>
              <span className="text-[10px] text-muted-foreground">{affiliateStats.monthlyReferrals} this month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentReferrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <div>
                  <div className="text-sm text-foreground font-medium">{r.referred}</div>
                  <div className="text-[10px] text-muted-foreground">by {r.affiliate} · {r.time}</div>
                </div>
                <Badge variant="outline" className={`text-[10px] border-border/30 ${r.status === "converted" ? "bg-green-500/10 text-green-400 border-green-500/30" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"}`}>
                  {r.status}
                </Badge>
              </div>
            ))}
            <div className="text-[10px] text-muted-foreground text-center">Conversion rate: {affiliateStats.conversionRate}</div>
          </CardContent>
        </Card>

        {/* Pending Payouts */}
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" /> Affiliate Payouts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/20 border border-border/20 text-center">
              <div className="text-2xl font-bold font-display text-foreground">{affiliateStats.pendingPayouts}</div>
              <div className="text-xs text-muted-foreground mt-1">Pending Payouts</div>
            </div>
            <div className="space-y-2">
              {topAffiliates.slice(0, 3).map((a) => (
                <div key={a.name} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-secondary/20 border border-border/20">
                  <span className="text-xs text-muted-foreground">{a.name}</span>
                  <span className="text-xs font-medium text-foreground">{a.earnings}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs border-border/30" onClick={() => navigate("/admin/affiliates")}>
              <Handshake className="w-3 h-3 mr-1.5" /> Manage Affiliates
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
