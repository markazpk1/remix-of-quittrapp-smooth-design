import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Search, Upload, Grid3X3, List, Image, FileAudio, FileVideo, FileText, Trash2, Download, Copy, HardDrive } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";

interface MediaFile {
  id: string; name: string; type: string; size: string; dimensions: string; uploaded: string; usedIn: string; url?: string;
}

interface StorageStats {
  total: number; used: number; free: number; percentage: number;
}

const typeIcon: Record<string, React.ReactNode> = {
  image: <Image className="w-5 h-5 text-blue-400" />, audio: <FileAudio className="w-5 h-5 text-green-400" />,
  video: <FileVideo className="w-5 h-5 text-purple-400" />, document: <FileText className="w-5 h-5 text-yellow-400" />,
};
const typeColor: Record<string, string> = {
  image: "bg-blue-500/20 text-blue-400 border-blue-500/30", audio: "bg-green-500/20 text-green-400 border-green-500/30",
  video: "bg-purple-500/20 text-purple-400 border-purple-500/30", document: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

export default function AdminMedia() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [storageStats, setStorageStats] = useState<StorageStats>({ total: 100, used: 0, free: 100, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  useEffect(() => {
    fetchMediaData();
  }, []);

  const fetchMediaData = async () => {
    try {
      setLoading(true);
      const [filesRes, storageRes] = await Promise.all([
        api.getMediaFiles(),
        api.getStorageStats(),
      ]);

      setFiles(filesRes.success && Array.isArray(filesRes.data) ? filesRes.data : []);
      setStorageStats(storageRes.success && storageRes.data ? storageRes.data : { total: 100, used: 0, free: 100, percentage: 0 });
    } catch (error) {
      console.error('Failed to fetch media data:', error);
      toast({ title: "Error", description: "Failed to load media data" });
      // Set empty arrays to prevent filter errors
      setFiles([]);
      setStorageStats({ total: 100, used: 0, free: 100, percentage: 0 });
    } finally {
      setLoading(false);
    }
  };

  const filtered = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || f.type === typeFilter;
    return matchSearch && matchType;
  });

  const deleteFile = async (id: string) => {
    setConfirm({
      open: true,
      title: "Delete File",
      description: "Are you sure you want to delete this file? This action cannot be undone.",
      onConfirm: async () => {
        try {
          const res = await api.deleteMediaFile(id);
          if (res.success) {
            toast({ title: "Success", description: "File deleted successfully" });
            fetchMediaData();
          } else {
            throw new Error(res.message);
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to delete file", variant: "destructive" });
        }
      }
    });
  };

  const copyUrl = (file: MediaFile) => {
    if (file.url) {
      navigator.clipboard.writeText(file.url);
      toast({ title: "Copied", description: "URL copied to clipboard" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const res = await api.uploadMediaFile(files[i]);
        if (!res.success) throw new Error(res.message);
      }
      toast({ title: "Success", description: `Uploaded ${files.length} file(s)` });
      fetchMediaData();
    } catch (error: any) {
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const uploadFiles = () => {
    fileInputRef.current?.click();
  };

  const typeCounts = { image: files.filter((f) => f.type === "image").length, audio: files.filter((f) => f.type === "audio").length, video: files.filter((f) => f.type === "video").length, document: files.filter((f) => f.type === "document").length };

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} confirmLabel="Delete" />

      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl font-bold text-foreground">Media Library</h1><p className="text-sm text-muted-foreground">Upload and manage all platform assets and files.</p></div>
        <div className="flex items-center gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
          <Button 
            className="bg-primary text-primary-foreground text-sm" 
            onClick={uploadFiles} 
            disabled={uploading}
          >
            {uploading ? (
              <div className="flex items-center"><div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-current mr-2"></div> Uploading...</div>
            ) : (
              <><Upload className="w-3.5 h-3.5 mr-2" /> Upload Files</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {loading ? (
          <div className="col-span-5 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            <Card className="bg-card/60 border-border/40 col-span-2 md:col-span-1">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><HardDrive className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Storage</span></div>
                <div className="text-lg font-bold text-foreground">{storageStats.used} GB</div>
                <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden mt-2"><div className="h-full rounded-full bg-primary" style={{ width: `${storageStats.percentage}%` }} /></div>
                <div className="text-[10px] text-muted-foreground mt-1">{storageStats.free} GB free</div>
              </CardContent>
            </Card>
            {Object.entries(typeCounts).map(([type, count]) => (
              <Card key={type} className="bg-card/60 border-border/40"><CardContent className="p-4 flex items-center gap-3">{typeIcon[type]}<div><div className="text-lg font-bold text-foreground">{count}</div><div className="text-xs text-muted-foreground capitalize">{type}s</div></div></CardContent></Card>
            ))}
          </>
        )}
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No media files found
            </div>
          ) : (
            <>
              {view === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {filtered.map((file) => (
                    <Dialog key={file.id}>
                      <DialogTrigger asChild>
                        <div className="group bg-secondary/30 rounded-lg border border-border/20 p-3 cursor-pointer hover:border-primary/30 transition-colors">
                          <div className="aspect-square rounded-md bg-secondary/60 flex items-center justify-center mb-2 overflow-hidden">
                            {file.type === 'image' && file.url ? (
                              <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                            ) : file.type === 'video' && file.url ? (
                              <div className="relative w-full h-full">
                                <video src={file.url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                  <FileVideo className="w-6 h-6 text-white/70" />
                                </div>
                              </div>
                            ) : file.type === 'audio' && file.url ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-500/5">
                                <FileAudio className="w-8 h-8 text-emerald-400 mb-1" />
                                <div className="w-12 h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 w-1/3 animate-pulse" />
                                </div>
                              </div>
                            ) : (
                              typeIcon[file.type]
                            )}
                          </div>
                          <div className="text-xs text-foreground font-medium truncate">{file.name}</div>
                          <div className="text-[10px] text-muted-foreground">{file.size}</div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border/40 max-w-sm">
                        <DialogHeader><DialogTitle className="text-foreground text-sm">{file.name}</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <div className="aspect-video bg-secondary/40 rounded-lg flex items-center justify-center overflow-hidden border border-border/20">
                            {file.type === 'image' && file.url ? (
                              <img src={file.url} alt={file.name} className="w-full h-full object-contain" />
                            ) : file.type === 'video' && file.url ? (
                              <video src={file.url} controls className="w-full h-full" />
                            ) : file.type === 'audio' && file.url ? (
                              <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-emerald-500/5">
                                <FileAudio className="w-12 h-12 text-emerald-400 mb-4" />
                                <audio src={file.url} controls className="w-full" />
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                {typeIcon[file.type]}
                                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{file.type}</span>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div><span className="text-muted-foreground">Type:</span> <span className="text-foreground capitalize">{file.type}</span></div>
                            <div><span className="text-muted-foreground">Size:</span> <span className="text-foreground">{file.size}</span></div>
                            <div><span className="text-muted-foreground">Dimensions:</span> <span className="text-foreground">{file.dimensions}</span></div>
                            <div><span className="text-muted-foreground">Uploaded:</span> <span className="text-foreground">{file.uploaded}</span></div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 text-xs border-border/30" onClick={() => copyUrl(file)}><Copy className="w-3 h-3 mr-1.5" /> Copy URL</Button>
                            <Button variant="outline" size="sm" className="flex-1 text-xs border-border/30" asChild>
                              <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                                <Download className="w-3 h-3 mr-1.5" /> Download
                              </a>
                            </Button>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
