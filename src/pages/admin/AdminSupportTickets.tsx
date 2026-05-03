import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Search, MessageSquare, Clock, CheckCircle2, AlertCircle, XCircle, Send, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { fetchSupportTicketsFromDatabase, updateSupportTicketStatus, addSupportTicketReply, fetchTicketReplies, deleteSupportTicket } from "@/services/supabase";

interface Ticket {
  id: string; uuid: string; subject: string; user: string; email: string; priority: string; status: string; category: string; created: string; lastReply: string; messages: number; replies: string[];
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
  const [ticketReplies, setTicketReplies] = useState<Record<string, any[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchSupportData();
  }, []);

  const fetchSupportData = async () => {
    try {
      setLoading(true);
      
      // Fetch tickets from database (fallback to mock API if tables don't exist)
      let ticketsRes;
      try {
        ticketsRes = await fetchSupportTicketsFromDatabase();
      } catch (error) {
        console.log('Support tickets database not available, falling back to mock API');
        ticketsRes = await api.getSupportTickets();
      }
      
      // Fetch stats from API (for now)
      const statsRes = await api.getSupportStats();

      // Transform tickets data to match Ticket interface
      const transformedTickets = (ticketsRes.data || []).map((item: any) => ({
        id: item.ticket_number || item.id,
        uuid: item.id, // Store the actual UUID for database operations
        subject: item.subject || 'No subject',
        user: item.user_name || 'Unknown User',
        email: item.user_email || 'unknown@example.com',
        priority: item.priority || 'medium',
        status: item.status || 'open',
        category: item.category || 'general',
        created: new Date(item.created_at || item.created).toLocaleDateString(),
        lastReply: new Date(item.last_reply_at || item.lastReply || item.created_at).toLocaleDateString() + ' ' + new Date(item.last_reply_at || item.lastReply || item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        messages: (item.ticket_replies?.count || 0) + 1, // +1 for the original ticket message
        replies: [] // Will be loaded when ticket is opened
      }));

      setTickets(transformedTickets);
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

  const fetchTicketRepliesData = async (ticketId: string, ticketUuid: string) => {
    try {
      setLoadingReplies(prev => ({ ...prev, [ticketId]: true }));
      
      const result = await fetchTicketReplies(ticketUuid);
      
      if (result.success) {
        setTicketReplies(prev => ({ ...prev, [ticketId]: result.data || [] }));
      } else {
        console.error('Failed to fetch replies:', result.message);
        setTicketReplies(prev => ({ ...prev, [ticketId]: [] }));
      }
    } catch (error) {
      console.error('Fetch replies error:', error);
      setTicketReplies(prev => ({ ...prev, [ticketId]: [] }));
    } finally {
      setLoadingReplies(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  const sendReply = async (ticketId: string) => {
    const replyText = replyTexts[ticketId];
    if (!replyText || !replyText.trim()) {
      toast({ title: "Error", description: "Reply message is required", variant: "destructive" });
      return;
    }

    try {
      // Find the ticket to get its UUID
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket || !ticket.uuid) {
        throw new Error('Ticket not found or missing UUID');
      }

      const result = await addSupportTicketReply(ticket.uuid, replyText.trim());
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Clear the reply text
      setReplyTexts(prev => ({ ...prev, [ticketId]: "" }));
      
      // Update local state immediately for better UX
      setTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { 
              ...t, 
              messages: (t.messages || 1) + 1, // Ensure we start from at least 1 (original message)
              lastReply: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } 
          : t
      ));
      
      // Also refresh the tickets list to get latest data from database
      await fetchSupportData();
      
      // Refresh replies for this ticket
      if (ticket.uuid) {
        await fetchTicketRepliesData(ticketId, ticket.uuid);
      }
      
      toast({ title: "Success", description: "Reply sent successfully" });
    } catch (error) {
      console.error('Send reply error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to send reply", variant: "destructive" });
    }
  };

  const changeTicketStatus = async (ticketId: string, status: string) => {
    try {
      // Find the ticket to get its UUID
      const ticket = tickets.find(t => t.id === ticketId);
      if (!ticket || !ticket.uuid) {
        throw new Error('Ticket not found or missing UUID');
      }

      const result = await updateSupportTicketStatus(ticket.uuid, status);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Update local state
      setTickets(prev => prev.map(ticket => 
        ticket.id === ticketId ? { ...ticket, status } : ticket
      ));
      
      toast({ title: "Success", description: `Ticket status updated to ${status.replace("_", " ")}` });
    } catch (error) {
      console.error('Change status error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update status", variant: "destructive" });
    }
  };

  const deleteTicket = async (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    try {
      // Find the ticket to get its UUID
      const ticketToDelete = tickets.find(t => t.id === ticketId);
      if (!ticketToDelete || !ticketToDelete.uuid) {
        throw new Error('Ticket not found or missing UUID');
      }

      const result = await deleteSupportTicket(ticketToDelete.uuid);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Remove from local state
      setTickets(prev => prev.filter(t => t.id !== ticketId));
      
      toast({ title: "Success", description: "Ticket deleted permanently" });
    } catch (error) {
      console.error('Delete ticket error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete ticket", variant: "destructive" });
    }
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
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-primary"
                            onClick={() => {
                              // Fetch replies when dialog opens
                              if (t.uuid && !ticketReplies[t.id]) {
                                fetchTicketRepliesData(t.id, t.uuid);
                              }
                            }}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border/40 max-w-lg">
                          <DialogHeader><DialogTitle className="text-foreground text-base">{t.id}: {t.subject}</DialogTitle></DialogHeader>
                          <div className="space-y-4 mt-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>From: <strong className="text-foreground">{t.user}</strong></span><span>·</span><span>{t.created}</span>
                            </div>
                            <div className="bg-secondary/40 rounded-lg p-3 text-sm text-muted-foreground">
                              This is a support request regarding: {t.subject}. The user needs assistance with their {t.category} issue.
                            </div>
                            {loadingReplies[t.id] ? (
                              <div className="text-center py-4 text-xs text-muted-foreground">
                                Loading replies...
                              </div>
                            ) : (
                              ticketReplies[t.id]?.map((reply: any, i: number) => (
                                <div key={i} className="bg-primary/10 rounded-lg p-3 text-sm text-foreground border border-primary/20">
                                  <div className="text-[10px] text-muted-foreground mb-1">
                                    {reply.reply_type === 'admin' ? 'Admin Reply' : 'User Message'} · {new Date(reply.created_at).toLocaleDateString()} {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                  {reply.message}
                                </div>
                              ))
                            )}
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
                          <DialogFooter className="flex justify-between">
                            <Button variant="destructive" size="sm" className="text-xs" onClick={() => deleteTicket(t.id)}><Trash2 className="w-3 h-3 mr-1" /> Delete Ticket</Button>
                            <div></div> {/* Empty div for spacing */}
                          </DialogFooter>
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
