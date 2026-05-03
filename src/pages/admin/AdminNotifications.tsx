import { useState, useEffect } from "react";
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
import { api } from "@/services/api";
import { fetchNotificationCampaignsFromDatabase, createNotificationCampaign, updateNotificationCampaign, deleteNotificationCampaign } from "@/services/supabase";

interface Notification {
  id: string; title: string; body: string; audience: string; channel: string; sent: string; delivered: number; opened: number; status: string;
}

const channelIcon: Record<string, React.ElementType> = { Push: Smartphone, Email: Mail, "Push + Email": Megaphone };

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editNotif, setEditNotif] = useState<Notification | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", audience: "", channel: "" });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const fetchNotificationData = async () => {
    try {
      setLoading(true);
      
      // Fetch campaigns from database (fallback to mock API if tables don't exist)
      let campaignsRes;
      try {
        campaignsRes = await fetchNotificationCampaignsFromDatabase();
      } catch (error) {
        console.log('Notification campaigns database not available, falling back to mock API');
        campaignsRes = await api.getNotificationCampaigns();
      }
      
      // Fetch stats from API (for now)
      const statsRes = await api.getNotificationStats();

      // Transform campaigns data to match Notification interface
      const transformedNotifications = (campaignsRes.data || []).map((item: any) => ({
        id: item.id,
        title: item.title || 'Untitled',
        body: item.body || '',
        audience: item.audience || 'All Users',
        channel: item.channel || 'Push',
        sent: new Date(item.sent_at || item.created_at).toLocaleDateString(),
        delivered: item.delivered_count || 0,
        opened: item.opened_count || 0,
        status: item.status || 'draft'
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Failed to fetch notification data:', error);
      toast({ title: "Error", description: "Failed to load notification data" });
      // Set empty array to prevent filter errors
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = notifications.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()) || n.audience.toLowerCase().includes(search.toLowerCase()));
  const sentCount = notifications.filter((n) => n.status === "sent").length;
  const totalDelivered = notifications.reduce((a, n) => a + n.delivered, 0);
  const totalOpened = notifications.reduce((a, n) => a + n.opened, 0);

  const createNotification = async (asDraft: boolean) => {
    if (!form.title.trim() || !form.body.trim() || !form.audience || !form.channel) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    try {
      const campaignData = {
        title: form.title.trim(),
        body: form.body.trim(),
        audience: form.audience,
        channel: form.channel,
        status: asDraft ? 'draft' : 'sent'
      };

      const result = await createNotificationCampaign(campaignData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast({ title: "Success", description: `Notification ${asDraft ? 'saved as draft' : 'sent'} successfully` });
      setAddOpen(false);
      setForm({ title: "", body: "", audience: "", channel: "" });
      
      // Refresh the notifications list
      await fetchNotificationData();
    } catch (error) {
      console.error('Create notification error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create notification", variant: "destructive" });
    }
  };

  const deleteNotification = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;
    
    setConfirm({
      open: true,
      title: `Delete "${notification.title}"?`,
      description: "This will permanently delete the notification campaign. This action cannot be undone.",
      onConfirm: async () => {
        try {
          const result = await deleteNotificationCampaign(id);
          
          if (!result.success) {
            throw new Error(result.message);
          }
          
          // Remove from local state
          setNotifications(prev => prev.filter(n => n.id !== id));
          toast({ title: "Success", description: "Notification deleted successfully" });
        } catch (error) {
          console.error('Delete notification error:', error);
          toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete notification", variant: "destructive" });
        }
      }
    });
  };

  const saveEdit = async () => {
    if (!editNotif || !form.title.trim() || !form.body.trim() || !form.audience || !form.channel) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    try {
      const updateData = {
        title: form.title.trim(),
        body: form.body.trim(),
        audience: form.audience,
        channel: form.channel
      };

      const result = await updateNotificationCampaign(editNotif.id, updateData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast({ title: "Success", description: "Notification updated successfully" });
      setEditOpen(false);
      setEditNotif(null);
      
      // Refresh the notifications list
      await fetchNotificationData();
    } catch (error) {
      console.error('Save edit error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update notification", variant: "destructive" });
    }
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
        {loading ? (
          <div className="col-span-4 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          [
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
          ))
        )}
      </div>

      <Input placeholder="Search notifications..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary/40 border-border/30 max-w-sm" />

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No notifications found
          </div>
        ) : (
          filtered.map((notif) => {
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
          })
        )}
      </div>
    </div>
  );
}
