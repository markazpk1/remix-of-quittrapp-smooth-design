import { useState, useEffect } from "react";
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
import { api } from "@/services/api";
import { uploadFileToStorage, saveFileMetadata, saveLessonToDatabase, fetchLessonsFromDatabase, deleteLessonFromDatabase, saveSoundTrackToDatabase, fetchSoundTracksFromDatabase, deleteSoundTrackFromDatabase, saveVoiceTrackToDatabase, fetchVoiceTracksFromDatabase, deleteVoiceTrackFromDatabase } from "@/services/supabase";

interface Lesson { id: string; title: string; category: string; type: string; status: string; views: number; duration: string; order: number; fileUrl?: string; }
interface Sound { id: string; name: string; category: string; duration: string; plays: number; status: string; }
interface VoiceTrack { id: string; name: string; voice: string; language: string; duration: string; size: string; category: string; status: string; plays: number; source: string; createdAt: string; }

const typeIcon: Record<string, React.ElementType> = { article: FileText, video: Video, audio: Headphones };
const typeBadge: Record<string, string> = { article: "bg-blue-500/20 text-blue-400 border-blue-500/30", video: "bg-purple-500/20 text-purple-400 border-purple-500/30", audio: "bg-green-500/20 text-green-400 border-green-500/30" };
const sourceBadge: Record<string, string> = { uploaded: "bg-blue-500/20 text-blue-400 border-blue-500/30", tts: "bg-purple-500/20 text-purple-400 border-purple-500/30" };

