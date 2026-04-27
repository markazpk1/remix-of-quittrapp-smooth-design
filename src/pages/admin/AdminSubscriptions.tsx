import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Search, Plus, MoreHorizontal, Pencil, Trash2, DollarSign, Users, TrendingUp, CreditCard, Check, Crown, Zap, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface Plan {
  id: string; name: string; price: string; interval: string; icon: string; active: boolean; subscribers: number; features: string[]; color: string;
}
interface Subscriber {
  id: string; user: string; email: string; plan: string; amount: string; date: string; status: string;
}

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ name: "", price: "", features: "" });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void; variant?: "destructive" | "warning" }>({ open: false, title: "", description: "", onConfirm: () => {} });

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [plansRes, subscribersRes, statsRes] = await Promise.all([
        api.getSubscriptionPlans(),
        api.getSubscribers(),
        api.getSubscriptionStats(),
      ]);

      setPlans(Array.isArray(plansRes) ? plansRes : []);
      setSubscribers(Array.isArray(subscribersRes) ? subscribersRes : []);
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
      toast({ title: "Error", description: "Failed to load subscription data" });
      // Set empty arrays to prevent filter errors
      setPlans([]);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubs = subscribers.filter((s) => s.user.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  const togglePlan = (id: string) => {
    toast({ title: "Not Implemented", description: "Plan toggle coming soon" });
  };

  const addPlan = () => {
    toast({ title: "Not Implemented", description: "Plan creation coming soon" });
    setAddPlanOpen(false);
    setPlanForm({ name: "", price: "", features: "" });
  };

  const savePlanEdit = () => {
    toast({ title: "Not Implemented", description: "Plan editing coming soon" });
    setEditPlanOpen(false);
  };

  const refundSubscriber = (sub: Subscriber) => {
    toast({ title: "Not Implemented", description: "Refund processing coming soon" });
  };

  const cancelSubscriber = (sub: Subscriber) => {
    toast({ title: "Not Implemented", description: "Subscription cancellation coming soon" });
  };

  const totalMRR = plans.filter((p) => p.active && p.interval === "/month").reduce((a, p) => a + p.subscribers * parseFloat(p.price.replace("$", "")), 0);

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} variant={confirm.variant} confirmLabel="Yes, continue" />

      <div><h1 className="font-display text-2xl font-bold text-foreground">Subscriptions</h1><p className="text-sm text-muted-foreground">Manage pricing plans, subscribers, and revenue.</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? (
          <div className="col-span-4 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          [
            { label: "MRR", value: `$${Math.round(plans.filter((p) => p.active && p.interval === "/month").reduce((a, p) => a + p.subscribers * parseFloat(p.price.replace("$", "")), 0)).toLocaleString()}`, icon: DollarSign },
            { label: "Total Subscribers", value: plans.reduce((a, p) => a + p.subscribers, 0).toLocaleString(), icon: Users },
            { label: "Paid Users", value: plans.filter((p) => p.price !== "$0").reduce((a, p) => a + p.subscribers, 0).toLocaleString(), icon: CreditCard },
            { label: "Plans Active", value: plans.filter((p) => p.active).length, icon: TrendingUp },
          ].map((st) => (
            <Card key={st.label} className="bg-card/60 border-border/40"><CardContent className="p-4"><st.icon className="w-4 h-4 text-muted-foreground mb-2" /><div className="text-xl font-bold font-display text-foreground">{st.value}</div><div className="text-[11px] text-muted-foreground">{st.label}</div></CardContent></Card>
          ))
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground">Pricing Plans</h2>
        <Dialog open={addPlanOpen} onOpenChange={setAddPlanOpen}>
          <DialogTrigger asChild><Button variant="outline" size="sm" className="border-border/40 text-xs"><Plus className="w-3 h-3 mr-1.5" /> Add Plan</Button></DialogTrigger>
          <DialogContent className="bg-card border-border/40">
            <DialogHeader><DialogTitle className="text-foreground">Create Plan</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Plan Name</Label><Input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} placeholder="e.g. Premium" className="bg-secondary/40 border-border/30" /></div>
                <div className="space-y-2"><Label>Price</Label><Input value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} placeholder="$19.99" className="bg-secondary/40 border-border/30" /></div>
              </div>
              <div className="space-y-2"><Label>Features (one per line)</Label><Textarea value={planForm.features} onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} rows={4} className="bg-secondary/40 border-border/30" /></div>
              <Button onClick={addPlan} className="w-full">Create Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editPlanOpen} onOpenChange={setEditPlanOpen}>
        <DialogContent className="bg-card border-border/40">
          <DialogHeader><DialogTitle className="text-foreground">Edit Plan</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Name</Label><Input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} className="bg-secondary/40 border-border/30" /></div>
              <div className="space-y-2"><Label>Price</Label><Input value={planForm.price} onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })} className="bg-secondary/40 border-border/30" /></div>
            </div>
            <div className="space-y-2"><Label>Features (one per line)</Label><Textarea value={planForm.features} onChange={(e) => setPlanForm({ ...planForm, features: e.target.value })} rows={4} className="bg-secondary/40 border-border/30" /></div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={savePlanEdit}>Save</Button></DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          plans.map((plan) => (
            <Card key={plan.id} className={`bg-card/60 border-border/40 relative overflow-hidden ${!plan.active ? "opacity-50" : ""}`}>
              {plan.name === "Pro" && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {plan.icon === 'Zap' && <Zap className={`w-5 h-5 ${plan.color}`} />}
                    {plan.icon === 'Star' && <Star className={`w-5 h-5 ${plan.color}`} />}
                    {plan.icon === 'Crown' && <Crown className={`w-5 h-5 ${plan.color}`} />}
                    <span className="font-semibold text-foreground">{plan.name}</span>
                  </div>
                  <Switch checked={plan.active} onCheckedChange={() => togglePlan(plan.id)} />
                </div>
                <div className="mb-4"><span className="text-2xl font-bold font-display text-foreground">{plan.price}</span><span className="text-xs text-muted-foreground ml-1">{plan.interval}</span></div>
                <div className="space-y-2 mb-4">
                  {plan.features.map((f) => (<div key={f} className="flex items-center gap-2 text-xs text-muted-foreground"><Check className="w-3 h-3 text-green-400 shrink-0" /><span>{f}</span></div>))}
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/20">
                  <span>{plan.subscribers.toLocaleString()} subscribers</span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => { setEditPlan(plan); setPlanForm({ name: plan.name, price: plan.price, features: plan.features.join("\n") }); setEditPlanOpen(true); }}><Pencil className="w-3 h-3 mr-1" /> Edit</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-foreground">Recent Subscribers</h2>
        <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search subscribers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" /></div>
      </div>

      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">User</TableHead><TableHead className="text-muted-foreground">Plan</TableHead><TableHead className="text-muted-foreground">Amount</TableHead><TableHead className="text-muted-foreground">Date</TableHead><TableHead className="text-muted-foreground">Status</TableHead><TableHead className="text-muted-foreground w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No subscribers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubs.map((sub) => (
                    <TableRow key={sub.id} className="border-border/20 hover:bg-secondary/20">
                      <TableCell><div><div className="text-sm font-medium text-foreground">{sub.user}</div><div className="text-[11px] text-muted-foreground">{sub.email}</div></div></TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] ${sub.plan === "Pro" ? "bg-primary/20 text-primary border-primary/30" : sub.plan === "Lifetime" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-secondary text-muted-foreground border-border/30"}`}>{sub.plan}</Badge></TableCell>
                      <TableCell className="text-sm text-foreground font-medium">{sub.amount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{sub.date}</TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${sub.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : sub.status === "canceled" ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>{sub.status}</Badge></TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border/40">
                            <DropdownMenuItem className="text-xs" onClick={() => cancelSubscriber(sub)} disabled={sub.status !== "active"}><Trash2 className="w-3 h-3 mr-2" /> Cancel</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs text-red-400" onClick={() => refundSubscriber(sub)} disabled={sub.status === "refunded"}><DollarSign className="w-3 h-3 mr-2" /> Refund</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
