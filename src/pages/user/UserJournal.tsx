import { useState, useMemo, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Calendar, Search, Heart, Smile, Meh, Frown, Angry, Pencil, Trash2, ChevronLeft, Lightbulb, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { z } from "zod";
import JournalStreakBadges from "@/components/user/JournalStreakBadges";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

// --- Types & Validation ---

const journalEntrySchema = z.object({
  content: z.string().trim().min(1, "Write something before saving.").max(2000, "Keep entries under 2000 characters."),
});

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  content: string;
  createdAt: string;
}

const moodMeta: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  great: { label: "Great", color: "text-green-400", icon: Heart },
  good: { label: "Good", color: "text-emerald-400", icon: Smile },
  okay: { label: "Okay", color: "text-yellow-400", icon: Meh },
  low: { label: "Low", color: "text-orange-400", icon: Frown },
  struggling: { label: "Struggling", color: "text-red-400", icon: Angry },
};

const moodOptions = Object.entries(moodMeta).map(([value, meta]) => ({ value, ...meta }));

// --- Writing Prompts ---

const promptsByMoodAndStage: Record<string, Record<string, string[]>> = {
  early: {
    great: [
      "What made today feel so good? How can you recreate that feeling?",
      "Write about a moment today that made you proud of yourself.",
      "What's one thing you're grateful for in your recovery so far?",
    ],
    good: [
      "What positive habits did you practice today?",
      "Describe a small win you had today — no matter how tiny.",
      "Who or what helped you stay on track today?",
    ],
    okay: [
      "What felt challenging today? How did you handle it?",
      "Write about one thing you can do tomorrow to feel better.",
      "What would you tell a friend who was feeling the way you feel right now?",
    ],
    low: [
      "What triggered your low mood? Can you identify the pattern?",
      "Write about a time you overcame something difficult. You've done it before.",
      "What's one kind thing you can do for yourself right now?",
    ],
    struggling: [
      "You're here, writing this — that takes strength. What kept you going today?",
      "Describe the urge without judgment. What does it feel like in your body?",
      "Write a letter to your future self who made it through this moment.",
    ],
  },
  building: {
    great: [
      "How has your perspective changed since you started this journey?",
      "What new strength have you discovered in yourself?",
      "Describe a relationship that has improved since your recovery began.",
    ],
    good: [
      "What coping strategies are working best for you right now?",
      "Write about a moment this week where you chose recovery over impulse.",
      "What advice would you give to someone just starting their journey?",
    ],
    okay: [
      "Recovery isn't linear. What can you learn from today's 'okay' feeling?",
      "What boundaries do you need to set or reinforce?",
      "Write about something you're looking forward to this week.",
    ],
    low: [
      "What situations or environments tend to bring your mood down?",
      "How is today's 'low' different from a low day at the start of your journey?",
      "Write about your 'why' — why did you start this recovery?",
    ],
    struggling: [
      "What would your life look like in 6 months if you keep going?",
      "Describe three things you've gained since starting recovery.",
      "Write about someone who believes in you, even when you don't believe in yourself.",
    ],
  },
  strong: {
    great: [
      "How can you use your experience to help someone else?",
      "Reflect on who you were before recovery vs who you are now.",
      "What does freedom mean to you today?",
    ],
    good: [
      "What routines have become second nature in your recovery?",
      "Write about a moment where you realized how far you've come.",
      "What are your goals beyond recovery? Dream big.",
    ],
    okay: [
      "Even veterans have okay days. What's your maintenance plan when motivation dips?",
      "Write about a value that recovery has helped you reconnect with.",
      "What would you tell your day-one self if you could send a message back?",
    ],
    low: [
      "Low days don't erase your progress. List 5 things you've accomplished.",
      "What's different about how you handle low days now vs early on?",
      "Write about a challenge you've overcome that once felt impossible.",
    ],
    struggling: [
      "You've built something real. Describe the life you don't want to lose.",
      "Reach out — who can you talk to right now? Write about why that's okay.",
      "Describe the strongest version of yourself. They're still here.",
    ],
  },
};

function getStage(daysClean: number): string {
  if (daysClean < 14) return "early";
  if (daysClean < 60) return "building";
  return "strong";
}

