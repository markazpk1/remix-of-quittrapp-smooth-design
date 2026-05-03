import { useState, useEffect } from "react";
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
import { api } from "@/services/api";

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
  Education: BookOpen, Social: Users, Wellness: Headphones, AI: Bot,
  Recovery: Target, Analytics: TrendingUp, Safety: Shield, Default: Blocks,
};

const categoryColor: Record<string, string> = {
  Education: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  Social: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Wellness: "bg-green-500/20 text-green-400 border-green-500/30",
  AI: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Recovery: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  Analytics: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Safety: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

export default function AdminServices() {
  const [services, setServices] = useState<AppService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editService, setEditService] = useState<AppService | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", description: "" });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  useEffect(() => {
    fetchServicesData();
  }, []);

  const fetchServicesData = async () => {
    try {
      setLoading(true);
      const servicesRes = await api.getServices();
      
      // Map API data to AppService format
      const servicesList: AppService[] = (servicesRes.data || []).map((service: any) => ({
        id: service.id,
        name: service.name,
        description: service.description,
        icon: iconMap[service.category] || iconMap.Default,
        enabled: service.enabled,
        usersActive: service.usersActive,
        category: service.category,
        version: service.version
      }));

      setServices(servicesList);
    } catch (error) {
      console.error('Failed to fetch services data:', error);
      toast({ title: "Error", description: "Failed to load services data" });
      // Set empty array to prevent errors
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = async (id: string) => {
    try {
      const response = await api.toggleService(id);
      
      if (!response.success) {
        toast({ 
          title: "Error", 
          description: response.message || "Failed to toggle service",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setServices((prev) => prev.map((s) => {
        if (s.id !== id) return s;
        const toggled = { ...s, enabled: !s.enabled };
        toast({ title: toggled.enabled ? "Service Enabled" : "Service Disabled", description: `${s.name} has been ${toggled.enabled ? "enabled" : "disabled"}.` });
        return toggled;
      }));
    } catch (error) {
      console.error('Toggle service error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to toggle service",
        variant: "destructive"
      });
    }
  };

  const addService = async () => {
    if (!form.name.trim() || !form.category.trim() || !form.description.trim()) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    try {
      const response = await api.createService({
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim()
      });

      if (!response.success) {
        toast({ 
          title: "Error", 
          description: response.message || "Failed to create service",
          variant: "destructive"
        });
        return;
      }

      // Add new service to local state for immediate UI update
      const newService: AppService = {
        id: `service_${Date.now()}`,
        name: form.name.trim(),
        description: form.description.trim(),
        icon: iconMap[form.category.trim()] || iconMap.Default,
        enabled: true,
        usersActive: 0,
        category: form.category.trim(),
        version: '1.0.0'
      };

      setServices((prev) => [...prev, newService]);
      toast({ title: "Success", description: "Service created successfully" });
      
      // Reset form and close dialog
      setAddOpen(false);
      setForm({ name: "", category: "", description: "" });
    } catch (error) {
      console.error('Create service error:', error);
      toast({ title: "Error", description: "Failed to create service", variant: "destructive" });
    }
  };

  const saveEdit = async () => {
    if (!editService || !form.name.trim() || !form.category.trim() || !form.description.trim()) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    try {
      const response = await api.updateService(editService.id, {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim()
      });

      if (!response.success) {
        toast({ 
          title: "Error", 
          description: response.message || "Failed to update service",
          variant: "destructive"
        });
        return;
      }

      // Update service in local state
      setServices((prev) => prev.map((s) => {
        if (s.id !== editService.id) return s;
        return {
          ...s,
          name: form.name.trim(),
          category: form.category.trim(),
          description: form.description.trim(),
          icon: iconMap[form.category.trim()] || iconMap.Default
        };
      }));

      toast({ title: "Success", description: "Service updated successfully" });
      
      // Reset form and close dialog
      setEditOpen(false);
      setEditService(null);
      setForm({ name: "", category: "", description: "" });
    } catch (error) {
      console.error('Update service error:', error);
      toast({ title: "Error", description: "Failed to update service", variant: "destructive" });
    }
  };

  const deleteService = (id: string) => {
    const svc = services.find((s) => s.id === id);
    
    setConfirm({
      open: true,
      title: `Delete "${svc?.name}"?`,
      description: "This will permanently remove the service and all its data. This action cannot be undone.",
      onConfirm: async () => {
        try {
          const response = await api.deleteService(id);
          
          if (!response.success) {
            toast({ 
              title: "Error", 
              description: response.message || "Failed to delete service",
              variant: "destructive"
            });
            return;
          }

          // Remove service from local state
          setServices((prev) => prev.filter((s) => s.id !== id));
          toast({ title: "Success", description: "Service deleted successfully" });
        } catch (error) {
          console.error('Delete service error:', error);
          toast({ title: "Error", description: "Failed to delete service", variant: "destructive" });
        }
      }
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
        {loading ? (
          <div className="col-span-4 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          [
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
          ))
        )}
      </div>

      <Input placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary/40 border-border/30 max-w-sm" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          filtered.map((service) => (
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
          ))
        )}
      </div>
    </div>
  );
}
