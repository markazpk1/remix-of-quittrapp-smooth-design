import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  MessageCircle, 
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
  Smartphone,
  Lock,
  Trash2,
  RefreshCw,
  CheckCheck
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

export default function AdminWhatsappMarketing() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [campaignList, setCampaignList] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Dialog states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCampaignOpen, setIsCampaignOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  // Form states
  const [settings, setSettings] = useState({
    phone_number_id: "",
    waba_id: "",
    access_token: ""
  });

  const [newCampaign, setNewCampaign] = useState({
    name: "",
    template_id: "",
    status: "draft"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, campaignsRes, templatesRes, settingsRes, auditRes] = await Promise.all([
        api.getWhatsappStats(),
        api.getWhatsappCampaigns(),
        api.getWhatsappTemplates(),
        api.getWhatsappSettings(),
        api.getAuditLogs({ limit: 5 })
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (campaignsRes.success) setCampaignList(campaignsRes.data);
      if (templatesRes.success) setTemplates(templatesRes.data);
      if (settingsRes.success && settingsRes.data) setSettings(settingsRes.data);
      if (auditRes.success) setActivities(auditRes.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load marketing data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSave = async () => {
    try {
      const res = await api.updateWhatsappSettings(settings);
      if (res.success) {
        toast({ title: "Success", description: "WhatsApp settings saved successfully" });
        setIsSettingsOpen(false);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    }
  };

  const handleCampaignCreate = async () => {
    if (!newCampaign.name || !newCampaign.template_id) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      const res = await api.createWhatsappCampaign(newCampaign);
      if (res.success) {
        toast({ title: "Success", description: "Campaign created successfully" });
        setIsCampaignOpen(false);
        setNewCampaign({ name: "", template_id: "", status: "draft" });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to create campaign", variant: "destructive" });
    }
  };

  const handleCampaignDelete = async () => {
    if (!campaignToDelete) return;
    try {
      const res = await api.deleteEmailCampaign(campaignToDelete); // Reusing delete or adding specific
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
    MessageCircle: MessageCircle,
    Eye: Eye,
    MousePointer2: MousePointer2,
    CheckCheck: CheckCheck
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">WhatsApp Marketing</h1>
          <p className="text-sm text-muted-foreground">Reach your audience directly on WhatsApp with templates and campaigns.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border/30 bg-background/50" onClick={() => setIsSettingsOpen(true)}>
            <Settings2 className="w-4 h-4 mr-2" />
            API Settings
          </Button>
          <Button onClick={() => setIsCampaignOpen(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
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
            const Icon = iconMap[stat.icon] || MessageCircle;
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
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/40 border-border/40 overflow-hidden">
            <CardHeader className="border-b border-border/40 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent WhatsApp Campaigns</CardTitle>
                  <CardDescription>Performance tracking for your mobile outreach</CardDescription>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={fetchData}>
                  <RefreshCw className="w-3.5 h-3.5" />
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
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Delivery</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Read Rate</th>
                      <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {loading ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={i}><td colSpan={5} className="px-6 py-8 animate-pulse bg-muted/5 h-16" /></tr>
                      ))
                    ) : campaignList.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground text-sm">No campaigns found.</td></tr>
                    ) : (
                      campaignList.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-500">
                                <MessageCircle className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">{campaign.name}</div>
                                <div className="text-[10px] text-muted-foreground">{campaign.templateName} • {campaign.lastSent}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="secondary" className="text-[10px] rounded-full border-0 bg-emerald-400/10 text-emerald-400">
                              {campaign.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium">{campaign.delivered} / {campaign.sent}</div>
                            <div className="w-24 h-1 bg-muted rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-emerald-500" style={{ width: `${(campaign.delivered/campaign.sent)*100}%` }} />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-purple-400">
                            {campaign.delivered > 0 ? `${((campaign.read/campaign.delivered)*100).toFixed(1)}%` : "0%"}
                          </td>
                          <td className="px-6 py-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
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

        <div className="space-y-6">
          <Card className="bg-card/40 border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">WhatsApp Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start border-border/30 bg-background/50 hover:bg-muted/50 group" onClick={() => window.location.href='/admin/whatsapp-templates'}>
                <Smartphone className="w-4 h-4 mr-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                Manage Templates
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/30 bg-background/50 hover:bg-muted/50 group">
                <Users className="w-4 h-4 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                Contact Lists
              </Button>
              <Button variant="outline" className="w-full justify-start border-border/30 bg-background/50 hover:bg-muted/50 group">
                <BarChart3 className="w-4 h-4 mr-3 text-purple-400 group-hover:scale-110 transition-transform" />
                Detailed Reports
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500/10 border-emerald-500/20 p-6 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Smartphone className="w-24 h-24 rotate-12" />
            </div>
            <h4 className="text-sm font-bold text-emerald-400 mb-2">Meta Cloud API</h4>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Connected via Official WhatsApp Business API. Ensure your tokens are valid.
            </p>
            <Button size="sm" variant="outline" className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              Test Connection
            </Button>
          </Card>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-xl bg-card border-border/40 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>WhatsApp Business API Settings</DialogTitle>
            <DialogDescription>Configure your Meta Cloud API credentials.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Phone Number ID</Label>
              <Input value={settings.phone_number_id} onChange={(e) => setSettings({...settings, phone_number_id: e.target.value})} className="bg-background/50 border-border/20" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">WABA ID (Business Account ID)</Label>
              <Input value={settings.waba_id} onChange={(e) => setSettings({...settings, waba_id: e.target.value})} className="bg-background/50 border-border/20" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Permanent Access Token</Label>
              <div className="relative">
                <Input type="password" value={settings.access_token} onChange={(e) => setSettings({...settings, access_token: e.target.value})} className="bg-background/50 border-border/20 pr-10" />
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
            <Button onClick={handleSettingsSave} className="bg-emerald-500 text-white">Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Dialog */}
      <Dialog open={isCampaignOpen} onOpenChange={setIsCampaignOpen}>
        <DialogContent className="max-w-xl bg-card border-border/40 backdrop-blur-xl">
          <DialogHeader><DialogTitle>New WhatsApp Campaign</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input placeholder="e.g. Monthly Update" value={newCampaign.name} onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Select WhatsApp Template</Label>
              <Select value={newCampaign.template_id} onValueChange={(val) => setNewCampaign({...newCampaign, template_id: val})}>
                <SelectTrigger><SelectValue placeholder="Choose template..." /></SelectTrigger>
                <SelectContent>
                  {templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCampaignCreate} className="bg-emerald-500 text-white">Create Campaign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
