import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, TrendingUp, TrendingDown, Calendar } from "lucide-react";

const userGrowth = [
  { month: "Jul", users: 1200, active: 980 },
  { month: "Aug", users: 1800, active: 1400 },
  { month: "Sep", users: 2600, active: 2100 },
  { month: "Oct", users: 3400, active: 2800 },
  { month: "Nov", users: 4800, active: 3900 },
  { month: "Dec", users: 6200, active: 5100 },
  { month: "Jan", users: 8100, active: 6800 },
  { month: "Feb", users: 10400, active: 8700 },
];

const revenueData = [
  { month: "Jul", revenue: 4200, costs: 1800 },
  { month: "Aug", revenue: 6800, costs: 2100 },
  { month: "Sep", revenue: 9400, costs: 2600 },
  { month: "Oct", revenue: 12800, costs: 3200 },
  { month: "Nov", revenue: 16200, costs: 3800 },
  { month: "Dec", revenue: 19800, costs: 4100 },
  { month: "Jan", revenue: 24600, costs: 4800 },
  { month: "Feb", revenue: 29400, costs: 5200 },
];

const retentionData = [
  { day: "Day 1", rate: 100 },
  { day: "Day 3", rate: 72 },
  { day: "Day 7", rate: 58 },
  { day: "Day 14", rate: 44 },
  { day: "Day 30", rate: 36 },
  { day: "Day 60", rate: 28 },
  { day: "Day 90", rate: 22 },
];

const planDistribution = [
  { name: "Free", value: 4200, color: "hsl(var(--muted-foreground))" },
  { name: "Starter", value: 3100, color: "hsl(210, 80%, 55%)" },
  { name: "Pro", value: 2400, color: "hsl(var(--primary))" },
  { name: "Enterprise", value: 700, color: "hsl(150, 60%, 45%)" },
];

const featureUsage = [
  { feature: "Panic Button", usage: 89 },
  { feature: "Lessons", usage: 76 },
  { feature: "Community", usage: 72 },
  { feature: "Sound Therapy", usage: 65 },
  { feature: "AI Companion", usage: 58 },
  { feature: "Progress", usage: 52 },
];

const kpis = [
  { label: "MRR", value: "$29,400", change: "+19.5%", up: true },
  { label: "DAU / MAU", value: "42.3%", change: "+3.1%", up: true },
  { label: "Churn Rate", value: "4.2%", change: "-0.8%", up: false },
  { label: "ARPU", value: "$12.40", change: "+$1.20", up: true },
  { label: "LTV", value: "$148", change: "+$12", up: true },
  { label: "CAC", value: "$18.50", change: "-$2.30", up: false },
];

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Deep insights into platform performance and user behavior.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="30d">
            <SelectTrigger className="w-36 bg-secondary/40 border-border/30 text-sm">
              <Calendar className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/40">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="border-border/30 text-sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card/60 border-border/40">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">{kpi.label}</div>
              <div className="text-lg font-bold text-foreground">{kpi.value}</div>
              <div className={`flex items-center gap-1 text-xs mt-1 ${kpi.up ? (kpi.label === "Churn Rate" || kpi.label === "CAC" ? "text-green-400" : "text-green-400") : (kpi.label === "Churn Rate" || kpi.label === "CAC" ? "text-green-400" : "text-red-400")}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} name="Total Users" />
                <Area type="monotone" dataKey="active" stroke="hsl(150, 60%, 45%)" fill="hsl(150, 60%, 45%)" fillOpacity={0.1} strokeWidth={2} name="Active Users" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Revenue vs Costs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `$${v.toLocaleString()}`} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="costs" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.5} name="Costs" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Retention Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" stroke="none">
                  {planDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Feature Usage %</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-2">
              {featureUsage.map((f) => (
                <div key={f.feature}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{f.feature}</span>
                    <span className="text-foreground font-medium">{f.usage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${f.usage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
