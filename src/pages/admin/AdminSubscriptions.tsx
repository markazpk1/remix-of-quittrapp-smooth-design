import { useState } from "react";
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

interface Plan {
  id: number; name: string; price: string; interval: string; icon: React.ElementType; active: boolean; subscribers: number; features: string[]; color: string;
}
interface Subscriber {
  id: number; user: string; email: string; plan: string; amount: string; date: string; status: string;
}

const initialPlans: Plan[] = [
  { id: 1, name: "Free", price: "$0", interval: "forever", icon: Zap, active: true, subscribers: 8420, features: ["Basic streak tracking", "Community access (read-only)", "3 lessons", "Limited sound therapy"], color: "text-muted-foreground" },
  { id: 2, name: "Pro", price: "$9.99", interval: "/month", icon: Star, active: true, subscribers: 3210, features: ["Unlimited streak tracking", "Full community access", "All lessons & courses", "All sound therapy", "AI Companion", "Personalized plan"], color: "text-primary" },
  { id: 3, name: "Lifetime", price: "$79.99", interval: "one-time", icon: Crown, active: true, subscribers: 1180, features: ["Everything in Pro", "Priority support", "Early access to features", "Exclusive community badge", "Lifetime updates"], color: "text-amber-400" },
];

const initialSubs: Subscriber[] = [
  { id: 1, user: "Sarah Chen", email: "sarah@email.com", plan: "Pro", amount: "$9.99", date: "2026-02-28", status: "active" },
  { id: 2, user: "Marcus Rivera", email: "marcus@email.com", plan: "Lifetime", amount: "$79.99", date: "2026-02-27", status: "active" },
  { id: 3, user: "Aiko Tanaka", email: "aiko@email.com", plan: "Pro", amount: "$9.99", date: "2026-02-26", status: "active" },
  { id: 4, user: "James O'Brien", email: "james@email.com", plan: "Pro", amount: "$9.99", date: "2026-02-25", status: "canceled" },
  { id: 5, user: "Priya Sharma", email: "priya@email.com", plan: "Pro", amount: "$9.99", date: "2026-02-24", status: "active" },
  { id: 6, user: "Leo Martinez", email: "leo@email.com", plan: "Lifetime", amount: "$79.99", date: "2026-02-23", status: "active" },
  { id: 7, user: "Emma Wilson", email: "emma@email.com", plan: "Pro", amount: "$9.99", date: "2026-02-22", status: "refunded" },
];

export default function AdminSubscriptions() {
  const [plans, setPlans] = useState(initialPlans);
  const [subscribers, setSubscribers] = useState(initialSubs);
  const [search, setSearch] = useState("");
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [planForm, setPlanForm] = useState({ name: "", price: "", features: "" });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void; variant?: "destructive" | "warning" }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const filteredSubs = subscribers.filter((s) => s.user.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  const togglePlan = (id: number) => {
    setPlans((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      toast({ title: !p.active ? "Plan Enabled" : "Plan Disabled", description: `${p.name} plan has been ${!p.active ? "enabled" : "disabled"}.` });
      return { ...p, active: !p.active };
    }));
  };

  const addPlan = () => {
    if (!planForm.name || !planForm.price) return;
    const id = Math.max(...plans.map((p) => p.id)) + 1;
    setPlans((prev) => [...prev, { id, name: planForm.name, price: planForm.price, interval: "/month", icon: Star, active: true, subscribers: 0, features: planForm.features.split("\n").filter(Boolean), color: "text-primary" }]);
    toast({ title: "Plan Created", description: `${planForm.name} plan has been added.` });
    setAddPlanOpen(false);
    setPlanForm({ name: "", price: "", features: "" });
  };

  const savePlanEdit = () => {
    if (!editPlan) return;
    setPlans((prev) => prev.map((p) => p.id === editPlan.id ? { ...p, name: planForm.name || p.name, price: planForm.price || p.price, features: planForm.features ? planForm.features.split("\n").filter(Boolean) : p.features } : p));
    toast({ title: "Plan Updated" });
    setEditPlanOpen(false);
  };

  const refundSubscriber = (sub: Subscriber) => {
    setConfirm({
      open: true, title: `Refund ${sub.user}?`, description: `This will process a ${sub.amount} refund to ${sub.user}. This action cannot be undone.`, variant: "warning",
      onConfirm: () => {
        setSubscribers((prev) => prev.map((s) => s.id === sub.id ? { ...s, status: "refunded" } : s));
        toast({ title: "Refund Processed", description: `${sub.amount} refunded to ${sub.user}.` });
      },
    });
  };

  const cancelSubscriber = (sub: Subscriber) => {
    setConfirm({
      open: true, title: `Cancel ${sub.user}'s subscription?`, description: `This will immediately cancel their ${sub.plan} subscription.`,
      onConfirm: () => {
        setSubscribers((prev) => prev.map((s) => s.id === sub.id ? { ...s, status: "canceled" } : s));
        toast({ title: "Subscription Canceled", description: `${sub.user}'s subscription has been canceled.` });
      },
    });
  };

  const totalMRR = plans.filter((p) => p.active && p.interval === "/month").reduce((a, p) => a + p.subscribers * parseFloat(p.price.replace("$", "")), 0);

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} variant={confirm.variant} confirmLabel="Yes, continue" />

      <div><h1 className="font-display text-2xl font-bold text-foreground">Subscriptions</h1><p className="text-sm text-muted-foreground">Manage pricing plans, subscribers, and revenue.</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "MRR", value: `$${Math.round(totalMRR).toLocaleString()}`, icon: DollarSign },
          { label: "Total Subscribers", value: plans.reduce((a, p) => a + p.subscribers, 0).toLocaleString(), icon: Users },
          { label: "Paid Users", value: plans.filter((p) => p.price !== "$0").reduce((a, p) => a + p.subscribers, 0).toLocaleString(), icon: CreditCard },
          { label: "Plans Active", value: plans.filter((p) => p.active).length, icon: TrendingUp },
        ].map((st) => (
          <Card key={st.label} className="bg-card/60 border-border/40"><CardContent className="p-4"><st.icon className="w-4 h-4 text-muted-foreground mb-2" /><div className="text-xl font-bold font-display text-foreground">{st.value}</div><div className="text-[11px] text-muted-foreground">{st.label}</div></CardContent></Card>
        ))}
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
        {plans.map((plan) => (
          <Card key={plan.id} className={`bg-card/60 border-border/40 relative overflow-hidden ${!plan.active ? "opacity-50" : ""}`}>
            {plan.name === "Pro" && <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />}
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><plan.icon className={`w-5 h-5 ${plan.color}`} /><span className="font-semibold text-foreground">{plan.name}</span></div>
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
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-sm font-semibold text-foreground">Recent Subscribers</h2>
        <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search subscribers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" /></div>
      </div>

      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-muted-foreground">User</TableHead><TableHead className="text-muted-foreground">Plan</TableHead><TableHead className="text-muted-foreground">Amount</TableHead><TableHead className="text-muted-foreground">Date</TableHead><TableHead className="text-muted-foreground">Status</TableHead><TableHead className="text-muted-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.map((sub) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
