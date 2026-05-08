import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Play, CheckCircle2, Clock, BookOpen, Lock, Star, ChevronRight, X, Heart, Volume2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function UserLessons() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lessonsData, setLessonsData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [showViewer, setShowViewer] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessonsData();
  }, [user]);

  const fetchLessonsData = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const response = await api.getUserLessons();
      if (response.success) {
        setLessonsData(response.data);
      }
    } catch (error) {
      console.error('Lessons data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLesson = (lesson: any) => {
    if (lesson.locked) {
      toast.error("Unlock with Pro to access this lesson");
      return;
    }
    setSelectedLesson(lesson);
    setShowViewer(true);
  };

  const handleComplete = async (lessonId: string) => {
    try {
      const response = await api.completeLesson(lessonId);
      if (response.success) {
        toast.success("Lesson completed! 🎉");
        setShowViewer(false);
        fetchLessonsData();
      }
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  const handleFavorite = async (lessonId: string) => {
    try {
      const response = await api.toggleLessonFavorite(lessonId);
      if (response.success) {
        toast.success("Favorites updated ❤️");
        // Update local state for the selected lesson if it's open
        if (selectedLesson && selectedLesson.id === lessonId) {
          setSelectedLesson((prev: any) => ({ ...prev, is_favorite: !prev.is_favorite }));
        }
        fetchLessonsData();
      }
    } catch (error) {
      toast.error("Failed to favorite lesson");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const lessons = lessonsData?.lessons || [];
  const categories = lessonsData?.categories || ["All"];
  const completedCount = lessonsData?.completed || 0;
  const progress = lessonsData?.progress || 0;

  const filtered = lessons.filter((l: any) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || l.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Lessons</h1>
          <p className="text-sm text-muted-foreground">Learn strategies and techniques for your recovery.</p>
        </div>
        <Card className="bg-card/40 border-border/20 px-4 py-2 flex items-center gap-3">
          <div className="text-xs text-muted-foreground font-medium">Progress: <span className="text-foreground">{completedCount}/{lessons.length}</span></div>
          <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search lessons..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-card/60 border-border/30 text-sm h-10" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((c: string) => (
            <Button key={c} variant={category === c ? "default" : "outline"} size="sm" className={`text-xs h-10 px-4 rounded-xl ${category === c ? "bg-primary text-primary-foreground" : "bg-card/40 border-border/30 text-muted-foreground hover:text-foreground"}`} onClick={() => setCategory(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((lesson: any) => (
          <Card key={lesson.id} onClick={() => handleOpenLesson(lesson)} className={`group relative bg-card/60 border-border/40 transition-all duration-300 ${lesson.locked ? "opacity-75" : "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 cursor-pointer hover:-translate-y-1"}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 px-2 py-0.5 rounded-lg">{lesson.category}</Badge>
                <div className="flex items-center gap-1.5">
                  {lesson.completed ? (
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    </div>
                  ) : lesson.locked ? (
                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                      <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  ) : null}
                  <button onClick={(e) => { e.stopPropagation(); handleFavorite(lesson.id); }} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors group/fav ${lesson.is_favorite ? "bg-rose-500/20" : "bg-secondary/60 hover:bg-rose-500/20"}`}>
                    <Heart className={`w-3.5 h-3.5 ${lesson.is_favorite ? "text-rose-400 fill-rose-400" : "text-muted-foreground group-hover/fav:text-rose-400"}`} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-sm font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">{lesson.title}</h3>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    {lesson.type === "video" ? <Play className="w-3 h-3 text-primary" /> : lesson.type === "audio" ? <Play className="w-3 h-3 text-primary" /> : <BookOpen className="w-3 h-3 text-primary" />}
                    {lesson.type}
                  </span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {lesson.duration}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showViewer} onOpenChange={setShowViewer}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border/40 p-0">
          {selectedLesson && (
            <div className="flex flex-col">
              <div className="relative h-48 sm:h-80 bg-black flex items-center justify-center overflow-hidden">
                <div className="absolute top-4 right-4 z-20">
                  <Button variant="ghost" size="icon" onClick={() => setShowViewer(false)} className="rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {selectedLesson.type === 'video' ? (
                  <video 
                    src={selectedLesson.media_url} 
                    controls 
                    className="w-full h-full object-contain"
                    poster={selectedLesson.thumbnail_url}
                  />
                ) : selectedLesson.type === 'audio' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900/40 to-slate-900 p-8">
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 animate-pulse">
                      <Volume2 className="w-12 h-12 text-primary" />
                    </div>
                    <audio 
                      src={selectedLesson.media_url} 
                      controls 
                      className="w-full max-w-md h-10 accent-primary"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/20">
                    <BookOpen className="w-16 h-16 text-primary/40" />
                  </div>
                )}
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20">{selectedLesson.category}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedLesson.duration}</span>
                  </div>
                  <DialogTitle className="text-2xl font-bold font-display">{selectedLesson.title}</DialogTitle>
                  {selectedLesson.narrator && <p className="text-sm text-primary font-medium">By {selectedLesson.narrator}</p>}
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedLesson.content || "This lesson content is being loaded. Please follow the instructions and insights provided to support your recovery journey."}
                  </p>
                  
                  <div className="mt-8 p-6 rounded-2xl bg-secondary/30 border border-border/20">
                    <h4 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-400" /> Key Takeaway
                    </h4>
                    <p className="text-sm text-muted-foreground italic">
                      Awareness is the first step of change. By understanding your triggers, you gain the power to choose a different path.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/20">
                  {!selectedLesson.completed && (
                    <Button onClick={() => handleComplete(selectedLesson.id)} className="flex-1 bg-primary text-primary-foreground h-12 rounded-xl font-bold shadow-lg shadow-primary/20">
                      <CheckCircle2 className="w-5 h-5 mr-2" /> Mark as Complete
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => handleFavorite(selectedLesson.id)} 
                    className={`flex-1 h-12 rounded-xl transition-all ${selectedLesson.is_favorite ? "border-rose-500/40 text-rose-400 bg-rose-500/5" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
                  >
                    <Heart className={`w-5 h-5 mr-2 ${selectedLesson.is_favorite ? "fill-rose-400" : ""}`} /> 
                    {selectedLesson.is_favorite ? "Remove from Favorites" : "Save to Favorites"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
