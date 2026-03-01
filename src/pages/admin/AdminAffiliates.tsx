import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users, DollarSign, MousePointerClick, TrendingUp, Plus, Search, Edit, Trash2,
  Copy, Eye, Ban, CheckCircle, Download, Send, Award, ArrowUpRight, Link2, BarChart3,
  CreditCard, Clock, XCircle, RefreshCw
} from "lucide-react";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  code: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  status: "active" | "inactive" | "suspended" | "pending";
  commissionRate: number;
  totalClicks: number;
  totalSignups: number;
  totalConversions: number;
  totalEarned: number;
  totalPaid: number;
  pendingBalance: number;
  joinedAt: string;
  lastActiveAt: string;
  payoutMethod: string;
  website?: string;
}

interface Payout {
  id: string;
  affiliateId: string;
  affiliateName: string;
  amount: number;
  status: "pending" | "processing" | "paid" | "failed";
  method: string;
  requestedAt: string;
  processedAt?: string;
}

interface Referral {
  id: string;
  affiliateId: string;
  affiliateName: string;
  referredUser: string;
  type: "click" | "signup" | "conversion";
  commission: number;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
}

interface TierConfig {
  name: string;
  minConversions: number;
  commissionRate: number;
  bonus: number;
  color: string;
}

const initialAffiliates: Affiliate[] = [
  { id: "1", name: "Alex Johnson", email: "alex@blog.com", code: "ALEX25", tier: "gold", status: "active", commissionRate: 25, totalClicks: 4520, totalSignups: 312, totalConversions: 89, totalEarned: 2225, totalPaid: 1800, pendingBalance: 425, joinedAt: "2025-06-15", lastActiveAt: "2026-02-28", payoutMethod: "PayPal", website: "alexblog.com" },
  { id: "2", name: "Maria Garcia", email: "maria@wellness.co", code: "MARIA20", tier: "silver", status: "active", commissionRate: 20, totalClicks: 2180, totalSignups: 156, totalConversions: 43, totalEarned: 860, totalPaid: 700, pendingBalance: 160, joinedAt: "2025-09-01", lastActiveAt: "2026-02-27", payoutMethod: "Bank Transfer", website: "wellnessco.com" },
  { id: "3", name: "James Lee", email: "james@youtube.com", code: "JAMES30", tier: "platinum", status: "active", commissionRate: 30, totalClicks: 12400, totalSignups: 890, totalConversions: 234, totalEarned: 7020, totalPaid: 6500, pendingBalance: 520, joinedAt: "2025-03-10", lastActiveAt: "2026-03-01", payoutMethod: "PayPal", website: "youtube.com/@james" },
  { id: "4", name: "Sophie Chen", email: "sophie@insta.com", code: "SOPHIE15", tier: "bronze", status: "pending", commissionRate: 15, totalClicks: 0, totalSignups: 0, totalConversions: 0, totalEarned: 0, totalPaid: 0, pendingBalance: 0, joinedAt: "2026-02-28", lastActiveAt: "2026-02-28", payoutMethod: "PayPal" },
  { id: "5", name: "Tom Wilson", email: "tom@blog.net", code: "TOM20", tier: "silver", status: "suspended", commissionRate: 20, totalClicks: 890, totalSignups: 45, totalConversions: 12, totalEarned: 240, totalPaid: 240, pendingBalance: 0, joinedAt: "2025-11-20", lastActiveAt: "2026-01-15", payoutMethod: "Bank Transfer" },
];

const initialPayouts: Payout[] = [
  { id: "p1", affiliateId: "1", affiliateName: "Alex Johnson", amount: 425, status: "pending", method: "PayPal", requestedAt: "2026-02-28" },
  { id: "p2", affiliateId: "3", affiliateName: "James Lee", amount: 520, status: "pending", method: "PayPal", requestedAt: "2026-02-27" },
  { id: "p3", affiliateId: "2", affiliateName: "Maria Garcia", amount: 160, status: "processing", method: "Bank Transfer", requestedAt: "2026-02-25" },
  { id: "p4", affiliateId: "1", affiliateName: "Alex Johnson", amount: 600, status: "paid", method: "PayPal", requestedAt: "2026-02-10", processedAt: "2026-02-12" },
  { id: "p5", affiliateId: "3", affiliateName: "James Lee", amount: 1200, status: "paid", method: "PayPal", requestedAt: "2026-02-01", processedAt: "2026-02-03" },
];

