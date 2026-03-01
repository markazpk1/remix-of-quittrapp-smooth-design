import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import {
  AlertTriangle, Users, BookOpen, Headphones, Bot, Target, TrendingUp, Shield,
  Plus, Pencil, Settings2, ToggleLeft, Trash2, Blocks,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AppService {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  usersActive: number;
  category: string;
  version: string;
}

const iconMap: Record<string, React.ElementType> = {
  Emergency: AlertTriangle, Social: Users, Education: BookOpen, Wellness: Headphones,
  AI: Bot, Recovery: Target, Analytics: TrendingUp, Safety: Shield, Default: Blocks,
};

const initialServices: AppService[] = [
  { id: "panic-button", name: "Panic Button", description: "Instant urge-relief tool that helps users regain control when triggered.", icon: AlertTriangle, enabled: true, usersActive: 8420, category: "Emergency", version: "2.3" },
  { id: "community", name: "Community Feed", description: "Social feed where users share progress, support each other, and celebrate milestones.", icon: Users, enabled: true, usersActive: 11230, category: "Social", version: "3.1" },
  { id: "lessons", name: "Lessons & Learn", description: "Science-backed educational content about addiction, recovery, and healthy habits.", icon: BookOpen, enabled: true, usersActive: 6780, category: "Education", version: "1.8" },
  { id: "sound-therapy", name: "Sound Therapy", description: "Calming soundscapes and guided meditations for stress relief and mindfulness.", icon: Headphones, enabled: true, usersActive: 4350, category: "Wellness", version: "1.5" },
  { id: "ai-companion", name: "AI Companion", description: "Personalized AI chatbot providing 24/7 support, advice, and accountability.", icon: Bot, enabled: true, usersActive: 9120, category: "AI", version: "4.0" },
  { id: "personalized-plan", name: "Personalized Plan", description: "Custom recovery roadmap based on user habits, goals, and progress patterns.", icon: Target, enabled: true, usersActive: 7640, category: "Recovery", version: "2.0" },
  { id: "progress-tracker", name: "Progress & Streaks", description: "Detailed analytics dashboard tracking streaks, milestones, and recovery patterns.", icon: TrendingUp, enabled: true, usersActive: 12100, category: "Analytics", version: "3.2" },
  { id: "content-blocker", name: "Content Blocker", description: "Built-in web filter and blocker to help users avoid triggering content.", icon: Shield, enabled: false, usersActive: 0, category: "Safety", version: "0.9" },
];

const categoryColor: Record<string, string> = {
  Emergency: "bg-red-500/20 text-red-400 border-red-500/30",
  Social: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Education: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Wellness: "bg-green-500/20 text-green-400 border-green-500/30",
  AI: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Recovery: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Analytics: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Safety: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function AdminServices() {
  const [services, setServices] = useState(initialServices);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editService, setEditService] = useState<AppService | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", description: "" });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const toggleService = (id: string) => {
    setServices((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const toggled = { ...s, enabled: !s.enabled };
      toast({ title: toggled.enabled ? "Service Enabled" : "Service Disabled", description: `${s.name} has been ${toggled.enabled ? "enabled" : "disabled"}.` });
      return toggled;
    }));
  };

  const addService = () => {
    if (!form.name || !form.category) return;
    const id = form.name.toLowerCase().replace(/\s+/g, "-");
    const icon = iconMap[form.category] || iconMap.Default;
    setServices((prev) => [...prev, { id, name: form.name, description: form.description, icon, enabled: true, usersActive: 0, category: form.category, version: "1.0" }]);
    toast({ title: "Service Created", description: `${form.name} has been added.` });
    setAddOpen(false);
    setForm({ name: "", category: "", description: "" });
  };

  const saveEdit = () => {
    if (!editService) return;
    setServices((prev) => prev.map((s) => s.id === editService.id ? { ...s, name: form.name || s.name, description: form.description || s.description, category: form.category || s.category } : s));
    toast({ title: "Service Updated", description: `${form.name || editService.name} has been saved.` });
    setEditOpen(false);
    setEditService(null);
  };

  const deleteService = (id: string) => {
    const svc = services.find((s) => s.id === id);
    setConfirm({
      open: true,
      title: `Delete ${svc?.name}?`,
      description: `This will permanently remove the "${svc?.name}" service. ${svc?.usersActive ? `${svc.usersActive.toLocaleString()} active users will be affected.` : ""}`,
      onConfirm: () => {
        setServices((prev) => prev.filter((s) => s.id !== id));
        toast({ title: "Service Deleted", description: `${svc?.name} has been removed.` });
      },
    });
  };

  const filtered = services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase()));
  const totalActive = services.filter((s) => s.enabled).length;

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} confirmLabel="Delete" />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">App Services</h1>
          <p className="text-sm text-muted-foreground">Manage all in-app features and services. {totalActive}/{services.length} active.</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" /> Add Service</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border/40">
            <DialogHeader><DialogTitle className="text-foreground">Add New Service</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2"><Label>Service Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Guided Journaling" className="bg-secondary/40 border-border/30" /></div>
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Wellness" className="bg-secondary/40 border-border/30" /></div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what this service does..." className="bg-secondary/40 border-border/30" /></div>
              <Button onClick={addService} className="w-full">Create Service</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-card border-border/40">
          <DialogHeader><DialogTitle className="text-foreground">Edit Service</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Service Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-secondary/40 border-border/30" /></div>
            <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-secondary/40 border-border/30" /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-secondary/40 border-border/30" /></div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={saveEdit}>Save Changes</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Services", value: services.length, icon: Settings2 },
          { label: "Active", value: totalActive, icon: ToggleLeft },
          { label: "Total Users Engaged", value: services.reduce((a, s) => a + s.usersActive, 0).toLocaleString(), icon: Users },
          { label: "Categories", value: [...new Set(services.map((s) => s.category))].length, icon: Target },
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

      <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary/40 border-border/30 max-w-sm" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((service) => (
          <Card key={service.id} className={`bg-card/60 border-border/40 transition-all ${!service.enabled ? "opacity-50" : ""}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/60 flex items-center justify-center">
                    <service.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{service.name}</div>
                    <Badge variant="outline" className={`text-[10px] mt-0.5 ${categoryColor[service.category] || ""}`}>{service.category}</Badge>
                  </div>
                </div>
                <Switch checked={service.enabled} onCheckedChange={() => toggleService(service.id)} />
              </div>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{service.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span>{service.usersActive.toLocaleString()} users</span>
                  <span>v{service.version}</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditService(service); setForm({ name: service.name, category: service.category, description: service.description }); setEditOpen(true); }}>
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteService(service.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
