import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Mail, 
  Send, 
  Users, 
  MousePointer2, 
  Eye, 
  AlertCircle, 
  Plus, 
  BarChart3, 
  History, 
  Settings2,
  MoreVertical,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Server,
  Lock,
  Trash2,
  RefreshCw
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminEmailMarketing() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [growth, setGrowth] = useState<any[]>([]);
  const [campaignList, setCampaignList] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Dialog states
  const [isSmtpOpen, setIsSmtpOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  // Form states
  const [smtpSettings, setSmtpSettings] = useState({
    host: "",
    port: 587,
    user: "",
    pass: "",
    from_email: "",
    from_name: ""
  });

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    type: "broadcast",
    templateId: "",
    status: "draft"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, growthRes, campaignsRes, templatesRes, smtpRes, auditRes] = await Promise.all([
        api.getEmailMarketingStats(),
        api.getSubscriberGrowth(),
        api.getEmailCampaigns(),
        api.getEmailTemplates(),
        api.getSmtpSettings(),
        api.getAuditLogs({ limit: 5 })
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (growthRes.success) setGrowth(growthRes.data);
      if (campaignsRes.success) setCampaignList(campaignsRes.data);
      if (templatesRes.success) setTemplates(templatesRes.data);
      if (smtpRes.success && smtpRes.data) setSmtpSettings(smtpRes.data);
      if (auditRes.success) setActivities(auditRes.data);
    } catch (error) {
      console.error("Failed to fetch email marketing data:", error);
      toast({ title: "Error", description: "Failed to load marketing data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSmtpSave = async () => {
    try {
      const res = await api.updateSmtpSettings(smtpSettings);
      if (res.success) {
        toast({ title: "Success", description: "SMTP settings saved successfully" });
        setIsSmtpOpen(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save SMTP settings", variant: "destructive" });
    }
  };

  const handleCampaignCreate = async () => {
    if (!newCampaign.name || !newCampaign.templateId) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      const res = await api.createEmailCampaign(newCampaign);
      if (res.success) {
        toast({ title: "Success", description: "Campaign created successfully" });
        setIsCampaignOpen(false);
        setNewCampaign({ name: "", type: "broadcast", templateId: "", status: "draft" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" });
    }
  };

  const handleCampaignDelete = async () => {
    if (!campaignToDelete) return;
    try {
      const res = await api.deleteEmailCampaign(campaignToDelete);
      if (res.success) {
        toast({ title: "Success", description: "Campaign deleted successfully" });
        setIsDeleteOpen(false);
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete campaign", variant: "destructive" });
    }
  };

  // Map icon strings to components
  const iconMap: Record<string, any> = {
    Users: Users,
    Eye: Eye,
    MousePointer2: MousePointer2,
    Send: Send
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Email Marketing</h1>
          <p className="text-sm text-muted-foreground">Manage your subscriber lists, campaigns, and automation flows.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border/30 bg-background/50" onClick={() => setIsSmtpOpen(true)}>
            <Settings2 className="w-4 h-4 mr-2" />
            SMTP Settings
          </Button>
          <Button onClick={() => setIsCampaignOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="bg-card/40 border-border/40 animate-pulse">
              <CardContent className="p-5 h-32" />
            </Card>
          ))
        ) : (
          stats.map((stat, i) => {
            const Icon = iconMap[stat.icon] || Mail;
            return (
              <Card key={i} className="bg-card/40 border-border/40 overflow-hidden relative">
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-5 rounded-full bg-current ${stat.color}`} />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-background/50 border border-border/20 ${stat.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${stat.up ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                      {stat.change}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-foreground mt-1">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/40 border-border/40 overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Subscriber Growth</CardTitle>
                  <CardDescription>Visualizing your audience growth over the last 14 days</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchData}>
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-400/10 border border-emerald-400/20 text-[10px] text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live Updates
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 pt-6">
              <div className="h-[300px] w-full px-4">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growth}>
                      <defs>
                        <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderColor: "hsl(var(--border))",
                          borderRadius: "12px",
                          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                        }}
                        itemStyle={{ color: "hsl(var(--primary))" }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="subscribers" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSub)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Campaigns</CardTitle>
                  <CardDescription>Status and performance of your latest email sends</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
                  View All <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/30 border-y border-border/40">
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Campaign</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Reach</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Performance</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {loading ? (
                      Array(4).fill(0).map((_, i) => (
                        <tr key={i}>
                          <td colSpan={5} className="px-6 py-4 animate-pulse bg-muted/10 h-16" />
                        </tr>
                      ))
                    ) : campaignList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground text-sm">
                          No campaigns found. Create your first campaign to get started.
                        </td>
                      </tr>
                    ) : (
                      campaignList.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                <Mail className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">{campaign.name}</div>
                                <div className="text-[10px] text-muted-foreground">{campaign.type} • {campaign.lastSent}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge 
                              variant="secondary" 
                              className={`text-[10px] rounded-full border-0 ${
                                campaign.status === "Active" ? "bg-emerald-400/10 text-emerald-400" :
                                campaign.status === "Sent" ? "bg-blue-400/10 text-blue-400" :
                                campaign.status === "Draft" ? "bg-muted text-muted-foreground" :
                                "bg-amber-400/10 text-amber-400"
                              }`}
                            >
                              {campaign.status === "Active" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {campaign.status === "Sent" && <Send className="w-3 h-3 mr-1" />}
                              {campaign.status === "Draft" && <Clock className="w-3 h-3 mr-1" />}
                              {campaign.status === "Paused" && <AlertCircle className="w-3 h-3 mr-1" />}
                              {campaign.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium">{campaign.sent?.toLocaleString() || 0}</div>
                            <div className="text-[10px] text-muted-foreground">Recipients</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div>
                                <div className="text-sm font-medium text-emerald-400">{campaign.openRate}</div>
                                <div className="text-[10px] text-muted-foreground">Open Rate</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-blue-400">{campaign.clickRate}</div>
                                <div className="text-[10px] text-muted-foreground">Click Rate</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem>View Report</DropdownMenuItem>
                                <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => {
                                    setCampaignToDelete(campaign.id);
                                    setIsDeleteOpen(true);
                                  }}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar area */}
        <div className="space-y-6">
          <Card className="bg-card/40 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start border-border/30 bg-background/50 hover:bg-muted/50 group">
                <Users className="w-4 h-4 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                Import Subscribers
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/30 bg-background/50 hover:bg-muted/50 group" onClick={() => window.location.href='/admin/email-templates'}>
                <Mail className="w-4 h-4 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                Email Templates
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/30 bg-background/50 hover:bg-muted/50 group">
                <BarChart3 className="w-4 h-4 mr-3 text-purple-400 group-hover:scale-110 transition-transform" />
                Analytics Dashboard
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/30 bg-background/50 hover:bg-muted/50 group">
                <History className="w-4 h-4 mr-3 text-amber-400 group-hover:scale-110 transition-transform" />
                View Send History
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Mail className="w-32 h-32 rotate-12" />
            </div>
            <CardContent className="p-6">
              <h4 className="text-sm font-bold text-foreground mb-2">Need a pro template?</h4>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Unlock 50+ premium recovery-focused email templates with our Marketing Pro add-on.
              </p>
              <Button size="sm" className="w-full bg-primary text-primary-foreground font-semibold">
                Explore Marketplace
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-xs">No recent activity</div>
              ) : (
                activities.map((activity, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground leading-tight truncate">{activity.text}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SMTP Settings Dialog */}
      <Dialog open={isSmtpOpen} onOpenChange={setIsSmtpOpen}>
        <DialogContent className="max-w-xl bg-card border-border/40 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              SMTP Server Configuration
            </DialogTitle>
            <DialogDescription>
              Configure your email server to send campaigns and transactional emails.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">SMTP Host</Label>
                <Input 
                  placeholder="smtp.example.com" 
                  value={smtpSettings.host}
                  onChange={(e) => setSmtpSettings({...smtpSettings, host: e.target.value})}
                  className="bg-background/50 border-border/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Port</Label>
                <Input 
                  type="number" 
                  placeholder="587" 
                  value={smtpSettings.port}
                  onChange={(e) => setSmtpSettings({...smtpSettings, port: parseInt(e.target.value)})}
                  className="bg-background/50 border-border/20"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</Label>
                <Input 
                  placeholder="user@example.com" 
                  value={smtpSettings.user}
                  onChange={(e) => setSmtpSettings({...smtpSettings, user: e.target.value})}
                  className="bg-background/50 border-border/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</Label>
                <div className="relative">
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={smtpSettings.pass}
                    onChange={(e) => setSmtpSettings({...smtpSettings, pass: e.target.value})}
                    className="bg-background/50 border-border/20 pr-10"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From Email</Label>
                <Input 
                  placeholder="noreply@quittrapp.com" 
                  value={smtpSettings.from_email}
                  onChange={(e) => setSmtpSettings({...smtpSettings, from_email: e.target.value})}
                  className="bg-background/50 border-border/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">From Name</Label>
                <Input 
                  placeholder="QuittrApp Team" 
                  value={smtpSettings.from_name}
                  onChange={(e) => setSmtpSettings({...smtpSettings, from_name: e.target.value})}
                  className="bg-background/50 border-border/20"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                <ShieldCheck className="w-3 h-3 inline mr-1 text-emerald-400" />
                Connection settings are used for sending transactional and marketing emails.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <div className="flex items-center gap-2 mr-auto">
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-400/20 bg-emerald-400/5">
                <ShieldCheck className="w-3 h-3 mr-1" /> Secure Connection
              </Badge>
            </div>
            <Button variant="ghost" onClick={() => setIsSmtpOpen(false)} className="border border-border/20">Cancel</Button>
            <Button onClick={handleSmtpSave} className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={isCampaignOpen} onOpenChange={setIsCampaignOpen}>
        <DialogContent className="max-w-xl bg-card border-border/40 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Create New Campaign
            </DialogTitle>
            <DialogDescription>
              Launch a new email broadcast or automation to your subscribers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Campaign Name</Label>
              <Input 
                placeholder="e.g. Monthly Newsletter - June" 
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                className="bg-background/50 border-border/20"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Campaign Type</Label>
                <Select 
                  value={newCampaign.type} 
                  onValueChange={(val) => setNewCampaign({...newCampaign, type: val})}
                >
                  <SelectTrigger className="bg-background/50 border-border/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="broadcast">Broadcast (One-time)</SelectItem>
                    <SelectItem value="automation">Automation (Triggered)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                <Select 
                  value={newCampaign.status} 
                  onValueChange={(val) => setNewCampaign({...newCampaign, status: val})}
                >
                  <SelectTrigger className="bg-background/50 border-border/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active / Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Template</Label>
              <Select 
                value={newCampaign.templateId} 
                onValueChange={(val) => setNewCampaign({...newCampaign, templateId: val})}
              >
                <SelectTrigger className="bg-background/50 border-border/20">
                  <SelectValue placeholder="Choose a template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground text-center">No templates available</div>
                  ) : (
                    templates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Don't see your template? <a href="/admin/email-templates" className="text-primary hover:underline">Create one here</a>.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCampaignOpen(false)} className="border border-border/20">Cancel</Button>
            <Button onClick={handleCampaignCreate} className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Campaign Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md bg-card border-border/40 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone and you will lose all analytics for this send.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="border border-border/20">Cancel</Button>
            <Button variant="destructive" onClick={handleCampaignDelete} className="shadow-lg shadow-destructive/20">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
