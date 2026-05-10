import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { Sparkles, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { api } from "../../services/api";

export default function AdminInspiration() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [quoteForm, setQuoteForm] = useState({ text: "", author: "", stage: "early" });
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ 
    open: false, title: "", description: "", onConfirm: () => {} 
  });

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await api.fetchDailyInspirations();
      if (response.success) {
        setQuotes(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      toast({ title: "Error", description: "Failed to load quotes", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuote = async () => {
    if (!quoteForm.text.trim()) {
      toast({ title: "Error", description: "Quote text is required" });
      return;
    }

    try {
      setIsSavingQuote(true);
      let response;
      if (editingQuote) {
        response = await api.updateDailyInspiration(editingQuote.id, quoteForm);
      } else {
        response = await api.createDailyInspiration(quoteForm);
      }

      if (response.success) {
        toast({ title: "Success", description: editingQuote ? "Quote updated" : "Quote created" });
        setQuoteDialogOpen(false);
        setEditingQuote(null);
        setQuoteForm({ text: "", author: "", stage: "early" });
        fetchQuotes();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save quote", variant: "destructive" });
    } finally {
      setIsSavingQuote(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    setConfirm({
      open: true,
      title: "Delete Quote?",
      description: "This will remove this quote from the daily rotation shown to users.",
      onConfirm: async () => {
        try {
          const response = await api.deleteDailyInspiration(id);
          if (response.success) {
            toast({ title: "Deleted", description: "Quote removed successfully" });
            fetchQuotes();
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to delete quote", variant: "destructive" });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog 
        open={confirm.open} 
        onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} 
        title={confirm.title} 
        description={confirm.description} 
        onConfirm={confirm.onConfirm} 
        confirmLabel="Yes, delete" 
      />

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Daily Inspiration</h1>
          <p className="text-sm text-muted-foreground">Manage motivational quotes shown on user dashboards based on their recovery stage.</p>
        </div>
        <Button onClick={() => { setEditingQuote(null); setQuoteForm({ text: "", author: "", stage: "early" }); setQuoteDialogOpen(true); }} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" /> Add New Quote
        </Button>
      </div>

      <Card className="bg-card/50 border-border/40 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <CardTitle className="text-base font-medium">Rotation Quotes ({quotes.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full bg-secondary/40" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-muted-foreground pl-6">Quote Content</TableHead>
                  <TableHead className="text-muted-foreground">Recovery Stage</TableHead>
                  <TableHead className="text-muted-foreground w-24 pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Sparkles className="w-8 h-8 opacity-20" />
                        <p>No quotes added yet. Create your first inspiration quote!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  quotes.map((q) => (
                    <TableRow key={q.id} className="border-border/20 hover:bg-secondary/20 group">
                      <TableCell className="pl-6 py-4">
                        <div className="max-w-2xl">
                          <p className="text-sm text-foreground font-medium italic leading-relaxed">"{q.text}"</p>
                          <p className="text-xs text-muted-foreground mt-1.5 font-medium">— {q.author || "Unknown"}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${
                          q.stage === 'early' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          q.stage === 'building' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          'bg-green-500/10 text-green-400 border-green-500/20'
                        }`}>{q.stage}</Badge>
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" onClick={() => { setEditingQuote(q); setQuoteForm({ text: q.text, author: q.author || "", stage: q.stage }); setQuoteDialogOpen(true); }}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400 text-muted-foreground" onClick={() => handleDeleteQuote(q.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent className="bg-card border-border/40 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {editingQuote ? "Edit Quote" : "Add New Inspiration"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quote Text</Label>
              <Textarea 
                value={quoteForm.text} 
                onChange={(e) => setQuoteForm({ ...quoteForm, text: e.target.value })} 
                placeholder="Enter the motivational message..." 
                className="bg-secondary/40 border-border/30 min-h-[100px] resize-none focus:ring-primary"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Author (Optional)</Label>
                <Input 
                  value={quoteForm.author} 
                  onChange={(e) => setQuoteForm({ ...quoteForm, author: e.target.value })} 
                  placeholder="e.g. Marcus Aurelius" 
                  className="bg-secondary/40 border-border/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Recovery Stage</Label>
                <Select value={quoteForm.stage} onValueChange={(v) => setQuoteForm({ ...quoteForm, stage: v })}>
                  <SelectTrigger className="bg-secondary/40 border-border/30 capitalize">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/40">
                    <SelectItem value="early">Early (0-14 days)</SelectItem>
                    <SelectItem value="building">Building (15-60 days)</SelectItem>
                    <SelectItem value="strong">Strong (60+ days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="pt-2 gap-2">
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleSaveQuote} disabled={isSavingQuote || !quoteForm.text.trim()} className="min-w-[100px]">
                {isSavingQuote ? "Saving..." : editingQuote ? "Update Quote" : "Create Quote"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