export default function AdminLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [voices, setVoices] = useState<VoiceTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [voiceSearch, setVoiceSearch] = useState("");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [addLessonOpen, setAddLessonOpen] = useState(false);
  const [addSoundOpen, setAddSoundOpen] = useState(false);
  const [addVoiceOpen, setAddVoiceOpen] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: "", category: "", type: "article", content: "", duration: "", fileUrl: "", file: null as File | null, fileId: "" });
  const [uploading, setUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState<"video" | "audio">("video");
  const [soundForm, setSoundForm] = useState({ name: "", category: "", duration: "" });
  const [voiceForm, setVoiceForm] = useState({ name: "", voice: "", category: "", language: "English" });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  useEffect(() => {
    fetchContentData();
  }, []);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      
      // Fetch lessons from database (fallback to mock API if tables don't exist)
      let lessonsRes;
      try {
        lessonsRes = await fetchLessonsFromDatabase();
      } catch (error) {
        console.log('Database not available, falling back to mock API');
        lessonsRes = await api.getLessons();
      }
      
      // Fetch sounds and voices from database (fallback to mock API if tables don't exist)
      let soundsRes, voicesRes;
      try {
        soundsRes = await fetchSoundTracksFromDatabase();
      } catch (error) {
        console.log('Sound tracks database not available, falling back to mock API');
        soundsRes = await api.getAudioTracks();
      }
      
      try {
        voicesRes = await fetchVoiceTracksFromDatabase();
      } catch (error) {
        console.log('Voice tracks database not available, falling back to mock API');
        voicesRes = await api.getVoiceTracks();
      }
      
      // Fetch stats from API (for now)
      const statsRes = await api.getLessonsStats();

      // Transform lessons data to match Lesson interface
      const transformedLessons = (lessonsRes.data || []).map((item: any) => ({
        id: item.id,
        title: item.title || 'Untitled',
        category: (Array.isArray(item.category) ? item.category[0]?.name : item.category?.name) || 'General',
        type: item.content_type || 'article',
        status: item.status || 'published',
        views: item.view_count || 0,
        duration: typeof item.duration === 'number' ? `${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}` : item.duration || '0:00',
        order: item.order_index || 0,
        fileUrl: item.audio_url || ''
      }));

      // Transform sounds data to match Sound interface
      const transformedSounds = (soundsRes.data || []).map((item: any) => ({
        id: item.id,
        name: item.name || 'Untitled',
        category: item.category || 'unknown',
        duration: item.duration || '0:00',
        plays: item.play_count || 0,
        status: item.status || 'active',
        fileUrl: item.uploaded_files?.public_url || ''
      }));

      // Transform voices data to match VoiceTrack interface
      const transformedVoices = (voicesRes.data || []).map((item: any) => ({
        id: item.id,
        name: item.name || 'Untitled',
        voice: item.voice_name || 'Unknown Voice',
        language: item.language || 'English',
        duration: item.duration || '0:00',
        size: item.file_size || '0.0 MB',
        category: item.category || 'unknown',
        status: item.status || 'active',
        plays: item.play_count || 0,
        source: item.source || 'uploaded',
        createdAt: item.created_at || new Date().toISOString(),
        fileUrl: item.uploaded_files?.public_url || ''
      }));

      setLessons(transformedLessons);
      setSounds(transformedSounds);
      setVoices(transformedVoices);
    } catch (error) {
      console.error('Failed to fetch content data:', error);
      toast({ title: "Error", description: "Failed to load content data" });
    } finally {
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()) || l.category.toLowerCase().includes(search.toLowerCase()));
  const filteredVoices = voices.filter((v) => v.name.toLowerCase().includes(voiceSearch.toLowerCase()) || v.voice.toLowerCase().includes(voiceSearch.toLowerCase()));

  const getMediaDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const audio = document.createElement('audio');
      
      const element = file.type.startsWith('video') ? video : audio;
      
      element.preload = 'metadata';
      
      element.onloadedmetadata = () => {
        const duration = element.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        URL.revokeObjectURL(element.src);
      };
      
      element.onerror = () => {
        resolve("0:00");
        URL.revokeObjectURL(element.src);
      };
      
      element.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    
    setUploading(true);
    
    try {
      // Detect actual duration from file
      const duration = await getMediaDuration(file);
      
      // Upload to Supabase Storage
      const uploadResult = await uploadFileToStorage(file, 'media-files');
      
      if (!uploadResult.success) {
        throw new Error(uploadResult.message);
      }
      
      // Save file metadata to database
      const fileType = lessonForm.type === 'video' ? 'video' : 'audio';
      const metadataResult = await saveFileMetadata({
        file_name: file.name,
        file_type: fileType,
        file_size: file.size,
        file_path: uploadResult.data.path,
        public_url: uploadResult.data.publicUrl,
        mime_type: file.type
      });
      
      if (!metadataResult.success) {
        throw new Error(metadataResult.message);
      }
      
      // Update form with the public URL, detected duration, and file ID
      setLessonForm(prev => ({ 
        ...prev, 
        fileUrl: uploadResult.data.publicUrl,
        duration: duration,
        fileId: metadataResult.data.id
      }));
      
      toast({ title: "Upload Complete", description: `${file.name} uploaded (${duration}) and saved to database` });
    } catch (error) {
      console.error('File upload error:', error);
      toast({ title: "Upload Failed", description: error instanceof Error ? error.message : "Failed to upload file", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const addLesson = async () => {
    if (!lessonForm.title.trim() || !lessonForm.category.trim()) {
      toast({ title: "Error", description: "Title and category are required", variant: "destructive" });
      return;
    }

    // Type-specific validation
    if (lessonForm.type === "article" && !lessonForm.content.trim()) {
      toast({ title: "Error", description: "Content is required for articles", variant: "destructive" });
      return;
    }
    
    // If there's a file selected, upload it first
    if (lessonForm.file && !lessonForm.fileUrl) {
      await handleFileUpload(lessonForm.file);
      return; // Wait for upload to complete
    }
    
    if ((lessonForm.type === "video" || lessonForm.type === "audio") && !lessonForm.fileUrl.trim() && !lessonForm.file) {
      toast({ title: "Error", description: "File URL or file upload is required for video/audio", variant: "destructive" });
      return;
    }

    try {
      // Save lesson to database
      const lessonData = {
        title: lessonForm.title.trim(),
        category: lessonForm.category.trim(),
        content_type: lessonForm.type,
        content: lessonForm.type === "article" ? lessonForm.content.trim() : undefined,
        file_id: lessonForm.fileId || undefined,
        duration: lessonForm.duration || "0:00",
        status: "published"
      };

      const result = await saveLessonToDatabase(lessonData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast({ title: "Success", description: "Lesson saved to database" });
      setAddLessonOpen(false);
      setLessonForm({ title: "", category: "", type: "article", content: "", duration: "", fileUrl: "", file: null, fileId: "" });
      
      // Refresh the lessons list
      await fetchContentData();
    } catch (error) {
      console.error('Save lesson error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save lesson", variant: "destructive" });
    }
  };

  const openPreview = (url: string, type: "video" | "audio") => {
    if (!url || url.trim() === "") {
      toast({ 
        title: "No Media Available", 
        description: "This lesson doesn't have an associated media file", 
        variant: "destructive" 
      });
      return;
    }
    setPreviewUrl(url);
    setPreviewType(type);
    setPreviewOpen(true);
  };

  const deleteLesson = async (id: string) => {
    const l = lessons.find((x) => x.id === id);
    setConfirm({
      open: true,
      title: `Delete "${l?.title}"?`,
      description: "This will permanently remove the lesson. This action cannot be undone.",
      onConfirm: async () => {
        try {
          // Delete from database
          const result = await deleteLessonFromDatabase(id);
          
          if (!result.success) {
            throw new Error(result.message);
          }
          
          // Remove from local state
          setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
          toast({ title: "Success", description: "Lesson deleted permanently" });
        } catch (error) {
          console.error('Delete lesson error:', error);
          toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete lesson", variant: "destructive" });
        }
      }
    });
  };

  const toggleLessonStatus = (id: string) => {
    setLessons((prev) => prev.map((lesson) => {
      if (lesson.id !== id) return lesson;
      const newStatus = lesson.status === "published" ? "draft" : "published";
      toast({ title: "Status Updated", description: `Lesson is now ${newStatus}` });
      return { ...lesson, status: newStatus };
    }));
  };

  const addSound = async () => {
    if (!soundForm.name.trim() || !soundForm.category.trim()) {
      toast({ title: "Error", description: "Name and category are required", variant: "destructive" });
      return;
    }

    try {
      const soundData = {
        name: soundForm.name.trim(),
        category: soundForm.category.trim(),
        duration: soundForm.duration.trim() || "0:00",
        status: "active"
      };

      const result = await saveSoundTrackToDatabase(soundData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast({ title: "Success", description: "Sound track saved to database" });
      setAddSoundOpen(false);
      setSoundForm({ name: "", category: "", duration: "" });
      
      // Refresh the sounds list
      await fetchContentData();
    } catch (error) {
      console.error('Save sound track error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save sound track", variant: "destructive" });
    }
  };

  const deleteSound = async (id: string) => {
    const s = sounds.find((x) => x.id === id);
    setConfirm({
      open: true,
      title: `Delete "${s?.name}"?`,
      description: "This will permanently remove the sound track. This action cannot be undone.",
      onConfirm: async () => {
        try {
          const result = await deleteSoundTrackFromDatabase(id);
          
          if (!result.success) {
            throw new Error(result.message);
          }
          
          setSounds((prev) => prev.filter((sound) => sound.id !== id));
          toast({ title: "Success", description: "Sound track deleted permanently" });
        } catch (error) {
          console.error('Delete sound track error:', error);
          toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete sound track", variant: "destructive" });
        }
      }
    });
  };

  const toggleSound = (id: string) => {
    setSounds((prev) => prev.map((sound) => {
      if (sound.id !== id) return sound;
      const newStatus = sound.status === "active" ? "inactive" : "active";
      toast({ title: "Status Updated", description: `Sound track is now ${newStatus}` });
      return { ...sound, status: newStatus };
    }));
  };

  const addVoice = async () => {
    if (!voiceForm.name.trim() || !voiceForm.voice.trim() || !voiceForm.category.trim()) {
      toast({ title: "Error", description: "Name, voice, and category are required", variant: "destructive" });
      return;
    }

    try {
      const voiceData = {
        name: voiceForm.name.trim(),
        voice_name: voiceForm.voice.trim(),
        category: voiceForm.category.trim(),
        language: voiceForm.language,
        duration: "0:00",
        file_size: "0.0 MB",
        source: "uploaded",
        status: "active"
      };

      const result = await saveVoiceTrackToDatabase(voiceData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast({ title: "Success", description: "Voice track saved to database" });
      setAddVoiceOpen(false);
      setVoiceForm({ name: "", voice: "", category: "", language: "English" });
      
      // Refresh the voices list
      await fetchContentData();
    } catch (error) {
      console.error('Save voice track error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save voice track", variant: "destructive" });
    }
  };

  const deleteVoice = async (id: string) => {
    const v = voices.find((x) => x.id === id);
    setConfirm({
      open: true,
      title: `Delete "${v?.name}"?`,
      description: "This will permanently remove the voice track. This action cannot be undone.",
      onConfirm: async () => {
        try {
          const result = await deleteVoiceTrackFromDatabase(id);
          
          if (!result.success) {
            throw new Error(result.message);
          }
          
          setVoices((prev) => prev.filter((voice) => voice.id !== id));
          toast({ title: "Success", description: "Voice track deleted permanently" });
        } catch (error) {
          console.error('Delete voice track error:', error);
          toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete voice track", variant: "destructive" });
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} confirmLabel="Delete" />
      
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="bg-card border-border/40 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Media Preview</DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            {previewType === "video" ? (
              <video 
                src={previewUrl} 
                controls 
                className="w-full rounded-lg"
                style={{ maxHeight: "500px" }}
              />
            ) : (
              <audio 
                src={previewUrl} 
                controls 
                className="w-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div><h1 className="font-display text-2xl font-bold text-foreground">Lessons, Sound & Voice Therapy</h1><p className="text-sm text-muted-foreground">Manage educational content, sound therapy tracks, and voice recordings.</p></div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {loading ? (
          <div className="col-span-4 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          [
            { label: "Total Lessons", value: lessons.length, icon: BookOpen },
            { label: "Sound Tracks", value: sounds.length, icon: Headphones },
            { label: "Voice Tracks", value: voices.length, icon: Mic },
            { label: "Total Plays", value: (lessons.reduce((a, l) => a + l.views, 0) + sounds.reduce((a, s) => a + s.plays, 0) + voices.reduce((a, v) => a + v.plays, 0)).toLocaleString(), icon: BarChart3 },
          ].map((st) => (
            <Card key={st.label} className="bg-card/60 border-border/40"><CardContent className="p-4"><st.icon className="w-4 h-4 text-muted-foreground mb-2" /><div className="text-xl font-bold font-display text-foreground">{st.value}</div><div className="text-[11px] text-muted-foreground">{st.label}</div></CardContent></Card>
          ))
        )}
      </div>

      <Tabs defaultValue="lessons" className="space-y-4">
        <TabsList className="bg-secondary/40 border border-border/30"><TabsTrigger value="lessons">Lessons</TabsTrigger><TabsTrigger value="sounds">Sound Therapy</TabsTrigger><TabsTrigger value="voices">Voice Therapy</TabsTrigger></TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search lessons..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" /></div>
            <Dialog open={addLessonOpen} onOpenChange={setAddLessonOpen}>
              <DialogTrigger asChild><Button className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> New Lesson</Button></DialogTrigger>
              <DialogContent className="bg-card border-border/40 max-w-2xl">
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
                  
                  {/* Type-specific upload options */}
                  {lessonForm.type === "article" && (
                    <div className="space-y-2">
                      <Label>Content</Label>
                      <Textarea 
                        value={lessonForm.content} 
                        onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} 
                        placeholder="Write the article content here..." 
                        className="bg-secondary/40 border-border/30 min-h-[120px]" 
                      />
                    </div>
                  )}
                  
                  {(lessonForm.type === "video" || lessonForm.type === "audio") && (
                    <>
                      <div className="space-y-2">
                        <Label>Upload from Local</Label>
                        <div className="flex items-center gap-3">
                          <Input 
                            type="file" 
                            accept={lessonForm.type === "video" ? "video/*" : "audio/*"}
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setLessonForm({ ...lessonForm, file });
                              if (file) {
                                handleFileUpload(file);
                              }
                            }}
                            disabled={uploading}
                            className="bg-secondary/40 border-border/30 cursor-pointer" 
                          />
                          {uploading && (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                              <span className="text-xs text-muted-foreground">Uploading...</span>
                            </div>
                          )}
                          {lessonForm.file && !uploading && (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {lessonForm.file.name}
                            </span>
                          )}
                        </div>
                        {lessonForm.fileUrl && lessonForm.file && (
                          <div className="text-xs text-green-500 mt-1">
                            ✓ File uploaded successfully
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border/30"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Or enter URL</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{lessonForm.type === "video" ? "Video URL" : "Audio URL"}</Label>
                        <Input 
                          value={lessonForm.fileUrl} 
                          onChange={(e) => setLessonForm({ ...lessonForm, fileUrl: e.target.value })}
                          disabled={uploading}
                          placeholder={`https://example.com/${lessonForm.type}.mp${lessonForm.type === "video" ? "4" : "3"}`} 
                          className="bg-secondary/40 border-border/30" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input 
                          value={lessonForm.duration} 
                          onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })} 
                          placeholder="e.g. 15:30" 
                          className="bg-secondary/40 border-border/30" 
                        />
                      </div>
                    </>
                  )}
                  
                  <Button onClick={addLesson} className="w-full">Create Lesson</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="bg-card/60 border-border/40">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader><TableRow className="border-border/30 hover:bg-transparent"><TableHead className="text-muted-foreground">#</TableHead><TableHead className="text-muted-foreground">Title</TableHead><TableHead className="text-muted-foreground">Type</TableHead><TableHead className="text-muted-foreground">Category</TableHead><TableHead className="text-muted-foreground">Status</TableHead><TableHead className="text-muted-foreground">Views</TableHead><TableHead className="text-muted-foreground w-12"></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredLessons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No lessons found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLessons.map((l) => {
                        const TypeIcon = typeIcon[l.type] || FileText;
                        return (
                          <TableRow key={l.id} className="border-border/20 hover:bg-secondary/20">
                            <TableCell className="text-sm text-muted-foreground font-mono">{l.order}</TableCell>
                            <TableCell>
                              <div 
                                className={`flex items-center gap-2 ${(l.type === "video" || l.type === "audio") && l.fileUrl ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
                                onClick={() => (l.type === "video" || l.type === "audio") && openPreview(l.fileUrl || "", l.type as "video" | "audio")}
                              >
                                <TypeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div>
                                  <div className="text-sm font-medium text-foreground">{l.title}</div>
                                  <div className="text-[11px] text-muted-foreground">{l.duration}</div>
                                </div>
                              </div>
                            </TableCell>
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
                      })
                    )}
                  </TableBody>
                </Table>
              )}
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
            {loading ? (
              <div className="col-span-2 flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
              sounds.map((s) => (
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
              ))
            )}
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
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader><TableRow className="border-border/30 hover:bg-transparent"><TableHead className="text-muted-foreground w-12"></TableHead><TableHead className="text-muted-foreground">Track</TableHead><TableHead className="text-muted-foreground">Voice</TableHead><TableHead className="text-muted-foreground">Category</TableHead><TableHead className="text-muted-foreground">Source</TableHead><TableHead className="text-muted-foreground">Plays</TableHead><TableHead className="text-muted-foreground">Status</TableHead><TableHead className="text-muted-foreground w-12"></TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredVoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          No voice tracks found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVoices.map((v) => (
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
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
