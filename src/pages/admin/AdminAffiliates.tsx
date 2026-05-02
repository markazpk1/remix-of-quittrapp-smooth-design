import { useState, useEffect } from "react";
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
import { api } from "../../services/api";

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

interface AffiliateStats {
  total: number;
  active: number;
  totalRevenue: number;
  pendingPayouts: number;
  totalClicks: number;
  totalConversions: number;
}

export default function AdminAffiliates() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [tiers, setTiers] = useState<TierConfig[]>([]);
  const [stats, setStats] = useState<AffiliateStats>({
    total: 0, active: 0, totalRevenue: 0, pendingPayouts: 0, totalClicks: 0, totalConversions: 0,
  });
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

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      setLoading(true);
      const [affiliatesRes, statsRes, payoutsRes, referralsRes, tiersRes] = await Promise.all([
        api.getAffiliates(),
        api.getAffiliateStats(),
        api.getAffiliatePayouts(),
        api.getAffiliateReferrals(),
        api.getAffiliateTiers(),
      ]);

      setAffiliates(Array.isArray(affiliatesRes?.data) ? affiliatesRes.data : []);
      setStats(statsRes?.data || { total: 0, active: 0, totalRevenue: 0, pendingPayouts: 0, totalClicks: 0, totalConversions: 0 });
      setPayouts(Array.isArray(payoutsRes?.data) ? payoutsRes.data : []);
      setReferrals(Array.isArray(referralsRes?.data) ? referralsRes.data : []);
      setTiers(Array.isArray(tiersRes?.data) ? tiersRes.data : []);
    } catch (error) {
      console.error('Failed to fetch affiliate data:', error);
      toast({ title: "Error", description: "Failed to load affiliate data" });
      // Set empty arrays to prevent filter errors
      setAffiliates([]);
      setStats({ total: 0, active: 0, totalRevenue: 0, pendingPayouts: 0, totalClicks: 0, totalConversions: 0 });
      setPayouts([]);
      setReferrals([]);
      setTiers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = affiliates.filter(a => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase()) || a.code.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchTier = filterTier === "all" || a.tier === filterTier;
    return matchSearch && matchStatus && matchTier;
  });

  const openAdd = () => {
    toast({ title: "Not Implemented", description: "Affiliate creation coming soon" });
  };

  const openEdit = (a: Affiliate) => {
    toast({ title: "Not Implemented", description: "Affiliate editing coming soon" });
  };

  const saveAffiliate = () => {
    toast({ title: "Not Implemented", description: "Affiliate save coming soon" });
    setShowAffiliateDialog(false);
  };

  const deleteAffiliate = (a: Affiliate) => {
    toast({ title: "Not Implemented", description: "Affiliate deletion coming soon" });
  };

  const toggleStatus = (a: Affiliate, newStatus: Affiliate["status"]) => {
    toast({ title: "Not Implemented", description: "Status toggle coming soon" });
  };

  const copyCode = (code: string) => {
    toast({ title: "Not Implemented", description: "Code copying coming soon" });
  };

  const copyLink = (code: string) => {
    toast({ title: "Not Implemented", description: "Link copying coming soon" });
  };

  const processPayout = (p: Payout) => {
    toast({ title: "Not Implemented", description: "Payout processing coming soon" });
  };

  const rejectPayout = (p: Payout) => {
    toast({ title: "Not Implemented", description: "Payout rejection coming soon" });
  };

  const approveReferral = (r: Referral) => {
    toast({ title: "Not Implemented", description: "Referral approval coming soon" });
  };

  const rejectReferral = (r: Referral) => {
    toast({ title: "Not Implemented", description: "Referral rejection coming soon" });
  };

  const openTierEdit = (t: TierConfig) => {
    toast({ title: "Not Implemented", description: "Tier editing coming soon" });
  };

  const saveTier = () => {
    toast({ title: "Not Implemented", description: "Tier save coming soon" });
    setShowTierDialog(false);
  };

  const exportCSV = () => {
    toast({ title: "Not Implemented", description: "CSV export coming soon" });
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
        {loading ? (
          <div className="col-span-6 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          [
            { label: "Total Affiliates", value: stats.total, icon: Users, color: "text-primary" },
            { label: "Active", value: stats.active, icon: CheckCircle, color: "text-emerald-400" },
            { label: "Total Clicks", value: (stats.totalClicks || 0).toLocaleString(), icon: MousePointerClick, color: "text-blue-400" },
            { label: "Conversions", value: stats.totalConversions || 0, icon: TrendingUp, color: "text-purple-400" },
            { label: "Total Earned", value: `$${(stats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-yellow-400" },
            { label: "Pending Payouts", value: `$${(stats.pendingPayouts || 0).toLocaleString()}`, icon: Clock, color: "text-orange-400" },
          ].map(s => (
            <Card key={s.label} className="bg-card border-border/40">
              <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))
        )}
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No affiliates found</TableCell></TableRow>
                ) : (
                  filtered.map(a => (
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
                      <TableCell className="text-right">{(a.totalClicks || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{a.totalConversions}</TableCell>
                      <TableCell className="text-right font-medium text-emerald-400">${(a.totalEarned || 0).toLocaleString()}</TableCell>
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
                  ))
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : referrals.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No referrals found</TableCell></TableRow>
                ) : (
                  referrals.map(r => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ─── PAYOUTS TAB ─── */}
        <TabsContent value="payouts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-3 flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              <>
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
              </>
            )}
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : payouts.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No payouts found</TableCell></TableRow>
                ) : (
                  payouts.map(p => (
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
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ─── TIERS TAB ─── */}
        <TabsContent value="tiers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-4 flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : tiers.length === 0 ? (
              <div className="col-span-4 flex items-center justify-center py-8 text-muted-foreground">
                No tier configurations found
              </div>
            ) : (
              tiers.map(t => (
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
              ))
            )}
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
                  <Card className="bg-muted/30 border-border/40"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-foreground">{(detailAffiliate.totalClicks || 0).toLocaleString()}</div><div className="text-xs text-muted-foreground">Clicks</div></CardContent></Card>
                  <Card className="bg-muted/30 border-border/40"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-foreground">{detailAffiliate.totalSignups}</div><div className="text-xs text-muted-foreground">Signups</div></CardContent></Card>
                  <Card className="bg-muted/30 border-border/40"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-foreground">{detailAffiliate.totalConversions}</div><div className="text-xs text-muted-foreground">Conversions</div></CardContent></Card>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="bg-muted/30 border-border/40"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-emerald-400">${(detailAffiliate.totalEarned || 0).toLocaleString()}</div><div className="text-xs text-muted-foreground">Earned</div></CardContent></Card>
                  <Card className="bg-muted/30 border-border/40"><CardContent className="p-3 text-center"><div className="text-lg font-bold text-foreground">${(detailAffiliate.totalPaid || 0).toLocaleString()}</div><div className="text-xs text-muted-foreground">Paid</div></CardContent></Card>
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
