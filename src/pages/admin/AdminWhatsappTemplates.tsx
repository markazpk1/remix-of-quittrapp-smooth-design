import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import {
  Smartphone,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ChevronRight,
  Eye,
  ArrowLeft,
  Settings2,
  FileText,
  Clock,
  Sparkles,
  MessageCircle,
  CheckCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function AdminWhatsappTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>({
    name: "",
    category: "MARKETING",
    language: "en_US",
    body: "",
    header_text: "",
    footer_text: "",
    status: "pending"
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.getWhatsappTemplates();
      if (res.success) setTemplates(res.data || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTemplate.name || !currentTemplate.body) {
      toast({ title: "Error", description: "Name and Body are required", variant: "destructive" });
      return;
    }
    try {
      let res;
      if (isEditing) {
        res = await api.updateWhatsappTemplate(currentTemplate.id, currentTemplate);
      } else {
        res = await api.createWhatsappTemplate(currentTemplate);
      }
      if (res.success) {
        toast({ title: "Success", description: res.message });
        setIsDialogOpen(false);
        fetchTemplates();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save template", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await api.deleteWhatsappTemplate(id);
      if (res.success) {
        toast({ title: "Success", description: res.message });
        fetchTemplates();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete template", variant: "destructive" });
    }
  };

  const filtered = templates.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">WhatsApp Templates</h1>
          <p className="text-sm text-muted-foreground">Manage your pre-approved WhatsApp message templates.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.history.back()} className="border-border/30 bg-background/50">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <Button onClick={() => { setIsEditing(false); setCurrentTemplate({ name: "", category: "MARKETING", language: "en_US", body: "", status: "pending" }); setIsDialogOpen(true); }} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card/40 border border-border/40 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates..." 
            className="pl-10 bg-background/50 border-border/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-card/40 rounded-xl border border-border/40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(t => (
            <Card key={t.id} className="bg-card/40 border-border/40 hover:border-emerald-500/30 transition-all group relative">
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setCurrentTemplate(t); setIsEditing(true); setIsDialogOpen(true); }}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(t.id)}><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge className={`text-[10px] ${t.status === 'approved' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'}`}>
                    {t.status.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{t.lastEdited}</span>
                </div>
                <CardTitle className="text-base font-bold">{t.name}</CardTitle>
                <CardDescription>{t.category} • {t.language}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3 text-[11px] font-mono text-muted-foreground line-clamp-4 relative">
                  <MessageCircle className="absolute top-2 right-2 w-3 h-3 opacity-20" />
                  {t.body}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border/40 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Template" : "New WhatsApp Template"}</DialogTitle>
            <DialogDescription>Templates must be approved by Meta before they can be sent.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Template Name</Label>
                <Input value={currentTemplate.name} onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})} placeholder="e.g. greeting_message" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={currentTemplate.category} onValueChange={(val) => setCurrentTemplate({...currentTemplate, category: val})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKETING">Marketing</SelectItem>
                    <SelectItem value="UTILITY">Utility</SelectItem>
                    <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Template Body</Label>
              <Textarea 
                value={currentTemplate.body} 
                onChange={(e) => setCurrentTemplate({...currentTemplate, body: e.target.value})} 
                placeholder="Hello {{1}}, welcome to our service!" 
                className="min-h-[150px] font-mono"
              />
              <p className="text-[10px] text-muted-foreground">Use {"{{1}}"}, {"{{2}}"} for placeholders.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-emerald-500 text-white">
              {isEditing ? "Update Template" : "Create & Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
