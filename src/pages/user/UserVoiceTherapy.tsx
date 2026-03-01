import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Clock, Heart, Search, Mic, Brain, ShieldCheck, Moon,
  Sunrise, Sparkles, Repeat, Shuffle, ListMusic, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceTrack {
  id: number;
  title: string;
  therapist: string;
  duration: string;
  durationSec: number;
  category: string;
  description: string;
  voice: "male" | "female" | "ai";
  favorite: boolean;
  plays: number;
  isNew?: boolean;
}

const tracks: VoiceTrack[] = [
  { id: 1, title: "Letting Go of Anxiety", therapist: "Dr. Sarah Wells", duration: "12:30", durationSec: 750, category: "Anxiety", description: "A calming guided session to release tension and anxious thoughts.", voice: "female", favorite: true, plays: 4820, isNew: false },
  { id: 2, title: "Building Inner Strength", therapist: "Dr. Marcus Lee", duration: "15:00", durationSec: 900, category: "Motivation", description: "Empowering affirmations to build resilience and self-belief.", voice: "male", favorite: false, plays: 3200, isNew: false },
  { id: 3, title: "Sleep & Recovery", therapist: "AI Voice — Luna", duration: "20:00", durationSec: 1200, category: "Sleep", description: "A soothing bedtime therapy to guide you into restful sleep.", voice: "ai", favorite: true, plays: 8100, isNew: true },
  { id: 4, title: "Morning Mindfulness", therapist: "Dr. Sarah Wells", duration: "10:00", durationSec: 600, category: "Mindfulness", description: "Start your day grounded with this gentle mindfulness practice.", voice: "female", favorite: false, plays: 2900 },
  { id: 5, title: "Overcoming Urges", therapist: "Dr. James Hart", duration: "8:45", durationSec: 525, category: "Recovery", description: "Practical techniques to navigate and overcome difficult urges.", voice: "male", favorite: true, plays: 6400 },
  { id: 6, title: "Self-Compassion Practice", therapist: "AI Voice — Atlas", duration: "14:20", durationSec: 860, category: "Mindfulness", description: "Learn to treat yourself with the kindness you deserve.", voice: "ai", favorite: false, plays: 1800, isNew: true },
  { id: 7, title: "Deep Relaxation Body Scan", therapist: "Dr. Emily Tran", duration: "18:00", durationSec: 1080, category: "Anxiety", description: "A progressive body scan to release physical tension head to toe.", voice: "female", favorite: false, plays: 5100 },
  { id: 8, title: "Rewiring Habits", therapist: "Dr. Marcus Lee", duration: "11:15", durationSec: 675, category: "Recovery", description: "Understand the neuroscience of habits and how to create new patterns.", voice: "male", favorite: false, plays: 3700 },
  { id: 9, title: "Gratitude & Positivity", therapist: "AI Voice — Luna", duration: "9:30", durationSec: 570, category: "Motivation", description: "Shift your focus to gratitude and cultivate a positive mindset.", voice: "ai", favorite: true, plays: 2400 },
  { id: 10, title: "Evening Wind Down", therapist: "Dr. Emily Tran", duration: "16:00", durationSec: 960, category: "Sleep", description: "Transition from your busy day into peaceful evening rest.", voice: "female", favorite: false, plays: 4300 },
];

const categories = ["All", "Recovery", "Anxiety", "Mindfulness", "Sleep", "Motivation"];

const categoryIcons: Record<string, React.ElementType> = {
  Recovery: ShieldCheck,
  Anxiety: Brain,
  Mindfulness: Sparkles,
  Sleep: Moon,
  Motivation: Sunrise,
};