function getPrompts(mood: string, daysClean: number): string[] {
  const stage = getStage(daysClean);
  return promptsByMoodAndStage[stage]?.[mood] || promptsByMoodAndStage[stage]?.okay || [];
}

// --- LocalStorage helpers ---

function loadEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem("quittr_journal");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: JournalEntry[]) {
  localStorage.setItem("quittr_journal", JSON.stringify(entries));
}

// --- Mock seed data ---

function seedIfEmpty(): JournalEntry[] {
  const existing = loadEntries();
  if (existing.length > 0) return existing;

  const seeds: JournalEntry[] = [
    { id: "s1", date: format(subDays(new Date(), 6), "yyyy-MM-dd"), mood: "good", content: "Had a productive day. Stayed focused and completed two lessons. Feeling stronger.", createdAt: subDays(new Date(), 6).toISOString() },
    { id: "s2", date: format(subDays(new Date(), 4), "yyyy-MM-dd"), mood: "okay", content: "Felt some urges today but used the breathing exercises. They passed after a few minutes.", createdAt: subDays(new Date(), 4).toISOString() },
    { id: "s3", date: format(subDays(new Date(), 2), "yyyy-MM-dd"), mood: "great", content: "Hit my 2-week milestone! Shared it in the community and got so much support. Grateful.", createdAt: subDays(new Date(), 2).toISOString() },
    { id: "s4", date: format(subDays(new Date(), 1), "yyyy-MM-dd"), mood: "good", content: "Morning meditation really helped set the tone. Listened to Dr. Sarah's voice therapy session.", createdAt: subDays(new Date(), 1).toISOString() },
  ];
  saveEntries(seeds);
  return seeds;
}

// --- Component ---

