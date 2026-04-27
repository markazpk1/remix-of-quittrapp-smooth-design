import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, MessageSquare, Clock, CheckCircle2, AlertCircle, XCircle, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface Ticket {
  id: string; subject: string; user: string; email: string; priority: string; status: string; category: string; created: string; lastReply: string; messages: number; replies: string[];
}

const priorityColor: Record<string, string> = { critical: "bg-red-500/20 text-red-400 border-red-500/30", high: "bg-orange-500/20 text-orange-400 border-orange-500/30", medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", low: "bg-green-500/20 text-green-400 border-green-500/30" };
const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  open: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <AlertCircle className="w-3 h-3" /> },
  in_progress: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
  resolved: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <CheckCircle2 className="w-3 h-3" /> },
  closed: { color: "bg-muted text-muted-foreground border-border/30", icon: <XCircle className="w-3 h-3" /> },
};

export default function AdminSupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [statusChanges, setStatusChanges] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, statsRes] = await Promise.all([
        api.getSupportTickets(),
        api.getSupportStats(),
      ]);

      setTickets(Array.isArray(ticketsRes) ? ticketsRes : []);
    } catch (error) {
      console.error('Failed to fetch support data:', error);
      toast({ title: "Error", description: "Failed to load support data" });
      // Set empty array to prevent filter errors
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tickets.filter((t) => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.user.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const sendReply = (ticketId: string) => {
    toast({ title: "Not Implemented", description: "Ticket reply coming soon" });
  };

  const changeTicketStatus = (ticketId: string, status: string) => {
    toast({ title: "Not Implemented", description: "Ticket status update coming soon" });
  };

  const stats = [
    { label: "Open", value: tickets.filter((t) => t.status === "open").length, color: "text-blue-400" },
    { label: "In Progress", value: tickets.filter((t) => t.status === "in_progress").length, color: "text-yellow-400" },
    { label: "Resolved", value: tickets.filter((t) => t.status === "resolved").length, color: "text-green-400" },
    { label: "Avg Response", value: "0h", color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="font-display text-2xl font-bold text-foreground">Support Tickets</h1><p className="text-sm text-muted-foreground">Manage user inquiries, bug reports, and feature requests.</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading ? (
          <div className="col-span-4 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          stats.map((s) => (<Card key={s.label} className="bg-card/60 border-border/40"><CardContent className="p-4 text-center"><div className={`text-2xl font-bold ${s.color}`}>{s.value}</div><div className="text-xs text-muted-foreground mt-1">{s.label}</div></CardContent></Card>))
        )}
      </div>

      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 bg-secondary/40 border-border/30 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent className="bg-card border-border/40">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Ticket</TableHead>
                <TableHead className="text-muted-foreground">Subject</TableHead>
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Priority</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Last Reply</TableHead>
                <TableHead className="text-muted-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.id} className="border-border/20 hover:bg-secondary/20">
                    <TableCell className="text-xs font-mono text-primary">{t.id}</TableCell>
                    <TableCell><div className="text-sm text-foreground font-medium max-w-[250px] truncate">{t.subject}</div></TableCell>
                    <TableCell><div className="text-sm text-foreground">{t.user}</div><div className="text-xs text-muted-foreground">{t.email}</div></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${priorityColor[t.priority]}`}>{t.priority}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={`text-[10px] capitalize flex items-center gap-1 w-fit ${statusConfig[t.status].color}`}>{statusConfig[t.status].icon}{t.status.replace("_", " ")}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground"><div className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {t.messages}<span className="mx-1">·</span>{t.lastReply}</div></TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild><Button variant="ghost" size="sm" className="text-xs text-primary">View</Button></DialogTrigger>
                        <DialogContent className="bg-card border-border/40 max-w-lg">
                          <DialogHeader><DialogTitle className="text-foreground text-base">{t.id}: {t.subject}</DialogTitle></DialogHeader>
                          <div className="space-y-4 mt-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>From: <strong className="text-foreground">{t.user}</strong></span><span>·</span><span>{t.created}</span>
                            </div>
                            <div className="bg-secondary/40 rounded-lg p-3 text-sm text-muted-foreground">
                              This is a support request regarding: {t.subject}. The user needs assistance with their {t.category} issue.
                            </div>
                            {t.replies.map((reply, i) => (
                              <div key={i} className="bg-primary/10 rounded-lg p-3 text-sm text-foreground border border-primary/20">
                                <div className="text-[10px] text-muted-foreground mb-1">Admin Reply</div>
                                {reply}
                              </div>
                            ))}
                            <Textarea placeholder="Write a reply..." value={replyTexts[t.id] || ""} onChange={(e) => setReplyTexts((prev) => ({ ...prev, [t.id]: e.target.value }))} className="bg-secondary/40 border-border/30 text-sm" rows={3} />
                            <div className="flex items-center justify-between">
                              <Select value={statusChanges[t.id] || t.status} onValueChange={(v) => changeTicketStatus(t.id, v)}>
                                <SelectTrigger className="w-36 bg-secondary/40 border-border/30 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent className="bg-card border-border/40">
                                  <SelectItem value="open">Open</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button size="sm" className="text-xs" onClick={() => sendReply(t.id)}><Send className="w-3 h-3 mr-1.5" /> Send Reply</Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
