import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Bell, Send, Plus, Users, Clock, CheckCircle2, Pencil, Trash2, Megaphone, Mail, Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Notification {
  id: number; title: string; body: string; audience: string; channel: string; sent: string; delivered: number; opened: number; status: string;
}

const initialNotifications: Notification[] = [
  { id: 1, title: "🎉 New Feature: AI Companion v4.0", body: "Our AI companion just got smarter.", audience: "All Users", channel: "Push", sent: "2026-02-28", delivered: 11400, opened: 6840, status: "sent" },
  { id: 2, title: "💪 Weekly Streak Reminder", body: "Keep your streak going!", audience: "Active Users", channel: "Push", sent: "2026-02-27", delivered: 8900, opened: 5340, status: "sent" },
  { id: 3, title: "📚 New Lesson: Brain Rewiring", body: "Learn how your brain heals.", audience: "Pro Users", channel: "Push + Email", sent: "2026-02-25", delivered: 3200, opened: 2100, status: "sent" },
  { id: 4, title: "🔥 50% Off Lifetime Plan", body: "Limited time offer!", audience: "Free Users", channel: "Email", sent: "2026-02-20", delivered: 8400, opened: 4200, status: "sent" },
  { id: 5, title: "🧘 New Sound: Night Ambience", body: "Perfect for sleep.", audience: "All Users", channel: "Push", sent: "", delivered: 0, opened: 0, status: "scheduled" },
  { id: 6, title: "Community Milestone Celebration", body: "We just hit 1M users!", audience: "All Users", channel: "Push + Email", sent: "", delivered: 0, opened: 0, status: "draft" },
];

const channelIcon: Record<string, React.ElementType> = { Push: Smartphone, Email: Mail, "Push + Email": Megaphone };

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editNotif, setEditNotif] = useState<Notification | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "", channel: "" });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const filtered = notifications.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.audience.toLowerCase().includes(search.toLowerCase()));
  const sentCount = notifications.filter((n) => n.status === "sent").length;
  const totalDelivered = notifications.reduce((a, n) => a + n.delivered, 0);
  const totalOpened = notifications.reduce((a, n) => a + n.opened, 0);

  const createNotification = (asDraft: boolean) => {
    if (!form.title) return;
    const id = Math.max(...notifications.map((n) => n.id)) + 1;
    const status = asDraft ? "scheduled" : "sent";
    const delivered = asDraft ? 0 : Math.floor(Math.random() * 10000) + 5000;
    const opened = asDraft ? 0 : Math.floor(delivered * 0.6);
    setNotifications((prev) => [{ id, ...form, sent: asDraft ? "" : new Date().toISOString().split("T")[0], delivered, opened, status }, ...prev]);
    toast({ title: asDraft ? "Notification Scheduled" : "Notification Sent", description: `"${form.title}" has been ${asDraft ? "scheduled" : "sent"}.` });
    setAddOpen(false);
    setForm({ title: "", body: "", audience: "", channel: "" });
  };

  const deleteNotification = (id: number) => {
    const notif = notifications.find((n) => n.id === id);
    setConfirm({
      open: true, title: "Delete notification?", description: `Are you sure you want to delete "${notif?.title}"?`,
      onConfirm: () => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast({ title: "Notification Deleted", description: "The notification has been removed." });
      },
    });
  };

  const saveEdit = () => {
    if (!editNotif) return;
    setNotifications((prev) => prev.map((n) => n.id === editNotif.id ? { ...n, title: form.title || n.title, body: form.body || n.body, audience: form.audience || n.audience, channel: form.channel || n.channel } : n));
    toast({ title: "Notification Updated" });
    setEditOpen(false);
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} confirmLabel="Delete" />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">Send push notifications and emails to your users.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> New Notification</Button></DialogTrigger>
          <DialogContent className="bg-card border-border/40 max-w-lg">
            <DialogHeader><DialogTitle className="text-foreground">Create Notification</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Notification title" className="bg-secondary/40 border-border/30" /></div>
              <div className="space-y-2"><Label>Message</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Write your message..." rows={3} className="bg-secondary/40 border-border/30" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Audience</Label>
                  <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                    <SelectTrigger className="bg-secondary/40 border-border/30"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-card border-border/40">
                      <SelectItem value="All Users">All Users</SelectItem>
                      <SelectItem value="Active Users">Active Users</SelectItem>
                      <SelectItem value="Pro Users">Pro Users</SelectItem>
                      <SelectItem value="Free Users">Free Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Channel</Label>
                  <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                    <SelectTrigger className="bg-secondary/40 border-border/30"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-card border-border/40">
                      <SelectItem value="Push">Push</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Push + Email">Push + Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => createNotification(true)}><Clock className="w-3.5 h-3.5 mr-1.5" /> Schedule</Button>
                <Button className="flex-1" onClick={() => createNotification(false)}><Send className="w-3.5 h-3.5 mr-1.5" /> Send Now</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border/40">
          <DialogHeader><DialogTitle className="text-foreground">Edit Notification</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary/40 border-border/30" /></div>
            <div className="space-y-2"><Label>Message</Label><Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} className="bg-secondary/40 border-border/30" /></div>
            <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button onClick={saveEdit}>Save</Button></DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Sent", value: sentCount, icon: Send },
          { label: "Total Delivered", value: totalDelivered.toLocaleString(), icon: CheckCircle2 },
          { label: "Total Opened", value: totalOpened.toLocaleString(), icon: Bell },
          { label: "Avg Open Rate", value: totalDelivered > 0 ? `${Math.round((totalOpened / totalDelivered) * 100)}%` : "0%", icon: Users },
        ].map((st) => (
          <Card key={st.label} className="bg-card/60 border-border/40">
            <CardContent className="p-4">
              <st.icon className="w-4 h-4 text-muted-foreground mb-2" />
              <div className="text-xl font-bold font-display text-foreground">{st.value}</div>
              <div className="text-[11px] text-muted-foreground">{st.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Input placeholder="Search notifications..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary/40 border-border/30 max-w-sm" />

      <div className="space-y-3">
        {filtered.map((notif) => {
          const ChannelIcon = channelIcon[notif.channel] || Bell;
          return (
            <Card key={notif.id} className="bg-card/60 border-border/40">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-secondary/60 flex items-center justify-center shrink-0"><ChannelIcon className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{notif.title}</span>
                        <Badge variant="outline" className={`text-[10px] capitalize ${notif.status === "sent" ? "bg-green-500/20 text-green-400 border-green-500/30" : notif.status === "scheduled" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>{notif.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{notif.body}</p>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground flex-wrap">
                        <span>{notif.audience}</span>
                        <span>{notif.channel}</span>
                        {notif.status === "sent" && <><span>Delivered: {notif.delivered.toLocaleString()}</span><span>Opened: {notif.opened.toLocaleString()}</span></>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditNotif(notif); setForm({ title: notif.title, body: notif.body, audience: notif.audience, channel: notif.channel }); setEditOpen(true); }}>
                      <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNotification(notif.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