export default function UserJournal() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMood, setFilterMood] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editorMood, setEditorMood] = useState("good");
  const [editorContent, setEditorContent] = useState("");
  const [editorError, setEditorError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const daysClean = 14;

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      if (!user) return;
      const response = await api.getUserJournal();
      if (response.success) {
        setEntries(response.data || []);
      }
    } catch (error) {
      console.error("Journal fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentPrompts = useMemo(() => getPrompts(editorMood, daysClean), [editorMood, daysClean]);
  const activePrompt = currentPrompts[promptIndex % currentPrompts.length] || "";
  const shufflePrompt = useCallback(() => {
    setPromptIndex((prev) => (prev + 1) % Math.max(currentPrompts.length, 1));
  }, [currentPrompts.length]);

  const filtered = useMemo(() => {
    return entries
      .filter((e) => {
        if (filterMood && e.mood !== filterMood) return false;
        if (search && !e.content.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [entries, search, filterMood]);

  const openNewEntry = useCallback(() => {
    setEditingEntry(null);
    setEditorMood("good");
    setEditorContent("");
    setEditorError("");
    setShowEditor(true);
  }, []);

  const openEditEntry = useCallback((entry: JournalEntry) => {
    setEditingEntry(entry);
    setEditorMood(entry.mood);
    setEditorContent(entry.content);
    setEditorError("");
    setShowEditor(true);
    setSelectedEntry(null);
  }, []);

  const handleSave = useCallback(async () => {
    const result = journalEntrySchema.safeParse({ content: editorContent });
    if (!result.success) {
      setEditorError(result.error.errors[0].message);
      return;
    }

    try {
      if (editingEntry) {
        const response = await api.updateJournalEntry(editingEntry.id, {
          mood: editorMood,
          content: result.data.content
        });
        if (response.success) {
          toast.success("Entry updated");
          fetchEntries();
        }
      } else {
        const response = await api.createJournalEntry({
          mood: editorMood,
          content: result.data.content
        });
        if (response.success) {
          toast.success("Journal entry saved ✍️");
          fetchEntries();
        }
      }
      setShowEditor(false);
    } catch (error) {
      toast.error("Failed to save entry");
    }
  }, [editorContent, editorMood, editingEntry, entries]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await api.deleteJournalEntry(id);
      if (response.success) {
        toast.success("Entry deleted");
        fetchEntries();
        setShowDeleteConfirm(null);
        setSelectedEntry(null);
      }
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  }, [entries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Journal
          </h1>
          <p className="text-sm text-muted-foreground">Reflect on your journey — one day at a time.</p>
        </div>
        <Button onClick={openNewEntry} size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" /> New Entry
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search entries…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/30 border-border/40"
            maxLength={100}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button
            variant={filterMood === null ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setFilterMood(null)}
          >
            All
          </Button>
          {moodOptions.map((m) => {
            const Icon = m.icon;
            return (
              <Button
                key={m.value}
                variant={filterMood === m.value ? "default" : "outline"}
                size="sm"
                className="text-xs gap-1"
                onClick={() => setFilterMood(filterMood === m.value ? null : m.value)}
              >
                <Icon className="w-3 h-3" /> {m.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Streaks & Badges */}
      <JournalStreakBadges entries={entries} />

      {/* Entry List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No entries found. Start writing!</p>
            </motion.div>
          ) : (
            filtered.map((entry) => {
              const meta = moodMeta[entry.mood] || moodMeta.okay;
              const Icon = meta.icon;
              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setSelectedEntry(entry)}
                  className="cursor-pointer"
                >
                  <Card className="bg-card/60 border-border/40 hover:border-primary/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-secondary/50`}>
                          <Icon className={`w-4 h-4 ${meta.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(entry.createdAt), "MMM d, yyyy")}
                            </span>
                            <Badge variant="outline" className={`text-[9px] ${meta.color} border-current/20`}>
                              {meta.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-foreground line-clamp-2">{entry.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Entry Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={(v) => !v && setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-lg border-border/60 bg-card">
          {selectedEntry && (() => {
            const meta = moodMeta[selectedEntry.mood] || moodMeta.okay;
            const Icon = meta.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base">
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                    {format(new Date(selectedEntry.createdAt), "EEEE, MMMM d, yyyy")}
                  </DialogTitle>
                  <DialogDescription>
                    <Badge variant="outline" className={`text-xs ${meta.color} border-current/20`}>
                      Feeling {meta.label}
                    </Badge>
                  </DialogDescription>
                </DialogHeader>
                <div className="py-2">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selectedEntry.content}</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => openEditEntry(selectedEntry)}>
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 text-destructive hover:text-destructive"
                    onClick={() => setShowDeleteConfirm(selectedEntry.id)}
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={(v) => !v && setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm border-border/60 bg-card">
          <DialogHeader>
            <DialogTitle>Delete entry?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={() => showDeleteConfirm && handleDelete(showDeleteConfirm)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={(v) => !v && setShowEditor(false)}>
        <DialogContent className="sm:max-w-lg border-border/60 bg-card">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Entry" : "New Journal Entry"}</DialogTitle>
            <DialogDescription>How are you feeling? Write whatever comes to mind.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Mood</div>
              <div className="flex gap-2">
                {moodOptions.map((m) => {
                  const MIcon = m.icon;
                  const selected = editorMood === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setEditorMood(m.value)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${
                        selected
                          ? "bg-primary/10 border-primary/30 scale-105"
                          : "bg-secondary/20 border-border/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <MIcon className={`w-5 h-5 ${m.color}`} />
                      <span className="text-[10px] text-foreground">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Textarea
                placeholder="What's on your mind today? Triggers, wins, thoughts…"
                value={editorContent}
                onChange={(e) => { setEditorContent(e.target.value); setEditorError(""); }}
                className="min-h-[120px] bg-secondary/30 border-border/40 resize-none"
                maxLength={2000}
              />
              <div className="flex justify-between mt-1">
                {editorError && <span className="text-xs text-destructive">{editorError}</span>}
                <span className="text-[10px] text-muted-foreground ml-auto">{editorContent.length}/2000</span>
              </div>
            </div>
            {/* Writing Prompt */}
            {!editingEntry && activePrompt && (
              <motion.div
                key={activePrompt}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/15"
              >
                <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-primary/60 font-medium mb-0.5">Writing Prompt</div>
                  <p className="text-sm text-foreground">{activePrompt}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={shufflePrompt} title="Another prompt">
                  <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </motion.div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowEditor(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSave}>{editingEntry ? "Update" : "Save Entry"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
