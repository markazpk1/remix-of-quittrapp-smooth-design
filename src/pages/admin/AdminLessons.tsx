import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Search, Plus, MoreHorizontal, Pencil, Trash2, Eye, BookOpen, Headphones, Video, FileText, Upload, Mic, Play, Pause, Volume2, Download, Globe, Clock, Users, BarChart3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Lesson { id: number; title: string; category: string; type: string; status: string; views: number; duration: string; order: number; }
interface Sound { id: number; name: string; category: string; duration: string; plays: number; status: string; }
interface VoiceTrack { id: number; name: string; voice: string; language: string; duration: string; size: string; category: string; status: string; plays: number; source: string; createdAt: string; }

const initialLessons: Lesson[] = [
  { id: 1, title: "Admit It's a Problem", category: "Foundation", type: "article", status: "published", views: 12400, duration: "5 min", order: 1 },
  { id: 2, title: "Understanding Dopamine & Addiction", category: "Science", type: "article", status: "published", views: 9800, duration: "8 min", order: 2 },
  { id: 3, title: "Identifying Your Triggers", category: "Foundation", type: "article", status: "published", views: 11200, duration: "6 min", order: 3 },
  { id: 4, title: "Building Healthy Habits", category: "Recovery", type: "video", status: "published", views: 8600, duration: "12 min", order: 4 },
  { id: 5, title: "The Brain Rewiring Process", category: "Science", type: "article", status: "published", views: 7400, duration: "10 min", order: 5 },
  { id: 6, title: "Mindfulness Meditation Basics", category: "Wellness", type: "audio", status: "published", views: 5300, duration: "15 min", order: 6 },
  { id: 7, title: "Dealing with Flatline Periods", category: "Recovery", type: "article", status: "draft", views: 0, duration: "7 min", order: 7 },
  { id: 8, title: "Relationship Rebuilding Guide", category: "Relationships", type: "article", status: "draft", views: 0, duration: "9 min", order: 8 },
];

const initialSounds: Sound[] = [
  { id: 1, name: "Ocean Waves", category: "Nature", duration: "30 min", plays: 45200, status: "active" },
  { id: 2, name: "Forest Rain", category: "Nature", duration: "45 min", plays: 38100, status: "active" },
  { id: 3, name: "Campfire Crackling", category: "Nature", duration: "60 min", plays: 22400, status: "active" },
  { id: 4, name: "Guided Body Scan", category: "Meditation", duration: "20 min", plays: 31800, status: "active" },
  { id: 5, name: "Deep Breathing Exercise", category: "Meditation", duration: "10 min", plays: 28600, status: "active" },
  { id: 6, name: "Night Ambience", category: "Sleep", duration: "8 hrs", plays: 19400, status: "active" },
  { id: 7, name: "Binaural Focus", category: "Focus", duration: "45 min", plays: 15700, status: "inactive" },
];

const initialVoices: VoiceTrack[] = [
  { id: 1, name: "Morning Affirmations", voice: "Sarah", language: "English", duration: "4:32", size: "6.2 MB", category: "Affirmations", status: "active", plays: 18400, source: "uploaded", createdAt: "2026-02-28" },
  { id: 2, name: "Evening Wind-Down Guided", voice: "Daniel", language: "English", duration: "12:18", size: "17.4 MB", category: "Guided Meditation", status: "active", plays: 24300, source: "uploaded", createdAt: "2026-02-26" },
  { id: 3, name: "Urge Surfing Technique", voice: "Laura", language: "English", duration: "8:45", size: "12.1 MB", category: "CBT Exercise", status: "active", plays: 15600, source: "tts", createdAt: "2026-02-24" },
  { id: 4, name: "Body Scan Relaxation", voice: "George", language: "English", duration: "15:30", size: "21.8 MB", category: "Guided Meditation", status: "active", plays: 31200, source: "uploaded", createdAt: "2026-02-22" },
  { id: 5, name: "Positive Self-Talk Script", voice: "Alice", language: "English", duration: "6:10", size: "8.7 MB", category: "Affirmations", status: "active", plays: 9800, source: "tts", createdAt: "2026-02-20" },
  { id: 6, name: "Sleep Story: Mountain Lake", voice: "Brian", language: "English", duration: "22:00", size: "30.1 MB", category: "Sleep Story", status: "draft", plays: 0, source: "uploaded", createdAt: "2026-02-15" },
];

