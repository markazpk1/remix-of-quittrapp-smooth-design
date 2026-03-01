import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Search, MoreHorizontal, Flag, Trash2, Eye, Ban, CheckCircle, MessageSquare, ThumbsUp, Users, AlertTriangle, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Post {
  id: number; user: string; avatar: string; content: string; likes: number; comments: number; time: string; status: string; reported: boolean;
}
interface Report {
  id: number; postId: number; reporter: string; reason: string; status: string; time: string;
}

const initialPosts: Post[] = [
  { id: 1, user: "Marcus R.", avatar: "MR", content: "Just hit 90 days! 🎉 Never thought I'd make it this far.", likes: 284, comments: 42, time: "2h ago", status: "active", reported: false },
  { id: 2, user: "Sarah T.", avatar: "ST", content: "Day 15 and going strong. The sound therapy really helps.", likes: 156, comments: 18, time: "4h ago", status: "active", reported: false },
  { id: 3, user: "Anonymous", avatar: "AN", content: "Had a relapse after 30 days. Feeling down but starting over.", likes: 98, comments: 31, time: "6h ago", status: "active", reported: false },
  { id: 4, user: "Jake M.", avatar: "JM", content: "The personalized plan feature is 🔥.", likes: 201, comments: 15, time: "8h ago", status: "active", reported: false },
  { id: 5, user: "David L.", avatar: "DL", content: "[Flagged content - potentially harmful advice]", likes: 12, comments: 5, time: "12h ago", status: "flagged", reported: true },
  { id: 6, user: "Chris K.", avatar: "CK", content: "Check out my website for guaranteed cure...", likes: 3, comments: 1, time: "1d ago", status: "flagged", reported: true },
];

const initialReports: Report[] = [
  { id: 1, postId: 5, reporter: "Sarah T.", reason: "Harmful advice", status: "pending", time: "12h ago" },
  { id: 2, postId: 6, reporter: "Marcus R.", reason: "Spam / Self-promotion", status: "pending", time: "1d ago" },
  { id: 3, postId: 6, reporter: "Jake M.", reason: "Spam / Self-promotion", status: "pending", time: "1d ago" },
  { id: 4, postId: 0, reporter: "Anonymous", reason: "Harassment", status: "resolved", time: "3d ago" },
  { id: 5, postId: 0, reporter: "Leo M.", reason: "Inappropriate content", status: "resolved", time: "5d ago" },
];

export default function AdminCommunity() {
  const [posts, setPosts] = useState(initialPosts);
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [bannedUsers, setBannedUsers] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const filteredPosts = posts.filter((p) => p.user.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()));

  const deletePost = (id: number) => {
    const post = posts.find((p) => p.id === id);
    setConfirm({
      open: true, title: "Delete this post?", description: `This will permanently remove the post by ${post?.user}.`,
      onConfirm: () => { setPosts((prev) => prev.filter((p) => p.id !== id)); toast({ title: "Post Deleted", description: `Post by ${post?.user} has been removed.` }); },
    });
  };

  const flagPost = (id: number) => {
    setPosts((prev) => prev.map((p) => p.id === id ? { ...p, reported: true, status: "flagged" } : p));
    toast({ title: "Post Flagged", description: "Post has been flagged for review." });
  };

  const banUser = (username: string) => {
    setConfirm({
      open: true, title: `Ban ${username}?`, description: `This will ban ${username} and remove all their posts from the community.`,
      onConfirm: () => {
        setBannedUsers((prev) => [...prev, username]);
        setPosts((prev) => prev.filter((p) => p.user !== username));
        toast({ title: "User Banned", description: `${username} has been banned and their posts removed.` });
      },
    });
  };

  const resolveReport = (id: number) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "resolved" } : r));
    toast({ title: "Report Resolved", description: "The report has been marked as resolved." });
  };

  const deleteReportedPost = (report: Report) => {
    setConfirm({
      open: true, title: "Delete reported post?", description: "This will remove the reported post and resolve the report.",
      onConfirm: () => {
        setReports((prev) => prev.map((r) => r.id === report.id ? { ...r, status: "resolved" } : r));
        if (report.postId > 0) setPosts((prev) => prev.filter((p) => p.id !== report.postId));
        toast({ title: "Post Removed", description: "The reported post has been deleted." });
      },
    });
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} confirmLabel="Yes, continue" />

      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Community</h1>
        <p className="text-sm text-muted-foreground">Moderate posts, manage reports, and oversee community health.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Posts", value: posts.length, icon: MessageSquare },
          { label: "Active Users", value: "11,230", icon: Users },
          { label: "Pending Reports", value: pendingCount, icon: AlertTriangle },
          { label: "Banned Users", value: bannedUsers.length, icon: Shield },
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

      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="bg-secondary/40 border border-border/30">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="reports" className="relative">
            Reports
            {pendingCount > 0 && (
              <span className="ml-1.5 w-5 h-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">{pendingCount}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search posts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" />
          </div>

          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <Card key={post.id} className={`bg-card/60 border-border/40 ${post.reported ? "border-red-500/30" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">{post.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{post.user}</span>
                          <span className="text-[11px] text-muted-foreground">{post.time}</span>
                          {post.reported && <Badge variant="outline" className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30"><Flag className="w-2.5 h-2.5 mr-1" /> Reported</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{post.content}</p>
                        <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {post.likes}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.comments}</span>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border/40">
                        <DropdownMenuItem className="text-xs" onClick={() => flagPost(post.id)}><Flag className="w-3 h-3 mr-2" /> Flag Post</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs" onClick={() => banUser(post.user)}><Ban className="w-3 h-3 mr-2" /> Ban User</DropdownMenuItem>
                        <DropdownMenuItem className="text-xs text-red-400" onClick={() => deletePost(post.id)}><Trash2 className="w-3 h-3 mr-2" /> Delete Post</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredPosts.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No posts found.</p>}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className={`bg-card/60 border-border/40 ${report.status === "pending" ? "border-yellow-500/30" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${report.status === "pending" ? "bg-yellow-400" : "bg-green-400"}`} />
                    <div>
                      <div className="text-sm text-foreground"><span className="font-medium">{report.reporter}</span> reported: <span className="text-muted-foreground">{report.reason}</span></div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{report.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] capitalize ${report.status === "pending" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"}`}>{report.status}</Badge>
                    {report.status === "pending" && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Dismiss" onClick={() => resolveReport(report.id)}>
                          <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="Remove post" onClick={() => deleteReportedPost(report)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
