import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipForward, Volume2, Clock, Heart, Waves, CloudRain, Wind, TreePine, Flame as Fire, Music } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

export default function UserSounds() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [soundsData, setSoundsData] = useState<any>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [category, setCategory] = useState("All");
  const [volume, setVolume] = useState([75]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSoundsData();
  }, [user]);

  const fetchSoundsData = async () => {
    try {
      setLoading(true);
      if (!user) return;
      
      const response = await api.getUserSounds();
      if (response.error) {
        toast.error('Failed to load sounds');
        return;
      }
      
      const data = response.data || {};
      setSoundsData(response.data);
    } catch (error) {
      console.error('Sounds data error:', error);
      toast.error('Failed to load sounds');
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

  const sounds = soundsData?.sounds || [];
  const categories = soundsData?.categories || ["All"];

  const filtered = sounds.filter((s: any) => category === "All" || s.category === category);

  const getIcon = (category: string) => {
    switch (category) {
      case 'Nature': return Waves;
      case 'Focus': return Music;
      case 'Music': return Music;
      case 'Meditation': return Music;
      case 'Quran': return Music;
      case 'Stories': return Music;
      case 'Duas': return Music;
      default: return Music;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Sound Therapy</h1>
        <p className="text-sm text-muted-foreground">Relax your mind with calming sounds and music.</p>
      </div>

      {/* Now Playing */}
      {playing !== null && (
        <Card className="bg-gradient-to-r from-primary/10 to-card/60 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${sounds.find((s: any) => s.id === playing)?.color}`}>
                {(() => { const Icon = getIcon(sounds.find((s: any) => s.id === playing)?.category || ''); return <Icon className="w-6 h-6" />; })()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{sounds.find((s) => s.id === playing)?.title}</div>
                <div className="text-xs text-muted-foreground">Now Playing</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-32">
                  <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                  <Slider value={volume} onValueChange={setVolume} max={100} step={1} className="flex-1" />
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setPlaying(null)}>
                  <Pause className="w-5 h-5 text-primary" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex gap-1.5">
        {categories.map((c) => (
          <Button key={c} variant={category === c ? "default" : "outline"} size="sm" className={`text-xs ${category === c ? "bg-primary text-primary-foreground" : "border-border/30 text-muted-foreground"}`} onClick={() => setCategory(c)}>
            {c}
          </Button>
        ))}
      </div>

      {/* Sounds Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filtered.map((sound) => (
          <Card key={sound.id} className={`bg-card/60 border-border/40 transition-all cursor-pointer hover:border-primary/30 ${playing === sound.id ? "ring-1 ring-primary/40" : ""}`}>
            <CardContent className="p-4 text-center">
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 ${sound.color}`}>
                {(() => { const Icon = getIcon(sound.category); return <Icon className="w-7 h-7" />; })()}
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">{sound.title}</h3>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-3">
                <Clock className="w-3 h-3" /> {sound.duration}
                <span>·</span>
                <Badge variant="outline" className="text-[9px] bg-secondary text-muted-foreground border-border/30">{sound.category}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className={`flex-1 text-xs ${playing === sound.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"}`} onClick={() => setPlaying(playing === sound.id ? null : sound.id)}>
                  {playing === sound.id ? <><Pause className="w-3 h-3 mr-1.5" /> Stop</> : <><Play className="w-3 h-3 mr-1.5" /> Play</>}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Heart className={`w-3.5 h-3.5 ${sound.favorite ? "fill-red-400 text-red-400" : "text-muted-foreground"}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