const voiceBadge: Record<string, { label: string; className: string }> = {
  female: { label: "Human", className: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
  male: { label: "Human", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  ai: { label: "AI Voice", className: "bg-primary/10 text-primary border-primary/20" },
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function UserVoiceTherapy() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [currentTrack, setCurrentTrack] = useState<VoiceTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState([80]);
  const [muted, setMuted] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set(tracks.filter(t => t.favorite).map(t => t.id)));
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const filtered = tracks.filter(t => {
    const matchCat = category === "All" || t.category === category;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.therapist.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const playTrack = (track: VoiceTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const skipNext = () => {
    if (!currentTrack) return;
    const idx = filtered.findIndex(t => t.id === currentTrack.id);
    const next = shuffle
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : filtered[(idx + 1) % filtered.length];
    playTrack(next);
  };

  const skipPrev = () => {
    if (!currentTrack) return;
    const idx = filtered.findIndex(t => t.id === currentTrack.id);
    const prev = filtered[(idx - 1 + filtered.length) % filtered.length];
    playTrack(prev);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mic className="w-5 h-5 text-primary" />
            <h1 className="font-display text-2xl font-bold text-foreground">Voice Therapy</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Guided sessions from therapists & AI voices to support your recovery.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tracks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-1.5 flex-wrap">
        {categories.map(c => {
          const Icon = categoryIcons[c];
          return (
            <Button
              key={c}
              variant={category === c ? "default" : "outline"}
              size="sm"
              className={`text-xs gap-1.5 ${category === c ? "bg-primary text-primary-foreground" : "border-border/40 text-muted-foreground"}`}
              onClick={() => setCategory(c)}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {c}
            </Button>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sessions", value: tracks.length.toString(), icon: Mic },
          { label: "Total Duration", value: `${Math.round(tracks.reduce((a, t) => a + t.durationSec, 0) / 60)} min`, icon: Clock },
          { label: "AI Voices", value: tracks.filter(t => t.voice === "ai").length.toString(), icon: Brain },
          { label: "Your Favorites", value: favorites.size.toString(), icon: Heart },
        ].map(s => (
          <Card key={s.label} className="bg-card/60 border-border/40">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-lg font-bold text-foreground leading-none">{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Track List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((track, idx) => {
            const CatIcon = categoryIcons[track.category] || Mic;
            const isActive = currentTrack?.id === track.id;
            return (
              <motion.div
                key={track.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
              >
                <Card
                  className={`bg-card/60 border-border/40 transition-all cursor-pointer hover:border-primary/30 group ${isActive ? "ring-1 ring-primary/40 border-primary/30" : ""}`}
                  onClick={() => playTrack(track)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    {/* Play indicator / number */}
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      {isActive && isPlaying ? (
                        <div className="flex items-end gap-0.5 h-4">
                          {[1, 2, 3].map(i => (
                            <motion.div
                              key={i}
                              className="w-1 bg-primary rounded-full"
                              animate={{ height: ["40%", "100%", "40%"] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </div>
                      ) : (
                        <CatIcon className="w-5 h-5 text-primary" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{track.title}</span>
                        {track.isNew && <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[9px]">NEW</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{track.therapist}</div>
                    </div>

                    {/* Meta */}
                    <div className="hidden sm:flex items-center gap-3">
                      <Badge variant="outline" className={`text-[9px] ${voiceBadge[track.voice].className}`}>
                        {voiceBadge[track.voice].label}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] border-border/30 text-muted-foreground">
                        {track.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3 h-3" />
                      {track.duration}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={e => { e.stopPropagation(); toggleFavorite(track.id); }}
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(track.id) ? "fill-red-400 text-red-400" : "text-muted-foreground"}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={e => { e.stopPropagation(); playTrack(track); }}
                      >
                        {isActive && isPlaying ? (
                          <Pause className="w-4 h-4 text-primary" />
                        ) : (
                          <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No tracks found. Try a different search or category.
          </div>
        )}
      </div>

      {/* Bottom Player Bar */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/95 backdrop-blur-xl"
          >
            {/* Progress bar */}
            <div className="h-1 bg-muted w-full">
              <Slider
                value={[progress]}
                onValueChange={v => setProgress(v[0])}
                max={currentTrack.durationSec}
                step={1}
                className="h-1 rounded-none [&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:-top-1"
              />
            </div>

            <div className="container mx-auto flex items-center gap-4 px-4 py-3">
              {/* Track info */}
              <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-none sm:w-60">
                <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{currentTrack.title}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{currentTrack.therapist}</div>
                </div>
              </div>

              {/* Controls */}
              <div className="hidden sm:flex flex-1 flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className={`h-8 w-8 ${shuffle ? "text-primary" : "text-muted-foreground"}`} onClick={() => setShuffle(!shuffle)}>
                    <Shuffle className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={skipPrev}>
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={skipNext}>
                    <SkipForward className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className={`h-8 w-8 ${repeat ? "text-primary" : "text-muted-foreground"}`} onClick={() => setRepeat(!repeat)}>
                    <Repeat className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground w-full max-w-xs">
                  <span>{formatTime(progress)}</span>
                  <div className="flex-1" />
                  <span>{currentTrack.duration}</span>
                </div>
              </div>

              {/* Mobile play/pause */}
              <div className="flex sm:hidden items-center gap-1">
                <Button size="icon" className="h-9 w-9 rounded-full bg-primary text-primary-foreground" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground" onClick={skipNext}>
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume */}
              <div className="hidden sm:flex items-center gap-2 w-36">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setMuted(!muted)}>
                  {muted || volume[0] === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider value={muted ? [0] : volume} onValueChange={v => { setVolume(v); setMuted(false); }} max={100} step={1} className="flex-1" />
              </div>

              {/* Close */}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => { setCurrentTrack(null); setIsPlaying(false); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