const initialReferrals: Referral[] = [
  { id: "r1", affiliateId: "3", affiliateName: "James Lee", referredUser: "user_9281", type: "conversion", commission: 30, createdAt: "2026-03-01", status: "approved" },
  { id: "r2", affiliateId: "1", affiliateName: "Alex Johnson", referredUser: "user_9280", type: "signup", commission: 0, createdAt: "2026-03-01", status: "pending" },
  { id: "r3", affiliateId: "2", affiliateName: "Maria Garcia", referredUser: "user_9279", type: "conversion", commission: 20, createdAt: "2026-02-28", status: "approved" },
  { id: "r4", affiliateId: "3", affiliateName: "James Lee", referredUser: "user_9278", type: "click", commission: 0, createdAt: "2026-02-28", status: "approved" },
  { id: "r5", affiliateId: "1", affiliateName: "Alex Johnson", referredUser: "user_9277", type: "conversion", commission: 25, createdAt: "2026-02-27", status: "rejected" },
];

const tierConfigs: TierConfig[] = [
  { name: "Bronze", minConversions: 0, commissionRate: 15, bonus: 0, color: "text-orange-400" },
  { name: "Silver", minConversions: 25, commissionRate: 20, bonus: 50, color: "text-gray-400" },
  { name: "Gold", minConversions: 75, commissionRate: 25, bonus: 150, color: "text-yellow-400" },
  { name: "Platinum", minConversions: 200, commissionRate: 30, bonus: 500, color: "text-cyan-400" },
];

