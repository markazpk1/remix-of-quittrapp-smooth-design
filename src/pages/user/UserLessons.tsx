import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Play, CheckCircle2, Clock, BookOpen, Lock } from "lucide-react";
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessonsData();
  }, [user]);

  const fetchLessonsData = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const response = await api.getUserLessons();
      if (response.error) {
        toast.error('Failed to load lessons');
        return;
      }
      
      const data = response.data || {};
      setLessonsData(response.data);
    } catch (error) {
      console.error('Lessons data error:', error);
      toast.error('Failed to load lessons');
    } finally {
      setLoading(false);
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
  const completed = lessonsData?.completed || 0;
  const progress = lessonsData?.progress || 0;

  const filtered = lessons.filter((l: any) => {
    const matchSearch = l.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || l.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Lessons</h1>
        <p className="text-sm text-muted-foreground">Learn strategies and techniques for your recovery.</p>
      </div>

      {/* Progress bar */}
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground font-medium">Course Progress</span>
            <span className="text-sm text-primary font-bold">{completed}/{lessons.length} completed</span>
          </div>
          <div className="h-2.5 rounded-full bg-secondary/60 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-purple transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search lessons..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" />
        </div>
        <div className="flex gap-1.5">
          {categories.map((c) => (
            <Button key={c} variant={category === c ? "default" : "outline"} size="sm" className={`text-xs ${category === c ? "bg-primary text-primary-foreground" : "border-border/30 text-muted-foreground"}`} onClick={() => setCategory(c)}>
              {c}
            </Button>
          ))}
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((lesson) => (
          <Card key={lesson.id} className={`bg-card/60 border-border/40 transition-colors ${lesson.locked ? "opacity-60" : "hover:border-primary/30 cursor-pointer"}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <Badge variant="outline" className="text-[10px] bg-secondary text-muted-foreground border-border/30">{lesson.category}</Badge>
                {lesson.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : lesson.locked ? (
                  <Lock className="w-4 h-4 text-muted-foreground" />
                ) : null}
              </div>
              <h3 className="text-sm font-medium text-foreground mb-2">{lesson.title}</h3>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  {lesson.type === "video" ? <Play className="w-3 h-3" /> : lesson.type === "audio" ? <Play className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
                  {lesson.type}
                </span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lesson.duration}</span>
              </div>
              {!lesson.locked && !lesson.completed && (
                <Button size="sm" className="w-full mt-3 bg-primary/10 text-primary hover:bg-primary/20 text-xs">Start Lesson</Button>
              )}
              {lesson.locked && (
                <Button size="sm" variant="outline" className="w-full mt-3 border-border/30 text-muted-foreground text-xs" disabled>
                  <Lock className="w-3 h-3 mr-1.5" /> Unlock with Pro
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
