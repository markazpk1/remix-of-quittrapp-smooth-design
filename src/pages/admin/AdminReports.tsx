import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface KpiData {
  label: string; value: string; change: string; up: boolean;
}

interface UserGrowthData {
  month: string; users: number; active: number;
}

interface RevenueData {
  month: string; revenue: number; costs: number;
}

interface RetentionData {
  day: string; rate: number;
}

interface PlanData {
  name: string; value: number; color: string;
}

interface FeatureData {
  feature: string; usage: number;
}

export default function AdminReports() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KpiData[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureData[]>([]);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [kpisRes, userGrowthRes, revenueRes, retentionRes, planRes, featureRes] = await Promise.all([
        api.getKpis(),
        api.getReportsUserGrowth(),
        api.getRevenue(),
        api.getRetention(),
        api.getPlanDistribution(),
        api.getFeatureUsage(),
      ]);

      setKpis(Array.isArray(kpisRes) ? kpisRes : []);
      setUserGrowth(Array.isArray(userGrowthRes) ? userGrowthRes : []);
      setRevenueData(Array.isArray(revenueRes) ? revenueRes : []);
      setRetentionData(Array.isArray(retentionRes) ? retentionRes : []);
      setPlanDistribution(Array.isArray(planRes) ? planRes : []);
      setFeatureUsage(Array.isArray(featureRes) ? featureRes : []);
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
      toast({ title: "Error", description: "Failed to load reports data" });
      // Set empty arrays to prevent chart errors
      setKpis([]);
      setUserGrowth([]);
      setRevenueData([]);
      setRetentionData([]);
      setPlanDistribution([]);
      setFeatureUsage([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast({ title: "Not Implemented", description: "Report export coming soon" });
  };

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
          <Button variant="outline" className="border-border/30 text-sm" onClick={handleExport}>
            <Download className="w-3.5 h-3.5 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {loading ? (
          <div className="col-span-6 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          kpis.map((kpi) => (
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
          ))
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[260px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : userGrowth.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                No user growth data available
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Revenue vs Costs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[260px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : revenueData.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                No revenue data available
              </div>
            ) : (
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
            )}
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
            {loading ? (
              <div className="flex items-center justify-center h-[220px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : retentionData.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground">
                No retention data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="day" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => `${v}%`} />
                  <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {loading ? (
              <div className="flex items-center justify-center h-[220px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : planDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground">
                No plan data available
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 border-border/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Feature Usage %</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[220px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : featureUsage.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground">
                No feature usage data available
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