export default function AdminAffiliates() {
  const { toast } = useToast();
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [payouts, setPayouts] = useState(initialPayouts);
  const [referrals, setReferrals] = useState(initialReferrals);
  const [tiers, setTiers] = useState(tierConfigs);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
  const [showAffiliateDialog, setShowAffiliateDialog] = useState(false);
  const [editingAffiliate, setEditingAffiliate] = useState<Affiliate | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [detailAffiliate, setDetailAffiliate] = useState<Affiliate | null>(null);
  const [showTierDialog, setShowTierDialog] = useState(false);
  const [editingTier, setEditingTier] = useState<TierConfig | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void; variant?: "destructive" | "warning"; confirmLabel?: string }>({ open: false, title: "", description: "", onConfirm: () => {} });

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formTier, setFormTier] = useState<Affiliate["tier"]>("bronze");
  const [formRate, setFormRate] = useState("15");
  const [formPayoutMethod, setFormPayoutMethod] = useState("PayPal");
  const [formWebsite, setFormWebsite] = useState("");

  // Tier form state
  const [tierFormRate, setTierFormRate] = useState("");
  const [tierFormMin, setTierFormMin] = useState("");
  const [tierFormBonus, setTierFormBonus] = useState("");

  const filtered = affiliates.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchTier = filterTier === "all" || a.tier === filterTier;
    return matchSearch && matchStatus && matchTier;
  });

  const stats = {
    total: affiliates.length,
    active: affiliates.filter(a => a.status === "active").length,
    totalRevenue: affiliates.reduce((s, a) => s + a.totalEarned, 0),
    pendingPayouts: payouts.filter(p => p.status === "pending" || p.status === "processing").reduce((s, p) => s + p.amount, 0),
    totalClicks: affiliates.reduce((s, a) => s + a.totalClicks, 0),
    totalConversions: affiliates.reduce((s, a) => s + a.totalConversions, 0),
  };

  const openAdd = () => {
    setEditingAffiliate(null);
    setFormName(""); setFormEmail(""); setFormCode(""); setFormTier("bronze"); setFormRate("15"); setFormPayoutMethod("PayPal"); setFormWebsite("");
    setShowAffiliateDialog(true);
  };

  const openEdit = (a: Affiliate) => {
    setEditingAffiliate(a);
    setFormName(a.name); setFormEmail(a.email); setFormCode(a.code); setFormTier(a.tier); setFormRate(String(a.commissionRate)); setFormPayoutMethod(a.payoutMethod); setFormWebsite(a.website || "");
    setShowAffiliateDialog(true);
  };

  const saveAffiliate = () => {
    if (!formName || !formEmail || !formCode) { toast({ title: "Missing fields", variant: "destructive" }); return; }
    if (editingAffiliate) {
      setAffiliates(prev => prev.map(a => a.id === editingAffiliate.id ? { ...a, name: formName, email: formEmail, code: formCode, tier: formTier, commissionRate: Number(formRate), payoutMethod: formPayoutMethod, website: formWebsite || undefined } : a));
      toast({ title: "Affiliate updated" });
    } else {
      const newA: Affiliate = { id: Date.now().toString(), name: formName, email: formEmail, code: formCode, tier: formTier, status: "pending", commissionRate: Number(formRate), totalClicks: 0, totalSignups: 0, totalConversions: 0, totalEarned: 0, totalPaid: 0, pendingBalance: 0, joinedAt: new Date().toISOString().split("T")[0], lastActiveAt: new Date().toISOString().split("T")[0], payoutMethod: formPayoutMethod, website: formWebsite || undefined };
      setAffiliates(prev => [...prev, newA]);
      toast({ title: "Affiliate added" });
    }
    setShowAffiliateDialog(false);
  };

  const deleteAffiliate = (a: Affiliate) => setConfirm({ open: true, title: "Delete affiliate?", description: `Remove ${a.name} and all their referral data permanently.`, variant: "destructive", onConfirm: () => { setAffiliates(prev => prev.filter(x => x.id !== a.id)); setPayouts(prev => prev.filter(p => p.affiliateId !== a.id)); toast({ title: "Affiliate deleted" }); } });

  const toggleStatus = (a: Affiliate, newStatus: Affiliate["status"]) => {
    if (newStatus === "suspended") {
      setConfirm({ open: true, title: "Suspend affiliate?", description: `Suspend ${a.name}? They won't earn commissions while suspended.`, variant: "warning", onConfirm: () => { setAffiliates(prev => prev.map(x => x.id === a.id ? { ...x, status: "suspended" } : x)); toast({ title: `${a.name} suspended` }); } });
    } else {
      setAffiliates(prev => prev.map(x => x.id === a.id ? { ...x, status: newStatus } : x));
      toast({ title: `${a.name} set to ${newStatus}` });
    }
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); toast({ title: "Referral code copied" }); };
  const copyLink = (code: string) => { navigator.clipboard.writeText(`https://quittrapp.com/?ref=${code}`); toast({ title: "Referral link copied" }); };

  const processPayout = (p: Payout) => {
    setConfirm({ open: true, title: "Process payout?", description: `Mark $${p.amount} payout to ${p.affiliateName} as paid?`, variant: "warning", confirmLabel: "Mark Paid", onConfirm: () => {
      setPayouts(prev => prev.map(x => x.id === p.id ? { ...x, status: "paid", processedAt: new Date().toISOString().split("T")[0] } : x));
      setAffiliates(prev => prev.map(a => a.id === p.affiliateId ? { ...a, pendingBalance: Math.max(0, a.pendingBalance - p.amount), totalPaid: a.totalPaid + p.amount } : a));
      toast({ title: "Payout processed" });
    } });
  };

  const rejectPayout = (p: Payout) => {
    setConfirm({ open: true, title: "Reject payout?", description: `Reject $${p.amount} payout request from ${p.affiliateName}?`, variant: "destructive", onConfirm: () => {
      setPayouts(prev => prev.map(x => x.id === p.id ? { ...x, status: "failed" } : x));
      toast({ title: "Payout rejected" });
    } });
  };

  const approveReferral = (r: Referral) => {
    setReferrals(prev => prev.map(x => x.id === r.id ? { ...x, status: "approved" } : x));
    if (r.commission > 0) {
      setAffiliates(prev => prev.map(a => a.id === r.affiliateId ? { ...a, pendingBalance: a.pendingBalance + r.commission, totalEarned: a.totalEarned + r.commission } : a));
    }
    toast({ title: "Referral approved" });
  };

  const rejectReferral = (r: Referral) => {
    setReferrals(prev => prev.map(x => x.id === r.id ? { ...x, status: "rejected" } : x));
    toast({ title: "Referral rejected" });
  };

  const openTierEdit = (t: TierConfig) => {
    setEditingTier(t);
    setTierFormRate(String(t.commissionRate));
    setTierFormMin(String(t.minConversions));
    setTierFormBonus(String(t.bonus));
    setShowTierDialog(true);
  };

  const saveTier = () => {
    if (!editingTier) return;
    setTiers(prev => prev.map(t => t.name === editingTier.name ? { ...t, commissionRate: Number(tierFormRate), minConversions: Number(tierFormMin), bonus: Number(tierFormBonus) } : t));
    setShowTierDialog(false);
    toast({ title: `${editingTier.name} tier updated` });
  };

  const exportCSV = () => {
    const rows = [["Name", "Email", "Code", "Tier", "Status", "Rate", "Clicks", "Signups", "Conversions", "Earned", "Paid", "Pending"], ...affiliates.map(a => [a.name, a.email, a.code, a.tier, a.status, `${a.commissionRate}%`, a.totalClicks, a.totalSignups, a.totalConversions, `$${a.totalEarned}`, `$${a.totalPaid}`, `$${a.pendingBalance}`])];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "affiliates.csv"; link.click();
    toast({ title: "Affiliates exported" });
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { active: "bg-emerald-500/20 text-emerald-400", inactive: "bg-muted text-muted-foreground", suspended: "bg-red-500/20 text-red-400", pending: "bg-yellow-500/20 text-yellow-400" };
    return <Badge className={map[s] || ""}>{s}</Badge>;
  };

  const tierBadge = (t: string) => {
    const map: Record<string, string> = { bronze: "bg-orange-500/20 text-orange-400", silver: "bg-gray-500/20 text-gray-300", gold: "bg-yellow-500/20 text-yellow-400", platinum: "bg-cyan-500/20 text-cyan-400" };
    return <Badge className={map[t] || ""}>{t}</Badge>;
  };

  const payoutBadge = (s: string) => {
    const map: Record<string, string> = { pending: "bg-yellow-500/20 text-yellow-400", processing: "bg-blue-500/20 text-blue-400", paid: "bg-emerald-500/20 text-emerald-400", failed: "bg-red-500/20 text-red-400" };
    return <Badge className={map[s] || ""}>{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Affiliate Management</h1>
          <p className="text-muted-foreground">Manage partners, referrals, commissions, and payouts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Affiliate</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Affiliates", value: stats.total, icon: Users, color: "text-primary" },
          { label: "Active", value: stats.active, icon: CheckCircle, color: "text-emerald-400" },
          { label: "Total Clicks", value: stats.totalClicks.toLocaleString(), icon: MousePointerClick, color: "text-blue-400" },
          { label: "Conversions", value: stats.totalConversions, icon: TrendingUp, color: "text-purple-400" },
          { label: "Total Earned", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-yellow-400" },
          { label: "Pending Payouts", value: `$${stats.pendingPayouts.toLocaleString()}`, icon: Clock, color: "text-orange-400" },
        ].map(s => (
          <Card key={s.label} className="bg-card border-border/40">
            <CardContent className="p-4 flex flex-col items-center text-center gap-1">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="affiliates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="tiers">Tiers & Rewards</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* ─── AFFILIATES TAB ─── */}
        <TabsContent value="affiliates" className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, or code..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="bronze">Bronze</SelectItem>
                <SelectItem value="silver">Silver</SelectItem>
                <SelectItem value="gold">Gold</SelectItem>
                <SelectItem value="platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="bg-card border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Earned</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="font-medium text-foreground">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{a.code}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(a.code)}><Copy className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                    <TableCell>{tierBadge(a.tier)}</TableCell>
                    <TableCell>{statusBadge(a.status)}</TableCell>
                    <TableCell className="text-right font-medium">{a.commissionRate}%</TableCell>
                    <TableCell className="text-right">{a.totalClicks.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{a.totalConversions}</TableCell>
                    <TableCell className="text-right font-medium text-emerald-400">${a.totalEarned.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-yellow-400">${a.pendingBalance}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setDetailAffiliate(a); setShowDetailDialog(true); }}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyLink(a.code)}><Link2 className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(a)}><Edit className="h-3.5 w-3.5" /></Button>
                        {a.status === "active" ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-yellow-400" onClick={() => toggleStatus(a, "suspended")}><Ban className="h-3.5 w-3.5" /></Button>
                        ) : a.status === "suspended" || a.status === "pending" ? (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-400" onClick={() => toggleStatus(a, "active")}><CheckCircle className="h-3.5 w-3.5" /></Button>
                        ) : null}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteAffiliate(a)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No affiliates found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ─── REFERRALS TAB ─── */}
        <TabsContent value="referrals" className="space-y-4">
          <Card className="bg-card border-border/40">
            <CardHeader>
              <CardTitle className="text-lg">Referral Activity</CardTitle>
              <CardDescription>Review and approve/reject referral commissions</CardDescription>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Referred User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium text-foreground">{r.affiliateName}</TableCell>
                    <TableCell className="text-muted-foreground">{r.referredUser}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={r.type === "conversion" ? "border-emerald-500/50 text-emerald-400" : r.type === "signup" ? "border-blue-500/50 text-blue-400" : "border-muted-foreground/50"}>{r.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{r.commission > 0 ? `$${r.commission}` : "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{r.createdAt}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-right">
                      {r.status === "pending" && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-emerald-400" onClick={() => approveReferral(r)}><CheckCircle className="mr-1 h-3 w-3" />Approve</Button>
                          <Button size="sm" variant="outline" className="h-7 text-destructive" onClick={() => rejectReferral(r)}><XCircle className="mr-1 h-3 w-3" />Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ─── PAYOUTS TAB ─── */}
        <TabsContent value="payouts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border/40">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">${payouts.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0)}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/40">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">${payouts.filter(p => p.status === "processing").reduce((s, p) => s + p.amount, 0)}</div>
                <div className="text-xs text-muted-foreground">Processing</div>
              </CardContent>
            </Card>
            <Card className="bg-card border-border/40">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">${payouts.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0)}</div>
                <div className="text-xs text-muted-foreground">Paid Total</div>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-card border-border/40">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Processed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium text-foreground">{p.affiliateName}</TableCell>
                    <TableCell className="font-bold">${p.amount}</TableCell>
                    <TableCell className="text-muted-foreground">{p.method}</TableCell>
                    <TableCell className="text-muted-foreground">{p.requestedAt}</TableCell>
                    <TableCell className="text-muted-foreground">{p.processedAt || "—"}</TableCell>
                    <TableCell>{payoutBadge(p.status)}</TableCell>
                    <TableCell className="text-right">
                      {(p.status === "pending" || p.status === "processing") && (
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-emerald-400" onClick={() => processPayout(p)}><CreditCard className="mr-1 h-3 w-3" />Pay</Button>
                          <Button size="sm" variant="outline" className="h-7 text-destructive" onClick={() => rejectPayout(p)}><XCircle className="mr-1 h-3 w-3" />Reject</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ─── TIERS TAB ─── */}
        <TabsContent value="tiers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map(t => (
              <Card key={t.name} className="bg-card border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className={`text-lg ${t.color}`}>
                    <Award className="inline mr-2 h-5 w-5" />{t.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Commission</span><span className="font-bold text-foreground">{t.commissionRate}%</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Min Conversions</span><span className="text-foreground">{t.minConversions}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Bonus</span><span className="text-foreground">${t.bonus}</span></div>
                  <div className="text-xs text-muted-foreground">{affiliates.filter(a => a.tier === t.name.toLowerCase()).length} affiliates</div>
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => openTierEdit(t)}><Edit className="mr-2 h-3 w-3" />Edit Tier</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── SETTINGS TAB ─── */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border/40">
              <CardHeader>
                <CardTitle className="text-lg">Program Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Auto-approve referrals", desc: "Automatically approve all referral commissions", default: false },
                  { label: "Allow self-referral", desc: "Let affiliates use their own referral code", default: false },
                  { label: "Public signup page", desc: "Allow anyone to apply as an affiliate", default: true },
                  { label: "Require website", desc: "Require affiliates to submit a website URL", default: false },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{s.label}</div>
                      <div className="text-xs text-muted-foreground">{s.desc}</div>
                    </div>
                    <Switch defaultChecked={s.default} onCheckedChange={() => toast({ title: `${s.label} toggled` })} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="bg-card border-border/40">
              <CardHeader>
                <CardTitle className="text-lg">Commission Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Cookie Duration (days)</Label>
                  <Input type="number" defaultValue="30" className="mt-1" />
                </div>
                <div>
                  <Label>Minimum Payout ($)</Label>
                  <Input type="number" defaultValue="50" className="mt-1" />
                </div>
                <div>
                  <Label>Payout Schedule</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={() => toast({ title: "Settings saved" })}>Save Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* ADD/EDIT AFFILIATE DIALOG */}
      <Dialog open={showAffiliateDialog} onOpenChange={setShowAffiliateDialog}>
        <DialogContent className="bg-card border-border/40 max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAffiliate ? "Edit Affiliate" : "Add Affiliate"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={formName} onChange={e => setFormName(e.target.value)} className="mt-1" /></div>
            <div><Label>Email</Label><Input type="email" value={formEmail} onChange={e => setFormEmail(e.target.value)} className="mt-1" /></div>
            <div><Label>Referral Code</Label><Input value={formCode} onChange={e => setFormCode(e.target.value.toUpperCase())} className="mt-1" placeholder="e.g. ALEX25" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tier</Label>
                <Select value={formTier} onValueChange={v => setFormTier(v as Affiliate["tier"])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bronze">Bronze</SelectItem>
                    <SelectItem value="silver">Silver</SelectItem>
                    <SelectItem value="gold">Gold</SelectItem>
                    <SelectItem value="platinum">Platinum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Commission %</Label><Input type="number" value={formRate} onChange={e => setFormRate(e.target.value)} className="mt-1" /></div>
            </div>
            <div><Label>Payout Method</Label>
              <Select value={formPayoutMethod} onValueChange={setFormPayoutMethod}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PayPal">PayPal</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Website (optional)</Label><Input value={formWebsite} onChange={e => setFormWebsite(e.target.value)} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAffiliateDialog(false)}>Cancel</Button>
            <Button onClick={saveAffiliate}>{editingAffiliate ? "Save Changes" : "Add Affiliate"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-card border-border/40 max-w-lg">
          {detailAffiliate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">{detailAffiliate.name} {tierBadge(detailAffiliate.tier)} {statusBadge(detailAffiliate.status)}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{detailAffiliate.email}</span></div>
                  <div><span className="text-muted-foreground">Code:</span> <code className="bg-muted px-1 rounded">{detailAffiliate.code}</code></div>
                  <div><span className="text-muted-foreground">Website:</span> <span className="text-foreground">{detailAffiliate.website || "—"}</span></div>
                  <div><span className="text-muted-foreground">Payout:</span> <span className="text-foreground">{detailAffiliate.payoutMethod}</span></div>
                  <div><span className="text-muted-foreground">Joined:</span> <span className="text-foreground">{detailAffiliate.joinedAt}</span></div>
                  <div><span className="text-muted-foreground">Last Active:</span> <span className="text-foreground">{detailAffiliate.lastActiveAt}</span></div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <Card className="bg-muted/30 border-border/40"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-foreground">{detailAffiliate.totalClicks.toLocaleString()}</div><div className="text-xs text-muted-foreground">Clicks</div></CardContent></Card>
                  <Card className="bg-muted/30 border-border/40"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-foreground">{detailAffiliate.totalSignups}</div><div className="text-xs text-muted-foreground">Signups</div></CardContent></Card>
                  <Card className="bg-muted/30 border-border/40"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-foreground">{detailAffiliate.totalConversions}</div><div className="text-xs text-muted-foreground">Conversions</div></CardContent></Card>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-muted/30 border-border/40"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-emerald-400">${detailAffiliate.totalEarned.toLocaleString()}</div><div className="text-xs text-muted-foreground">Earned</div></CardContent></Card>
                  <Card className="bg-muted/30 border-border/40"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-foreground">${detailAffiliate.totalPaid.toLocaleString()}</div><div className="text-xs text-muted-foreground">Paid</div></CardContent></Card>
                  <Card className="bg-muted/30 border-border/40"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-yellow-400">${detailAffiliate.pendingBalance}</div><div className="text-xs text-muted-foreground">Pending</div></CardContent></Card>
                </div>
                <div className="text-xs text-muted-foreground pt-1">Conversion rate: {detailAffiliate.totalClicks > 0 ? ((detailAffiliate.totalConversions / detailAffiliate.totalClicks) * 100).toFixed(1) : 0}%</div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* TIER EDIT DIALOG */}
      <Dialog open={showTierDialog} onOpenChange={setShowTierDialog}>
        <DialogContent className="bg-card border-border/40 max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit {editingTier?.name} Tier</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Commission Rate (%)</Label><Input type="number" value={tierFormRate} onChange={e => setTierFormRate(e.target.value)} className="mt-1" /></div>
            <div><Label>Min Conversions</Label><Input type="number" value={tierFormMin} onChange={e => setTierFormMin(e.target.value)} className="mt-1" /></div>
            <div><Label>Bonus ($)</Label><Input type="number" value={tierFormBonus} onChange={e => setTierFormBonus(e.target.value)} className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTierDialog(false)}>Cancel</Button>
            <Button onClick={saveTier}>Save Tier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirm.open} onOpenChange={o => setConfirm(prev => ({ ...prev, open: o }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} variant={confirm.variant} confirmLabel={confirm.confirmLabel} />
    </div>
  );
}
