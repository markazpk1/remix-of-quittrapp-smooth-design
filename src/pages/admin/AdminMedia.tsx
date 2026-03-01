import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Search, Upload, Grid3X3, List, Image, FileAudio, FileVideo, FileText, Trash2, Download, Copy, HardDrive } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MediaFile {
  id: number; name: string; type: string; size: string; dimensions: string; uploaded: string; usedIn: string;
}

const initialFiles: MediaFile[] = [
  { id: 1, name: "hero-banner.jpg", type: "image", size: "2.4 MB", dimensions: "1920×1080", uploaded: "2026-02-28", usedIn: "Landing Page" },
  { id: 2, name: "calm-rain.mp3", type: "audio", size: "8.1 MB", dimensions: "3:42", uploaded: "2026-02-27", usedIn: "Sound Therapy" },
  { id: 3, name: "onboarding.mp4", type: "video", size: "24.6 MB", dimensions: "1080×1920", uploaded: "2026-02-26", usedIn: "Welcome Flow" },
  { id: 4, name: "lesson-thumbnail-01.png", type: "image", size: "340 KB", dimensions: "800×600", uploaded: "2026-02-25", usedIn: "Lessons" },
  { id: 5, name: "ocean-waves.mp3", type: "audio", size: "12.3 MB", dimensions: "5:18", uploaded: "2026-02-24", usedIn: "Sound Therapy" },
  { id: 6, name: "privacy-policy.pdf", type: "document", size: "156 KB", dimensions: "—", uploaded: "2026-02-23", usedIn: "Legal" },
  { id: 7, name: "success-story-01.jpg", type: "image", size: "1.8 MB", dimensions: "1200×800", uploaded: "2026-02-22", usedIn: "Community" },
  { id: 8, name: "meditation-guide.mp4", type: "video", size: "18.2 MB", dimensions: "1920×1080", uploaded: "2026-02-21", usedIn: "Lessons" },
  { id: 9, name: "notification-chime.mp3", type: "audio", size: "45 KB", dimensions: "0:02", uploaded: "2026-02-20", usedIn: "System" },
  { id: 10, name: "app-icon.svg", type: "image", size: "12 KB", dimensions: "512×512", uploaded: "2026-02-19", usedIn: "Branding" },
  { id: 11, name: "white-noise.mp3", type: "audio", size: "15.7 MB", dimensions: "6:30", uploaded: "2026-02-18", usedIn: "Sound Therapy" },
  { id: 12, name: "terms-of-service.pdf", type: "document", size: "210 KB", dimensions: "—", uploaded: "2026-02-17", usedIn: "Legal" },
];

