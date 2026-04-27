import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart, MessageSquare, Share2, Send, Trophy, Flame, BookOpen,
  Sparkles, HandHeart, Filter,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import CommunityPostCard, { type PostData } from "@/components/user/CommunityPostCard";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type PostCategory = "all" | "milestone" | "journal" | "encouragement" | "general";

const posts: PostData[] = [
  {
    id: 1, author: "Sarah C.", avatar: "SC", time: "2h ago", badge: "30 Day Club",
    text: "Just hit my 30-day milestone! 🎉 Never thought I'd make it this far. Thank you all for the support.",
    category: "milestone", likes: 42, comments: 12, liked: true,
    milestone: { label: "30 Days Clean", days: 30 },
    reactions: [
      { emoji: "🎉", label: "Celebrate", count: 18, reacted: true },
      { emoji: "💪", label: "Strong", count: 12, reacted: false },
      { emoji: "❤️", label: "Love", count: 8, reacted: false },
    ],
  },
  {
    id: 2, author: "Marcus R.", avatar: "MR", time: "5h ago", badge: "Newcomer",
    text: "Day 3 here. The cravings are intense but I'm using the breathing exercises from lesson 5. Any other tips?",
    category: "encouragement", likes: 28, comments: 18, liked: false,
    reactions: [
      { emoji: "💪", label: "Strong", count: 22, reacted: false },
      { emoji: "🫂", label: "Support", count: 15, reacted: true },
    ],
  },
  {
    id: 3, author: "Aiko T.", avatar: "AT", time: "1d ago", badge: "Week Warrior",
    text: "Reflecting on my week — I noticed my triggers are less intense when I journal before bed. Here's a snippet from last night:",
    category: "journal", likes: 55, comments: 7, liked: true,
    journalSnippet: "\"Today I chose peace over impulse. The urge came at 9pm like clockwork, but I sat with it, breathed, and it passed. I am stronger than I think.\"",
    reactions: [
      { emoji: "✨", label: "Inspiring", count: 30, reacted: true },
      { emoji: "❤️", label: "Love", count: 14, reacted: false },
    ],
  },
  {
    id: 4, author: "James O.", avatar: "JO", time: "1d ago", badge: "Mentor",
    text: "To everyone struggling today: You are NOT alone. I've been where you are, and I promise it gets better. Keep showing up. 💪",
    category: "encouragement", likes: 89, comments: 24, liked: false,
    reactions: [
      { emoji: "🫂", label: "Support", count: 45, reacted: false },
      { emoji: "❤️", label: "Love", count: 32, reacted: true },
      { emoji: "💪", label: "Strong", count: 20, reacted: false },
    ],
  },
  {
    id: 5, author: "Emma W.", avatar: "EW", time: "2d ago", badge: "2 Week Hero",
    text: "Used the panic button for the first time today. Followed all the steps and the craving passed. This app literally saved me.",
    category: "milestone", likes: 67, comments: 15, liked: true,
    milestone: { label: "First Panic Save", days: 14 },
    reactions: [
      { emoji: "🎉", label: "Celebrate", count: 28, reacted: false },
      { emoji: "💪", label: "Strong", count: 19, reacted: true },
    ],
  },
  {
    id: 6, author: "Priya K.", avatar: "PK", time: "3d ago", badge: "Reflector",
    text: "Sharing a journal highlight — writing has become my therapy.",
    category: "journal", likes: 38, comments: 9, liked: false,
    journalSnippet: "\"Week 2: I used to think willpower was everything. Now I realize it's about systems — the habits, the routines, the people you surround yourself with. This community is my system.\"",
    reactions: [
      { emoji: "✨", label: "Inspiring", count: 22, reacted: false },
      { emoji: "❤️", label: "Love", count: 11, reacted: false },
    ],
  },
  {
    id: 7, author: "David L.", avatar: "DL", time: "3d ago", badge: "7 Day Club",
    text: "One full week! 🏆 Seven days ago I couldn't imagine going a single day. To anyone on Day 1 — you CAN do this.",
    category: "milestone", likes: 74, comments: 20, liked: false,
    milestone: { label: "7 Days Clean", days: 7 },
    reactions: [
      { emoji: "🎉", label: "Celebrate", count: 35, reacted: false },
      { emoji: "🫂", label: "Support", count: 18, reacted: false },
    ],
  },
];

const categoryConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  all: { label: "All Posts", icon: Filter, color: "text-muted-foreground" },
  milestone: { label: "Milestones", icon: Trophy, color: "text-amber-400" },
  journal: { label: "Journal", icon: BookOpen, color: "text-sky-400" },
  encouragement: { label: "Encouragement", icon: HandHeart, color: "text-rose-400" },
  general: { label: "General", icon: MessageSquare, color: "text-muted-foreground" },
};

const postTypeOptions: { value: PostCategory; label: string }[] = [
  { value: "general", label: "💬 General" },
  { value: "milestone", label: "🏆 Share Milestone" },
  { value: "journal", label: "📖 Journal Highlight" },
  { value: "encouragement", label: "💪 Encouragement" },
];

export default function UserCommunity() {
  const [loading, setLoading] = useState(true);
  const [communityData, setCommunityData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState<PostCategory>("general");
  const [activeFilter, setActiveFilter] = useState<PostCategory>("all");
  const [localReactions, setLocalReactions] = useState<Record<number, Record<string, boolean>>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCommunityData();
  }, []);

  const fetchCommunityData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await api.getUserCommunity(token);
      if (response.error) {
        toast.error('Failed to load community posts');
        return;
      }
      
      setCommunityData(response);
    } catch (error) {
      console.error('Community data error:', error);
      toast.error('Failed to load community posts');
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

  const threads = communityData?.threads || [];

  const filteredThreads = threads.filter((thread: any) =>
    thread.content.toLowerCase().includes(search.toLowerCase())
  );

  const allPosts = useMemo(() => {
    const shared: PostData[] = JSON.parse(localStorage.getItem("quittr_community_posts") || "[]");
    return [...shared, ...posts];
  }, []);

  const filteredPosts = activeFilter === "all" ? allPosts : allPosts.filter((p) => p.category === activeFilter);

  const toggleReaction = (postId: number, emoji: string) => {
    setLocalReactions((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], [emoji]: !prev[postId]?.[emoji] },
    }));
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Community</h1>
        <p className="text-sm text-muted-foreground">Share your journey, support others, and find strength together.</p>
      </div>

      {/* New Post */}
      <Card className="bg-card/60 border-border/40">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Select value={postType} onValueChange={(v) => setPostType(v as PostCategory)}>
              <SelectTrigger className="w-[200px] h-8 text-xs bg-secondary/40 border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {postTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder={
              postType === "milestone"
                ? "Share your milestone with the community! 🏆"
                : postType === "journal"
                ? "Share a journal snippet or reflection... 📖"
                : postType === "encouragement"
                ? "Send some encouragement to the community! 💪"
                : "Share something with the community..."
            }
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="bg-secondary/40 border-border/30 text-sm resize-none"
            rows={3}
          />
          <div className="flex justify-end">
            <Button size="sm" className="bg-primary text-primary-foreground text-xs">
              <Send className="w-3 h-3 mr-1.5" /> Post
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as PostCategory)}>
        <TabsList className="bg-secondary/40 w-full justify-start overflow-x-auto">
          {(Object.keys(categoryConfig) as PostCategory[]).map((cat) => {
            const cfg = categoryConfig[cat];
            const Icon = cfg.icon;
            return (
              <TabsTrigger key={cat} value={cat} className="text-xs gap-1.5 data-[state=active]:bg-primary/10">
                <Icon className={`w-3.5 h-3.5 ${cat === activeFilter ? cfg.color : ""}`} />
                {cfg.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Posts Feed */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <CommunityPostCard
            key={post.id}
            post={post}
            categoryConfig={categoryConfig[post.category] || categoryConfig.general}
            localReactions={localReactions[post.id] || {}}
            onToggleReaction={(emoji) => toggleReaction(post.id, emoji)}
          />
        ))}
      </div>
    </div>
  );
}
