import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Shield, UserCog, Trash2, Edit, LogIn, Settings, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const logs = [
  { id: 1, action: "User Banned", actor: "Sarah Chen", target: "Priya Sharma", category: "moderation", severity: "high", ip: "192.168.1.42", timestamp: "2026-02-28 14:32:10" },
  { id: 2, action: "Role Changed", actor: "Sarah Chen", target: "James O'Brien → Moderator", category: "permissions", severity: "medium", ip: "192.168.1.42", timestamp: "2026-02-28 13:15:44" },
  { id: 3, action: "Content Deleted", actor: "James O'Brien", target: "Post #4521", category: "content", severity: "medium", ip: "10.0.0.15", timestamp: "2026-02-28 12:08:22" },
  { id: 4, action: "Settings Updated", actor: "Sarah Chen", target: "Maintenance Mode → OFF", category: "settings", severity: "low", ip: "192.168.1.42", timestamp: "2026-02-28 11:45:00" },
  { id: 5, action: "Admin Login", actor: "Sarah Chen", target: "Dashboard", category: "auth", severity: "info", ip: "192.168.1.42", timestamp: "2026-02-28 09:00:12" },
  { id: 6, action: "Subscription Modified", actor: "Sarah Chen", target: "Marcus Rivera → Enterprise", category: "billing", severity: "medium", ip: "192.168.1.42", timestamp: "2026-02-27 16:22:33" },
  { id: 7, action: "Lesson Published", actor: "James O'Brien", target: "Understanding Triggers", category: "content", severity: "low", ip: "10.0.0.15", timestamp: "2026-02-27 14:10:05" },
  { id: 8, action: "Bulk Notification Sent", actor: "Sarah Chen", target: "1,240 Pro Users", category: "notifications", severity: "medium", ip: "192.168.1.42", timestamp: "2026-02-27 10:30:00" },
  { id: 9, action: "User Account Deleted", actor: "Sarah Chen", target: "user_8812@email.com", category: "moderation", severity: "high", ip: "192.168.1.42", timestamp: "2026-02-26 15:44:18" },
  { id: 10, action: "API Key Rotated", actor: "System", target: "Stripe Webhook Key", category: "security", severity: "high", ip: "—", timestamp: "2026-02-26 03:00:00" },
  { id: 11, action: "Export Generated", actor: "James O'Brien", target: "Users CSV (10,400 records)", category: "data", severity: "medium", ip: "10.0.0.15", timestamp: "2026-02-25 11:20:44" },
  { id: 12, action: "Feature Toggle", actor: "Sarah Chen", target: "AI Companion → Enabled", category: "settings", severity: "low", ip: "192.168.1.42", timestamp: "2026-02-25 09:15:30" },
];

const severityColor: Record<string, string> = { high: "bg-red-500/20 text-red-400 border-red-500/30", medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", low: "bg-green-500/20 text-green-400 border-green-500/30", info: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
const categoryIcon: Record<string, React.ReactNode> = { moderation: <Shield className="w-3.5 h-3.5" />, permissions: <UserCog className="w-3.5 h-3.5" />, content: <Edit className="w-3.5 h-3.5" />, settings: <Settings className="w-3.5 h-3.5" />, auth: <LogIn className="w-3.5 h-3.5" />, billing: <Eye className="w-3.5 h-3.5" />, notifications: <Eye className="w-3.5 h-3.5" />, security: <Shield className="w-3.5 h-3.5" />, data: <Download className="w-3.5 h-3.5" /> };

export default function AdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");

  const filtered = logs.filter((l) => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase()) || l.target.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severity === "all" || l.severity === severity;
    return matchSearch && matchSeverity;
  });

  const exportLogs = () => {
    const csv = ["Timestamp,Action,Actor,Target,Severity,IP", ...filtered.map((l) => `${l.timestamp},${l.action},${l.actor},${l.target},${l.severity},${l.ip}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "audit-logs.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Logs Exported", description: `${filtered.length} entries exported as CSV.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-foreground">Audit Logs</h1><p className="text-sm text-muted-foreground">Track every admin action for compliance and security.</p></div>
        <Button variant="outline" className="border-border/30 text-sm" onClick={exportLogs}><Download className="w-3.5 h-3.5 mr-2" /> Export Logs</Button>
      </div>

      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search actions, actors, targets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" /></div>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger className="w-36 bg-secondary/40 border-border/30 text-sm"><Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" /><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent className="bg-card border-border/40"><SelectItem value="all">All Severity</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="low">Low</SelectItem><SelectItem value="info">Info</SelectItem></SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow className="border-border/30 hover:bg-transparent"><TableHead className="text-muted-foreground">Timestamp</TableHead><TableHead className="text-muted-foreground">Action</TableHead><TableHead className="text-muted-foreground">Actor</TableHead><TableHead className="text-muted-foreground">Target</TableHead><TableHead className="text-muted-foreground">Severity</TableHead><TableHead className="text-muted-foreground">IP</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id} className="border-border/20 hover:bg-secondary/20">
                  <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">{log.timestamp}</TableCell>
                  <TableCell><div className="flex items-center gap-2"><span className="text-muted-foreground">{categoryIcon[log.category]}</span><span className="text-sm text-foreground">{log.action}</span></div></TableCell>
                  <TableCell className="text-sm text-foreground">{log.actor}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{log.target}</TableCell>
                  <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${severityColor[log.severity]}`}>{log.severity}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">{log.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
