import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter, Download, Shield, UserCog, Trash2, Edit, LogIn, Settings, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  category: string;
  severity: "high" | "medium" | "low" | "info";
  ip: string;
  timestamp: string;
}

const severityColor: Record<string, string> = { 
  high: "bg-red-500/20 text-red-400 border-red-500/30", 
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", 
  low: "bg-green-500/20 text-green-400 border-green-500/30", 
  info: "bg-blue-500/20 text-blue-400 border-blue-500/30" 
};

const categoryIcon: Record<string, React.ReactNode> = { 
  moderation: <Shield className="w-3.5 h-3.5" />, 
  permissions: <UserCog className="w-3.5 h-3.5" />, 
  content: <Edit className="w-3.5 h-3.5" />, 
  settings: <Settings className="w-3.5 h-3.5" />, 
  auth: <LogIn className="w-3.5 h-3.5" />, 
  billing: <Eye className="w-3.5 h-3.5" />, 
  notifications: <Eye className="w-3.5 h-3.5" />, 
  security: <Shield className="w-3.5 h-3.5" />, 
  data: <Download className="w-3.5 h-3.5" />,
  other: <Eye className="w-3.5 h-3.5" />
};

export default function AdminAuditLogs() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("all");

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await api.getAuditLogs({ limit: 100 });
      
      if (response.success && Array.isArray(response.data)) {
        setLogs(response.data);
      } else {
        setLogs([]);
        console.warn('Unexpected audit logs response:', response);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      toast({ title: "Error", description: "Failed to load audit logs" });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((l) => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) || 
                       l.actor.toLowerCase().includes(search.toLowerCase()) || 
                       l.target.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severity === "all" || l.severity === severity;
    return matchSearch && matchSeverity;
  });

  const exportLogs = () => {
    const headers = ["Timestamp", "Action", "Actor", "Target", "Severity", "IP"];
    const rows = filtered.map(l => [l.timestamp, l.action, l.actor, l.target, l.severity, l.ip]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Success", description: "Audit logs exported successfully" });
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {logs.length === 0 ? 'No audit logs found' : 'No logs match your filters'}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((log) => (
                  <TableRow key={log.id} className="border-border/20 hover:bg-secondary/20">
                    <TableCell className="text-xs text-muted-foreground font-mono whitespace-nowrap">{log.timestamp}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{categoryIcon[log.category] || categoryIcon.other}</span>
                        <span className="text-sm text-foreground">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{log.actor}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{log.target}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] capitalize ${severityColor[log.severity]}`}>
                        {log.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{log.ip}</TableCell>
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
