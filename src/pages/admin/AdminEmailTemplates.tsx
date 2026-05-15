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
  Mail,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ChevronRight,
  Send,
  Eye,
  ArrowLeft,
  Settings2,
  FileText,
  Clock,
  Sparkles
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

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  lastEdited: string;
  status: string;
}

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<EmailTemplate>>({
    name: "",
    subject: "",
    body: "",
    status: "draft"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await api.getEmailTemplates();
      if (res.success) {
        setTemplates(res.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast({ title: "Error", description: "Failed to load templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate.name || !currentTemplate.subject || !currentTemplate.body) {
      toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    try {
      let res;
      if (isEditing && currentTemplate.id) {
        res = await api.updateEmailTemplate(currentTemplate.id, currentTemplate);
      } else {
        res = await api.createEmailTemplate(currentTemplate);
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

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const res = await api.deleteEmailTemplate(templateToDelete);
      if (res.success) {
        toast({ title: "Success", description: res.message });
        setIsDeleteDialogOpen(false);
        fetchTemplates();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete template", variant: "destructive" });
    }
  };

  const openEditDialog = (template: EmailTemplate) => {
    setCurrentTemplate(template);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setCurrentTemplate({
      name: "",
      subject: "",
      body: "",
      status: "draft"
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Email Templates</h1>
          <p className="text-sm text-muted-foreground">Design and manage reusable email layouts for your marketing campaigns.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-border/30 bg-background/50" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={openCreateDialog} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card/40 border border-border/40 p-4 rounded-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates by name or subject..." 
            className="pl-10 bg-background/50 border-border/20 focus:border-primary/50 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40 bg-background/50 border-border/20">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="bg-card/40 border-border/40 animate-pulse h-48" />
          ))}
        </div>
      ) : filteredTemplates.length === 0 ? (
        <Card className="bg-card/40 border-border/40 border-dashed py-20">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No templates found</h3>
            <p className="text-sm text-muted-foreground max-w-xs mt-2">
              {searchQuery ? "No templates match your search criteria." : "Get started by creating your first email template."}
            </p>
            {!searchQuery && (
              <Button onClick={openCreateDialog} variant="outline" className="mt-6 border-primary/20 text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4 mr-2" />
                Create First Template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="bg-card/40 border-border/40 hover:border-primary/30 transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm border border-border/20 shadow-sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => openEditDialog(template)}>
                      <Edit className="w-4 h-4 mr-2" /> Edit Template
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" /> Preview
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setTemplateToDelete(template.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant="secondary" 
                    className={`text-[10px] uppercase font-bold tracking-wider rounded-full ${
                      template.status === "published" ? "bg-emerald-400/10 text-emerald-400" :
                      template.status === "draft" ? "bg-amber-400/10 text-amber-400" :
                      "bg-muted text-muted-foreground"
                    }`}
                  >
                    {template.status}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {template.lastEdited}
                  </span>
                </div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">{template.name}</CardTitle>
                <CardDescription className="line-clamp-1">{template.subject}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="bg-muted/30 rounded-lg p-3 text-[11px] text-muted-foreground line-clamp-3 font-mono border border-border/10">
                  {template.body}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                    <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-medium">
                      +12
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-[11px] font-medium" onClick={() => openEditDialog(template)}>
                    View Editor <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border/40 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? <Edit className="w-5 h-5 text-primary" /> : <Plus className="w-5 h-5 text-primary" />}
              {isEditing ? "Edit Email Template" : "Create New Template"}
            </DialogTitle>
            <DialogDescription>
              Define the name, subject and content for your reusable email.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Template Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. Welcome Email" 
                  value={currentTemplate.name}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                  className="bg-background/50 border-border/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Status</Label>
                <Select 
                  value={currentTemplate.status} 
                  onValueChange={(val) => setCurrentTemplate({...currentTemplate, status: val})}
                >
                  <SelectTrigger className="bg-background/50 border-border/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Email Subject</Label>
              <Input 
                id="subject" 
                placeholder="e.g. Welcome to QuittrApp! {{user_name}}" 
                value={currentTemplate.subject}
                onChange={(e) => setCurrentTemplate({...currentTemplate, subject: e.target.value})}
                className="bg-background/50 border-border/20 font-medium"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="body" className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Email Body (HTML/Text)</Label>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-primary hover:bg-primary/10">
                  <Sparkles className="w-3 h-3 mr-1" /> Use AI Assistant
                </Button>
              </div>
              <Textarea 
                id="body" 
                placeholder="Write your email content here. Use {{variable_name}} for dynamic data." 
                className="min-h-[250px] bg-background/50 border-border/20 font-mono text-sm leading-relaxed"
                value={currentTemplate.body}
                onChange={(e) => setCurrentTemplate({...currentTemplate, body: e.target.value})}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {["user_name", "app_link", "reset_token", "current_date"].map(tag => (
                  <Badge key={tag} variant="outline" className="text-[9px] cursor-pointer hover:bg-muted/50 border-border/20" onClick={() => {
                    setCurrentTemplate({...currentTemplate, body: (currentTemplate.body || "") + `{{${tag}}}`});
                  }}>
                    + {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="border border-border/20">Cancel</Button>
            <Button onClick={handleSaveTemplate} className="bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <FileText className="w-4 h-4 mr-2" />
              {isEditing ? "Update Template" : "Save Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md bg-card border-border/40 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the email template and remove it from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsDeleteDialogOpen(false)} className="border border-border/20">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteTemplate} className="shadow-lg shadow-destructive/20">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