const typeIcon: Record<string, React.ElementType> = { article: FileText, video: Video, audio: Headphones };
const typeBadge: Record<string, string> = { article: "bg-blue-500/20 text-blue-400 border-blue-500/30", video: "bg-purple-500/20 text-purple-400 border-purple-500/30", audio: "bg-green-500/20 text-green-400 border-green-500/30" };
const sourceBadge: Record<string, string> = { uploaded: "bg-blue-500/20 text-blue-400 border-blue-500/30", tts: "bg-purple-500/20 text-purple-400 border-purple-500/30" };

export default function AdminLessons() {
  const [lessons, setLessons] = useState(initialLessons);
  const [sounds, setSounds] = useState(initialSounds);
  const [voices, setVoices] = useState(initialVoices);
  const [search, setSearch] = useState("");
  const [voiceSearch, setVoiceSearch] = useState("");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [addSoundOpen, setAddSoundOpen] = useState(false);
  const [addVoiceOpen, setAddVoiceOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: "", category: "", type: "article" });
  const [soundForm, setSoundForm] = useState({ name: "", category: "", duration: "" });
  const [voiceForm, setVoiceForm] = useState({ name: "", voice: "", category: "", language: "English" });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const filteredLessons = lessons.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()) || l.category.toLowerCase().includes(search.toLowerCase()));
  const filteredVoices = voices.filter((v) => v.name.toLowerCase().includes(voiceSearch.toLowerCase()) || v.voice.toLowerCase().includes(voiceSearch.toLowerCase()));

  const addLesson = () => {
    if (!lessonForm.title) return;
    const id = Math.max(...lessons.map((l) => l.id)) + 1;
    setLessons((prev) => [...prev, { id, ...lessonForm, status: "draft", views: 0, duration: "5 min", order: prev.length + 1 }]);
    toast({ title: "Lesson Created", description: `"${lessonForm.title}" has been added.` });
    setAddLessonOpen(false); setLessonForm({ title: "", category: "", type: "article" });
  };

  const deleteLesson = (id: number) => {
    const l = lessons.find((x) => x.id === id);
    setConfirm({ open: true, title: `Delete "${l?.title}"?`, description: "This lesson will be permanently removed.", onConfirm: () => { setLessons((prev) => prev.filter((x) => x.id !== id)); toast({ title: "Lesson Deleted", description: `"${l?.title}" removed.` }); } });
  };

  const toggleLessonStatus = (id: number) => {
    setLessons((prev) => prev.map((l) => l.id === id ? { ...l, status: l.status === "published" ? "draft" : "published" } : l));
    toast({ title: "Status Updated" });
  };

  const addSound = () => {
    if (!soundForm.name) return;
    const id = Math.max(...sounds.map((s) => s.id)) + 1;
    setSounds((prev) => [...prev, { id, name: soundForm.name, category: soundForm.category || "Nature", duration: soundForm.duration || "10 min", plays: 0, status: "active" }]);
    toast({ title: "Sound Track Added" }); setAddSoundOpen(false); setSoundForm({ name: "", category: "", duration: "" });
  };

  const deleteSound = (id: number) => {
    const s = sounds.find((x) => x.id === id);
    setConfirm({ open: true, title: `Delete "${s?.name}"?`, description: "This sound track will be permanently removed.", onConfirm: () => { setSounds((prev) => prev.filter((x) => x.id !== id)); toast({ title: "Sound Track Deleted" }); } });
  };

  const toggleSound = (id: number) => {
    setSounds((prev) => prev.map((s) => s.id === id ? { ...s, status: s.status === "active" ? "inactive" : "active" } : s));
  };

  const addVoice = () => {
    if (!voiceForm.name) return;
    const id = Math.max(...voices.map((v) => v.id)) + 1;
    setVoices((prev) => [...prev, { id, name: voiceForm.name, voice: voiceForm.voice || "Sarah", language: voiceForm.language, duration: "5:00", size: "7.0 MB", category: voiceForm.category || "Affirmations", status: "active", plays: 0, source: "uploaded", createdAt: new Date().toISOString().split("T")[0] }]);
    toast({ title: "Voice Track Added" }); setAddVoiceOpen(false); setVoiceForm({ name: "", voice: "", category: "", language: "English" });
  };

  const deleteVoice = (id: number) => {
    const v = voices.find((x) => x.id === id);
    setConfirm({ open: true, title: `Delete "${v?.name}"?`, description: "This voice track will be permanently removed.", onConfirm: () => { setVoices((prev) => prev.filter((x) => x.id !== id)); toast({ title: "Voice Track Deleted" }); } });
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} confirmLabel="Delete" />

      <div><h1 className="font-display text-2xl font-bold text-foreground">Lessons, Sound & Voice Therapy</h1><p className="text-sm text-muted-foreground">Manage educational content, sound therapy tracks, and voice recordings.</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Lessons", value: lessons.length, icon: BookOpen },
          { label: "Sound Tracks", value: sounds.length, icon: Headphones },
          { label: "Voice Tracks", value: voices.length, icon: Mic },
          { label: "Total Plays", value: (lessons.reduce((a, l) => a + l.views, 0) + voices.reduce((a, v) => a + v.plays, 0)).toLocaleString(), icon: BarChart3 },
        ].map((st) => (
          <Card key={st.label} className="bg-card/60 border-border/40"><CardContent className="p-4"><st.icon className="w-4 h-4 text-muted-foreground mb-2" /><div className="text-xl font-bold font-display text-foreground">{st.value}</div><div className="text-[11px] text-muted-foreground">{st.label}</div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList className="bg-secondary/40 border border-border/30"><TabsTrigger value="lessons">Lessons</TabsTrigger><TabsTrigger value="sounds">Sound Therapy</TabsTrigger><TabsTrigger value="voices">Voice Therapy</TabsTrigger></TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search lessons..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" /></div>
            <Dialog open={addLessonOpen} onOpenChange={setAddLessonOpen}>
              <DialogTrigger asChild><Button className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> New Lesson</Button></DialogTrigger>
              <DialogContent className="bg-card border-border/40">
                <DialogHeader><DialogTitle className="text-foreground">Create Lesson</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2"><Label>Title</Label><Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="Lesson title" className="bg-secondary/40 border-border/30" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Category</Label><Input value={lessonForm.category} onChange={(e) => setLessonForm({ ...lessonForm, category: e.target.value })} placeholder="e.g. Science" className="bg-secondary/40 border-border/30" /></div>
                    <div className="space-y-2"><Label>Type</Label>
                      <Select value={lessonForm.type} onValueChange={(v) => setLessonForm({ ...lessonForm, type: v })}>
                        <SelectTrigger className="bg-secondary/40 border-border/30"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border/40"><SelectItem value="article">Article</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="audio">Audio</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={addLesson} className="w-full">Create Lesson</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-card/60 border-border/40">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow className="border-border/30 hover:bg-transparent"><TableHead className="text-muted-foreground">#</TableHead><TableHead className="text-muted-foreground">Title</TableHead><TableHead className="text-muted-foreground">Type</TableHead><TableHead className="text-muted-foreground">Category</TableHead><TableHead className="text-muted-foreground">Status</TableHead><TableHead className="text-muted-foreground">Views</TableHead><TableHead className="text-muted-foreground w-12"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredLessons.map((l) => {
                    const TypeIcon = typeIcon[l.type] || FileText;
                    return (
                      <TableRow key={l.id} className="border-border/20 hover:bg-secondary/20">
                        <TableCell className="text-sm text-muted-foreground font-mono">{l.order}</TableCell>
                        <TableCell><div className="flex items-center gap-2"><TypeIcon className="w-4 h-4 text-muted-foreground shrink-0" /><div><div className="text-sm font-medium text-foreground">{l.title}</div><div className="text-[11px] text-muted-foreground">{l.duration}</div></div></div></TableCell>
                        <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${typeBadge[l.type] || ""}`}>{l.type}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{l.category}</TableCell>
                        <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${l.status === "published" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>{l.status}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{l.views.toLocaleString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border/40">
                              <DropdownMenuItem className="text-xs" onClick={() => toggleLessonStatus(l.id)}><Eye className="w-3 h-3 mr-2" /> {l.status === "published" ? "Unpublish" : "Publish"}</DropdownMenuItem>
                              <DropdownMenuItem className="text-xs text-red-400" onClick={() => deleteLesson(l.id)}><Trash2 className="w-3 h-3 mr-2" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sounds" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={addSoundOpen} onOpenChange={setAddSoundOpen}>
              <DialogTrigger asChild><Button className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Track</Button></DialogTrigger>
              <DialogContent className="bg-card border-border/40">
                <DialogHeader><DialogTitle className="text-foreground">Add Sound Track</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2"><Label>Track Name</Label><Input value={soundForm.name} onChange={(e) => setSoundForm({ ...soundForm, name: e.target.value })} placeholder="e.g. Rainfall" className="bg-secondary/40 border-border/30" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Category</Label><Input value={soundForm.category} onChange={(e) => setSoundForm({ ...soundForm, category: e.target.value })} placeholder="e.g. Nature" className="bg-secondary/40 border-border/30" /></div>
                    <div className="space-y-2"><Label>Duration</Label><Input value={soundForm.duration} onChange={(e) => setSoundForm({ ...soundForm, duration: e.target.value })} placeholder="e.g. 30 min" className="bg-secondary/40 border-border/30" /></div>
                  </div>
                  <Button onClick={addSound} className="w-full">Add Track</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sounds.map((s) => (
              <Card key={s.id} className={`bg-card/60 border-border/40 ${s.status === "inactive" ? "opacity-50" : ""}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary/60 flex items-center justify-center"><Headphones className="w-5 h-5 text-primary" /></div>
                    <div><div className="text-sm font-medium text-foreground">{s.name}</div><div className="text-[11px] text-muted-foreground">{s.category} · {s.duration} · {s.plays.toLocaleString()} plays</div></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${s.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>{s.status}</Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleSound(s.id)}><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteSound(s.id)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="voices" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search voice tracks..." value={voiceSearch} onChange={(e) => setVoiceSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" /></div>
            <Dialog open={addVoiceOpen} onOpenChange={setAddVoiceOpen}>
              <DialogTrigger asChild><Button className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Voice Track</Button></DialogTrigger>
              <DialogContent className="bg-card border-border/40">
                <DialogHeader><DialogTitle className="text-foreground">Add Voice Track</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2"><Label>Track Name</Label><Input value={voiceForm.name} onChange={(e) => setVoiceForm({ ...voiceForm, name: e.target.value })} placeholder="e.g. Morning Motivation" className="bg-secondary/40 border-border/30" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Voice</Label><Input value={voiceForm.voice} onChange={(e) => setVoiceForm({ ...voiceForm, voice: e.target.value })} placeholder="e.g. Sarah" className="bg-secondary/40 border-border/30" /></div>
                    <div className="space-y-2"><Label>Category</Label><Input value={voiceForm.category} onChange={(e) => setVoiceForm({ ...voiceForm, category: e.target.value })} placeholder="e.g. Affirmations" className="bg-secondary/40 border-border/30" /></div>
                  </div>
                  <Button onClick={addVoice} className="w-full">Add Voice Track</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-card/60 border-border/40">
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow className="border-border/30 hover:bg-transparent"><TableHead className="text-muted-foreground w-12"></TableHead><TableHead className="text-muted-foreground">Track</TableHead><TableHead className="text-muted-foreground">Voice</TableHead><TableHead className="text-muted-foreground">Category</TableHead><TableHead className="text-muted-foreground">Source</TableHead><TableHead className="text-muted-foreground">Plays</TableHead><TableHead className="text-muted-foreground">Status</TableHead><TableHead className="text-muted-foreground w-12"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredVoices.map((v) => (
                    <TableRow key={v.id} className="border-border/20 hover:bg-secondary/20">
                      <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPlayingId(playingId === v.id ? null : v.id)}>{playingId === v.id ? <Pause className="w-4 h-4 text-primary" /> : <Play className="w-4 h-4 text-muted-foreground" />}</Button></TableCell>
                      <TableCell><div><div className="text-sm font-medium text-foreground">{v.name}</div><div className="text-[10px] text-muted-foreground">{v.size} · {v.createdAt}</div></div></TableCell>
                      <TableCell className="text-sm text-foreground">{v.voice}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px] bg-secondary text-muted-foreground border-border/30">{v.category}</Badge></TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${sourceBadge[v.source] || ""}`}>{v.source === "tts" ? "AI Generated" : v.source}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{v.plays.toLocaleString()}</TableCell>
                      <TableCell><Badge variant="outline" className={`text-[10px] capitalize ${v.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>{v.status}</Badge></TableCell>
                      <TableCell><Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteVoice(v.id)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
