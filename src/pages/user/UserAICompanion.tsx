import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, User, Sparkles } from "lucide-react";

const initialMessages = [
  { role: "ai", text: "Hi John! 👋 I'm your AI companion. I'm here to support you through your recovery journey. How are you feeling right now?" },
];

const quickPrompts = [
  "I'm having a craving right now",
  "I feel anxious today",
  "I need motivation",
  "Help me with a breathing exercise",
  "I want to celebrate a win",
];

export default function UserAICompanion() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        role: "ai",
        text: "Thank you for sharing that with me. Remember, every moment of awareness is a step forward in your journey. Would you like to try a quick grounding exercise, or would you prefer to talk more about what you're experiencing?"
      }]);
    }, 1000);
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
        <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
          {messages.map((msg, i) => (
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
