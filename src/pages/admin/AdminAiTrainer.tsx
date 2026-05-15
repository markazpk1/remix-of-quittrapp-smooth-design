import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import {
  Sparkles,
  Send,
  Bot,
  Video,
  BookOpen,
  History,
  Brain,
  Search,
  Star,
  ExternalLink,
  ChevronRight,
  Plus,
  Loader2,
  Settings2,
  Youtube,
  GraduationCap
} from "lucide-react";

export default function AdminAiTrainer() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [generatedLessons, setGeneratedLessons] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInteractions();
    fetchLessons();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchInteractions = async () => {
    const res = await api.getAiInteractions();
    if (res.success) {
      const formatted = res.data.flatMap((i: any) => [
        { role: "user", text: i.message, time: i.created_at },
        { role: "assistant", text: i.response, time: i.created_at }
      ]);
      setMessages(formatted);
    }
  };

  const fetchLessons = async () => {
    const res = await api.getAiLessons();
    if (res.success) setGeneratedLessons(res.data);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMsg, time: new Date().toISOString() }]);
    
    setLoading(true);
    try {
      const res = await api.createAiInteraction(userMsg);
      if (res.success) {
        setMessages(prev => [...prev, { role: "assistant", text: res.data.response, time: new Date().toISOString() }]);
      }
    } catch (error) {
      toast({ title: "Error", description: "AI failed to respond", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLesson = async (topic: string) => {
    toast({ title: "Working", description: "Agent is drafting the recovery lesson..." });
    const res = await api.generateAiLesson(topic);
    if (res.success) {
      toast({ title: "Success", description: "Lesson blueprint created!" });
      fetchLessons();
      setActiveTab("lessons");
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Recovery Trainer</h1>
            <p className="text-sm text-muted-foreground">Train your AI, find resources, and generate recovery content.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.href='/admin/ai-settings'}>
            <Settings2 className="w-4 h-4 mr-2" /> Settings
          </Button>
          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-500 flex items-center gap-2 font-bold uppercase tracking-wider">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Agent Online
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        {/* Sidebar Tools */}
        <div className="space-y-4 shrink-0 overflow-y-auto pr-2">
          <Card className="bg-card/40 border-border/40">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="p-2 space-y-1">
              {[
                { icon: BookOpen, label: "Create Lessons", color: "text-blue-400" },
                { icon: Youtube, label: "Find Islamic Videos", color: "text-red-400" },
                { icon: Brain, label: "Behavioral Blueprint", color: "text-purple-400" },
                { icon: Star, label: "Motivation Quotes", color: "text-amber-400" }
              ].map((tool, i) => (
                <Button key={i} variant="ghost" className="w-full justify-start text-xs h-9 group">
                  <tool.icon className={`w-3.5 h-3.5 mr-3 ${tool.color} group-hover:scale-110 transition-transform`} />
                  {tool.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/40 border-border/40">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Suggested Topics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {[
                "Dangers of Dopamine Spikes",
                "Islamic Concept of Tazkiyah",
                "Daily Routine for Recovery",
                "Managing Triggers in Ramadan"
              ].map((topic, i) => (
                <div 
                  key={i} 
                  className="p-2 rounded-lg bg-background/40 border border-border/20 text-[10px] hover:border-primary/50 cursor-pointer transition-colors"
                  onClick={() => handleGenerateLesson(topic)}
                >
                  {topic}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Interface */}
        <div className="lg:col-span-3 flex flex-col h-full space-y-4 overflow-hidden">
          <div className="flex items-center gap-1 bg-card/40 p-1 rounded-lg border border-border/40 shrink-0">
            <Button 
              variant={activeTab === "chat" ? "secondary" : "ghost"} 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => setActiveTab("chat")}
            >
              AI Assistant
            </Button>
            <Button 
              variant={activeTab === "lessons" ? "secondary" : "ghost"} 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => setActiveTab("lessons")}
            >
              Drafted Lessons ({generatedLessons.length})
            </Button>
            <Button 
              variant={activeTab === "videos" ? "secondary" : "ghost"} 
              size="sm" 
              className="flex-1 text-xs"
              onClick={() => setActiveTab("videos")}
            >
              Video Search
            </Button>
          </div>

          <div className="flex-1 overflow-hidden relative border border-border/40 rounded-xl bg-card/20 backdrop-blur-sm">
            {activeTab === "chat" && (
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                  <div className="space-y-6">
                    {messages.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold">Welcome back, Trainer.</h3>
                          <p className="text-xs text-muted-foreground max-w-xs">Ask me to draft a lesson, find Islamic motivational content, or analyze recovery strategies.</p>
                        </div>
                      </div>
                    )}
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border/40'}`}>
                          {msg.role === 'user' ? 'A' : <Bot className="w-4 h-4" />}
                        </div>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted/40 border border-border/20 rounded-tl-none'}`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center animate-pulse">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-muted/40 p-3 rounded-2xl rounded-tl-none border border-border/20">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t border-border/40 bg-background/40">
                  <div className="relative">
                    <Input 
                      placeholder="Ask the Agent to generate a lesson or find content..."
                      className="pr-12 bg-background/50 border-border/40 h-11 text-xs"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button 
                      size="icon" 
                      className="absolute right-1 top-1 h-9 w-9 bg-primary"
                      onClick={handleSend}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "lessons" && (
              <ScrollArea className="h-full p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedLessons.map((lesson) => (
                    <Card key={lesson.id} className="bg-card/40 border-border/40 hover:border-primary/30 transition-all group">
                      <CardHeader className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-0">AI Generated</Badge>
                          <span className="text-[10px] text-muted-foreground">{new Date(lesson.created_at).toLocaleDateString()}</span>
                        </div>
                        <CardTitle className="text-sm font-bold">{lesson.topic}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-[11px] text-muted-foreground line-clamp-3 mb-4">{lesson.content}</p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="secondary" className="flex-1 text-[10px] h-7">Edit & Review</Button>
                          <Button size="sm" variant="outline" className="flex-1 text-[10px] h-7">Publish</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}

            {activeTab === "videos" && (
              <div className="flex flex-col h-full items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <Youtube className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold">Video Discovery Engine</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">Connected to YouTube Data API. Agent can curate Islamic motivational videos based on recovery milestones.</p>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 text-white">
                  Start Resource Search
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