const typeIcon: Record<string, React.ReactNode> = {
  image: <Image className="w-5 h-5 text-blue-400" />, audio: <FileAudio className="w-5 h-5 text-green-400" />,
  video: <FileVideo className="w-5 h-5 text-purple-400" />, document: <FileText className="w-5 h-5 text-yellow-400" />,
};
const typeColor: Record<string, string> = {
  image: "bg-blue-500/20 text-blue-400 border-blue-500/30", audio: "bg-green-500/20 text-green-400 border-green-500/30",
  video: "bg-purple-500/20 text-purple-400 border-purple-500/30", document: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function AdminMedia() {
  const [files, setFiles] = useState(initialFiles);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const filtered = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || f.type === typeFilter;
    return matchSearch && matchType;
  });

  const deleteFile = (id: number) => {
    const file = files.find((f) => f.id === id);
    setConfirm({
      open: true, title: `Delete ${file?.name}?`, description: `This will permanently remove this file. It is currently used in "${file?.usedIn}".`,
      onConfirm: () => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
        toast({ title: "File Deleted", description: `${file?.name} has been removed.` });
      },
    });
  };

  const copyUrl = (file: MediaFile) => {
    navigator.clipboard.writeText(`https://cdn.quittrapp.com/media/${file.name}`);
    toast({ title: "URL Copied", description: `URL for ${file.name} copied to clipboard.` });
  };

  const uploadFiles = () => {
    const id = Math.max(...files.map((f) => f.id)) + 1;
    const newFile: MediaFile = { id, name: `new-upload-${id}.png`, type: "image", size: "1.2 MB", dimensions: "1024×768", uploaded: new Date().toISOString().split("T")[0], usedIn: "Unassigned" };
    setFiles((prev) => [newFile, ...prev]);
    toast({ title: "File Uploaded", description: "New file has been uploaded successfully." });
  };

  const typeCounts = { image: files.filter((f) => f.type === "image").length, audio: files.filter((f) => f.type === "audio").length, video: files.filter((f) => f.type === "video").length, document: files.filter((f) => f.type === "document").length };

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} confirmLabel="Delete" />

      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-foreground">Media Library</h1><p className="text-sm text-muted-foreground">Upload and manage all platform assets and files.</p></div>
        <Button className="bg-primary text-primary-foreground text-sm" onClick={uploadFiles}><Upload className="w-3.5 h-3.5 mr-2" /> Upload Files</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-card/60 border-border/40 col-span-2 md:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2"><HardDrive className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Storage</span></div>
            <div className="text-lg font-bold text-foreground">84.2 GB</div>
            <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden mt-2"><div className="h-full rounded-full bg-primary" style={{ width: "84.2%" }} /></div>
            <div className="text-[10px] text-muted-foreground mt-1">15.8 GB free</div>
          </CardContent>
        </Card>
        {Object.entries(typeCounts).map(([type, count]) => (
          <Card key={type} className="bg-card/60 border-border/40"><CardContent className="p-4 flex items-center gap-3">{typeIcon[type]}<div><div className="text-lg font-bold text-foreground">{count}</div><div className="text-xs text-muted-foreground capitalize">{type}s</div></div></CardContent></Card>
        ))}
      </div>

      <Card className="bg-card/60 border-border/40">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search files..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" /></div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32 bg-secondary/40 border-border/30 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent className="bg-card border-border/40"><SelectItem value="all">All Types</SelectItem><SelectItem value="image">Images</SelectItem><SelectItem value="audio">Audio</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="document">Documents</SelectItem></SelectContent>
            </Select>
            <div className="flex border border-border/30 rounded-md overflow-hidden">
              <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-none ${view === "grid" ? "bg-secondary" : ""}`} onClick={() => setView("grid")}><Grid3X3 className="w-3.5 h-3.5" /></Button>
              <Button variant="ghost" size="icon" className={`h-8 w-8 rounded-none ${view === "list" ? "bg-secondary" : ""}`} onClick={() => setView("list")}><List className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {view === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {filtered.map((file) => (
                <Dialog key={file.id}>
                  <DialogTrigger asChild>
                    <div className="group bg-secondary/30 rounded-lg border border-border/20 p-3 cursor-pointer hover:border-primary/30 transition-colors">
                      <div className="aspect-square rounded-md bg-secondary/60 flex items-center justify-center mb-2">{typeIcon[file.type]}</div>
                      <div className="text-xs text-foreground font-medium truncate">{file.name}</div>
                      <div className="text-[10px] text-muted-foreground">{file.size}</div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border/40 max-w-sm">
                    <DialogHeader><DialogTitle className="text-foreground text-sm">{file.name}</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div className="aspect-video bg-secondary/40 rounded-lg flex items-center justify-center">{typeIcon[file.type]}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground capitalize">{file.type}</span></div>
                        <div><span className="text-muted-foreground">Size:</span> <span className="text-foreground">{file.size}</span></div>
                        <div><span className="text-muted-foreground">Dimensions:</span> <span className="text-foreground">{file.dimensions}</span></div>
                        <div><span className="text-muted-foreground">Uploaded:</span> <span className="text-foreground">{file.uploaded}</span></div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs border-border/30" onClick={() => copyUrl(file)}><Copy className="w-3 h-3 mr-1.5" /> Copy URL</Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs border-border/30" onClick={() => toast({ title: "Download Started" })}><Download className="w-3 h-3 mr-1.5" /> Download</Button>
                        <Button variant="outline" size="sm" className="text-xs border-red-500/30 text-red-400" onClick={() => deleteFile(file.id)}><Trash2 className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-2.5 rounded-md hover:bg-secondary/20 group">
                  <div className="w-8 h-8 rounded bg-secondary/60 flex items-center justify-center shrink-0">{typeIcon[file.type]}</div>
                  <div className="flex-1 min-w-0"><div className="text-sm text-foreground font-medium truncate">{file.name}</div><div className="text-xs text-muted-foreground">{file.size} · {file.dimensions} · {file.uploaded}</div></div>
                  <Badge variant="outline" className={`text-[10px] capitalize ${typeColor[file.type]}`}>{file.type}</Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyUrl(file)}><Copy className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400" onClick={() => deleteFile(file.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
