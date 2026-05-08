import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, User, Sparkles } from "lucide-react";
import { api } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const quickPrompts = [
  "I'm having a craving right now",
  "I feel anxious today",
  "I need motivation",
  "Help me with a breathing exercise",
  "I want to celebrate a win",
];

export default function UserAICompanion() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.getAIChatHistory();
      if (response.success) {
        const history = response.data || [];
        if (history.length === 0) {
          setMessages([{ role: "ai", text: `Hi ${user?.user_metadata?.full_name || 'there'}! 👋 I'm your AI companion. I'm here to support you through your recovery journey. How are you feeling right now?` }]);
        } else {
          setMessages(history);
        }
      }
    } catch (error) {
      console.error("AI History error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const tempInput = input;
    setInput("");

    try {
      const response = await api.sendAIChatMessage(tempInput);
      if (response.success) {
        setMessages((prev) => [...prev, response.data]);
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" /> AI Companion
        </h1>
        <p className="text-sm text-muted-foreground">Your personal support companion — available 24/7.</p>
      </div>

      {/* Chat area */}
      <Card className="bg-card/60 border-border/40 flex-1 flex flex-col overflow-hidden">
        <CardContent ref={scrollRef} className="p-4 flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary/60 text-foreground rounded-bl-md"}`}>
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </CardContent>

        {/* Quick prompts */}
        <div className="px-4 pb-2">
          <div className="flex gap-1.5 flex-wrap">
            {quickPrompts.map((p) => (
              <Button key={p} variant="outline" size="sm" className="text-[11px] border-border/30 text-muted-foreground hover:text-foreground" onClick={() => handleQuickPrompt(p)}>
                {p}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 pt-2 border-t border-border/30">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="bg-secondary/40 border-border/30 text-sm flex-1"
            />
            <Button onClick={handleSend} className="bg-primary text-primary-foreground" size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
