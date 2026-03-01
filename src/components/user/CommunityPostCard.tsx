import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MentionInput, RenderMentionText } from "@/components/user/MentionInput";
import { useNotifications } from "@/contexts/NotificationContext";
import {
  Heart, MessageSquare, Share2, Send, Trophy, Flame, BookOpen,
  Sparkles, ChevronDown, ChevronUp, Reply, CornerDownRight,
} from "lucide-react";

interface Reaction {
  emoji: string;
  label: string;
  count: number;
  reacted: boolean;
}

interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
  likes: number;
  liked: boolean;
  parentId?: number;
  replies?: Comment[];
}

export interface PostData {
  id: number;
  author: string;
  avatar: string;
  time: string;
  badge: string;
  text: string;
  category: string;
  likes: number;
  comments: number;
  liked: boolean;
  reactions: Reaction[];
  milestone?: { label: string; days?: number };
  journalSnippet?: string;
}

interface CategoryConfig {
  label: string;
  icon: React.ElementType;
  color: string;
}

// Mock comments per post (with nested replies)
const mockComments: Record<number, Comment[]> = {
  1: [
    {
      id: 101, author: "James O.", avatar: "JO", text: "Incredible! 30 days is a huge deal. You should be so proud 🙌", time: "1h ago", likes: 8, liked: false,
      replies: [
        { id: 1011, author: "Sarah C.", avatar: "SC", text: "Thank you so much James! Your posts kept me going ❤️", time: "50m ago", likes: 3, liked: true },
      ],
    },
    {
      id: 102, author: "Emma W.", avatar: "EW", text: "This is so inspiring. I'm on day 12 and seeing your post keeps me going!", time: "1h ago", likes: 5, liked: true,
      replies: [
        { id: 1021, author: "Aiko T.", avatar: "AT", text: "You're almost at 2 weeks Emma! Keep pushing 💪", time: "45m ago", likes: 2, liked: false },
      ],
    },
    { id: 103, author: "Marcus R.", avatar: "MR", text: "Any tips for getting through week 2? That's where I always struggle.", time: "45m ago", likes: 3, liked: false },
  ],
  2: [
    {
      id: 201, author: "Sarah C.", avatar: "SC", text: "The breathing exercises are great! Also try the cold water technique from lesson 8.", time: "4h ago", likes: 12, liked: true,
      replies: [
        { id: 2011, author: "Marcus R.", avatar: "MR", text: "I'll check out lesson 8 today, thanks @sarah_c!", time: "3h ago", likes: 4, liked: false },
        { id: 2012, author: "Sarah C.", avatar: "SC", text: "Let me know how it goes! It was a game changer for me.", time: "2h ago", likes: 2, liked: false },
      ],
    },
    { id: 202, author: "Aiko T.", avatar: "AT", text: "Day 3 was the hardest for me too. It gets so much better after day 5. Hang in there! 💪", time: "3h ago", likes: 9, liked: false },
    { id: 203, author: "David L.", avatar: "DL", text: "Journaling helped me a lot with cravings. Write down what you're feeling in the moment.", time: "2h ago", likes: 6, liked: false },
    { id: 204, author: "Priya K.", avatar: "PK", text: "The sound therapy is amazing for when cravings hit. Ocean waves + rain combo!", time: "1h ago", likes: 4, liked: false },
  ],
  3: [
    { id: 301, author: "James O.", avatar: "JO", text: "Beautiful journal entry. Writing really does rewire the brain.", time: "20h ago", likes: 7, liked: false },
    { id: 302, author: "Emma W.", avatar: "EW", text: "I need to start journaling before bed too. Thanks for sharing this!", time: "18h ago", likes: 4, liked: true },
  ],
  4: [
    {
      id: 401, author: "Sarah C.", avatar: "SC", text: "Thank you James. Messages like these make all the difference ❤️", time: "22h ago", likes: 15, liked: true,
      replies: [
        { id: 4011, author: "James O.", avatar: "JO", text: "We're all in this together, Sarah. You inspire me too!", time: "21h ago", likes: 7, liked: false },
      ],
    },
    { id: 402, author: "Marcus R.", avatar: "MR", text: "Needed this today. Thank you.", time: "20h ago", likes: 11, liked: false },
    { id: 403, author: "Priya K.", avatar: "PK", text: "You're a real mentor to this community. We appreciate you!", time: "18h ago", likes: 8, liked: false },
  ],
  5: [
    { id: 501, author: "David L.", avatar: "DL", text: "The panic button is genuinely life-saving. Glad it worked for you!", time: "1d ago", likes: 9, liked: false },
    { id: 502, author: "Aiko T.", avatar: "AT", text: "Same here! It walked me through the craving step by step.", time: "1d ago", likes: 6, liked: true },
  ],
  6: [
    { id: 601, author: "James O.", avatar: "JO", text: "Your writing is beautiful, Priya. Systems over willpower — 100% agree.", time: "2d ago", likes: 5, liked: false },
  ],
  7: [
    {
      id: 701, author: "Sarah C.", avatar: "SC", text: "One week! That first week is the hardest. You're amazing 🏆", time: "2d ago", likes: 12, liked: true,
      replies: [
        { id: 7011, author: "David L.", avatar: "DL", text: "Thanks Sarah! Means a lot coming from a 30-day veteran 😊", time: "1d ago", likes: 5, liked: false },
      ],
    },
    { id: 702, author: "Emma W.", avatar: "EW", text: "I remember day 7. It felt like climbing a mountain. You made it!", time: "2d ago", likes: 8, liked: false },
    { id: 703, author: "Marcus R.", avatar: "MR", text: "Day 1 here. Posts like yours give me hope. Thank you.", time: "1d ago", likes: 14, liked: false },
  ],
};

interface Props {
  post: PostData;
  categoryConfig: CategoryConfig;
  localReactions: Record<string, boolean>;
  onToggleReaction: (emoji: string) => void;
}

// Recursive comment component
function CommentItem({
  comment,
  depth,
  likedComments,
  toggleCommentLike,
  replyingTo,
  setReplyingTo,
  replyText,
  setReplyText,
  onSubmitReply,
  localReplies,
}: {
  comment: Comment;
  depth: number;
  likedComments: Record<number, boolean>;
  toggleCommentLike: (id: number) => void;
  replyingTo: number | null;
  setReplyingTo: (id: number | null) => void;
  replyText: string;
  setReplyText: (t: string) => void;
  onSubmitReply: (parentId: number) => void;
  localReplies: Record<number, Comment[]>;
}) {
  const isLiked = likedComments[comment.id] ?? comment.liked;
  const likeCount = comment.likes + ((likedComments[comment.id] ?? comment.liked) !== comment.liked ? (isLiked ? 1 : -1) : 0);
  const existingReplies = comment.replies || [];
  const addedReplies = localReplies[comment.id] || [];
  const allReplies = [...existingReplies, ...addedReplies];
  const isReplying = replyingTo === comment.id;
  const maxDepth = 2;

  return (
    <div className={depth > 0 ? "ml-5 pl-3 border-l-2 border-border/20" : ""}>
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-full bg-secondary/60 flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
          {comment.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-foreground">{comment.author}</span>
            <span className="text-[10px] text-muted-foreground">· {comment.time}</span>
          </div>
          <p className="text-xs text-foreground/80 mt-0.5 leading-relaxed">
            <RenderMentionText text={comment.text} />
          </p>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => toggleCommentLike(comment.id)}
              className={`flex items-center gap-1 text-[10px] transition-colors ${
                isLiked ? "text-red-400" : "text-muted-foreground hover:text-red-400"
              }`}
            >
              <Heart className={`w-3 h-3 ${isLiked ? "fill-current" : ""}`} /> {likeCount}
            </button>
            {depth < maxDepth && (
              <button
                onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                className={`flex items-center gap-1 text-[10px] transition-colors ${
                  isReplying ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Reply className="w-3 h-3" /> Reply
              </button>
            )}
          </div>

          {/* Inline reply input */}
          {isReplying && (
            <div className="flex items-center gap-2 mt-2">
              <CornerDownRight className="w-3 h-3 text-muted-foreground shrink-0" />
              <div className="flex-1 flex gap-1.5">
                <MentionInput
                  value={replyText}
                  onChange={setReplyText}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.defaultPrevented) onSubmitReply(comment.id);
                  }}
                  placeholder={`Reply to ${comment.author}...`}
                  className="h-7 text-xs bg-secondary/30 border-border/30"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 shrink-0 text-primary hover:text-primary"
                  onClick={() => onSubmitReply(comment.id)}
                  disabled={!replyText.trim()}
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {allReplies.length > 0 && (
        <div className="mt-2 space-y-2">
          {allReplies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              likedComments={likedComments}
              toggleCommentLike={toggleCommentLike}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              replyText={replyText}
              setReplyText={setReplyText}
              onSubmitReply={onSubmitReply}
              localReplies={localReplies}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function countAllComments(comments: Comment[], localReplies: Record<number, Comment[]>): number {
  let count = 0;
  for (const c of comments) {
    count += 1;
    const replies = [...(c.replies || []), ...(localReplies[c.id] || [])];
    if (replies.length > 0) count += countAllComments(replies, localReplies);
  }
  return count;
}

export default function CommunityPostCard({ post, categoryConfig: catCfg, localReactions, onToggleReaction }: Props) {
  const CatIcon = catCfg.icon;
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [localReplies, setLocalReplies] = useState<Record<number, Comment[]>>({});
  const [likedComments, setLikedComments] = useState<Record<number, boolean>>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const { addNotification } = useNotifications();
  const existingComments = mockComments[post.id] || [];
  const allComments = [...existingComments, ...localComments];
  const totalComments = countAllComments(allComments, localReplies);

  // Simulate a reply notification after user comments
  const simulateReplyNotification = useCallback((text: string) => {
    const responders = [
      { name: "Sarah C.", avatar: "SC" },
      { name: "James O.", avatar: "JO" },
      { name: "Aiko T.", avatar: "AT" },
    ];
    const responder = responders[Math.floor(Math.random() * responders.length)];
    const replies = [
      "That's a great point! 💪",
      "Totally agree with you on this.",
      "Thanks for sharing! This resonates with me.",
      "I needed to hear this today ❤️",
    ];
    setTimeout(() => {
      addNotification({
        type: "reply",
        postId: post.id,
        commentId: Date.now(),
        fromUser: responder.name,
        fromAvatar: responder.avatar,
        preview: replies[Math.floor(Math.random() * replies.length)],
      });
    }, 2000 + Math.random() * 3000);

    // Check for @mentions in the text and trigger mention notifications
    const mentions = text.match(/@(\w+)/g);
    if (mentions) {
      mentions.forEach((mention) => {
        const username = mention.slice(1);
        // Simulate notification as if the mentioned user saw it
        setTimeout(() => {
          addNotification({
            type: "mention",
            postId: post.id,
            commentId: Date.now(),
            fromUser: "System",
            fromAvatar: "📢",
            preview: `You mentioned @${username} in your comment`,
          });
        }, 1000);
      });
    }
  }, [addNotification, post.id]);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setLocalComments((prev) => [
      ...prev,
      { id: Date.now(), author: "You", avatar: "YO", text: commentText.trim(), time: "Just now", likes: 0, liked: false },
    ]);
    simulateReplyNotification(commentText.trim());
    setCommentText("");
    if (!showComments) setShowComments(true);
  };

  const handleSubmitReply = (parentId: number) => {
    if (!replyText.trim()) return;
    setLocalReplies((prev) => ({
      ...prev,
      [parentId]: [
        ...(prev[parentId] || []),
        { id: Date.now(), author: "You", avatar: "YO", text: replyText.trim(), time: "Just now", likes: 0, liked: false },
      ],
    }));
    simulateReplyNotification(replyText.trim());
    setReplyText("");
    setReplyingTo(null);
  };

  const toggleCommentLike = (commentId: number) => {
    setLikedComments((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  return (
    <Card className="bg-card/60 border-border/40 overflow-hidden">
      {/* Milestone banner */}
      {post.milestone && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">{post.milestone.label}</span>
          {post.milestone.days && (
            <Badge variant="outline" className="text-[9px] ml-auto bg-amber-500/10 text-amber-400 border-amber-500/30">
              <Flame className="w-3 h-3 mr-1" /> {post.milestone.days} days
            </Badge>
          )}
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
            {post.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-foreground">{post.author}</span>
              <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">
                {post.badge}
              </Badge>
              <Badge variant="outline" className={`text-[9px] border-border/30 ${catCfg.color}`}>
                <CatIcon className="w-3 h-3 mr-1" />
                {catCfg.label}
              </Badge>
              <span className="text-xs text-muted-foreground">· {post.time}</span>
            </div>

            <p className="text-sm text-foreground/90 mt-2 leading-relaxed">{post.text}</p>

            {/* Journal Snippet */}
            {post.journalSnippet && (
              <div className="mt-3 p-3 rounded-lg bg-sky-500/5 border border-sky-500/15">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] font-medium text-sky-400 uppercase tracking-wider">Journal Entry</span>
                </div>
                <p className="text-sm text-foreground/80 italic leading-relaxed">
                  {post.journalSnippet}
                </p>
              </div>
            )}

            {/* Emoji Reactions */}
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {post.reactions.map((r) => {
                const isReacted = localReactions[r.emoji] ?? r.reacted;
                const adjustedCount = r.count + ((localReactions[r.emoji] ?? r.reacted) !== r.reacted ? (isReacted ? 1 : -1) : 0);
                return (
                  <button
                    key={r.emoji}
                    onClick={() => onToggleReaction(r.emoji)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors border ${
                      isReacted
                        ? "bg-primary/10 border-primary/30 text-foreground"
                        : "bg-secondary/30 border-border/20 text-muted-foreground hover:border-primary/20"
                    }`}
                  >
                    <span>{r.emoji}</span>
                    <span className="font-medium">{adjustedCount}</span>
                  </button>
                );
              })}
              <button className="flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-secondary/20 border border-border/20 text-muted-foreground hover:border-primary/20 transition-colors">
                <Sparkles className="w-3 h-3" /> +
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-3">
              <button
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  post.liked ? "text-red-400" : "text-muted-foreground hover:text-red-400"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${post.liked ? "fill-current" : ""}`} /> {post.likes}
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className={`flex items-center gap-1.5 text-xs transition-colors ${
                  showComments ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> {totalComments}
                {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            {/* Comment Thread */}
            {showComments && (
              <div className="mt-4 space-y-3 border-t border-border/30 pt-4">
                {allComments.map((c) => (
                  <CommentItem
                    key={c.id}
                    comment={c}
                    depth={0}
                    likedComments={likedComments}
                    toggleCommentLike={toggleCommentLike}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    onSubmitReply={handleSubmitReply}
                    localReplies={localReplies}
                  />
                ))}

                {/* Add top-level Comment */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                    YO
                  </div>
                  <div className="flex-1 flex gap-2">
                    <MentionInput
                      value={commentText}
                      onChange={setCommentText}
                      onKeyDown={(e) => e.key === "Enter" && !e.defaultPrevented && handleAddComment()}
                      placeholder="Write a comment... Type @ to mention"
                      className="h-8 text-xs bg-secondary/30 border-border/30"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-primary hover:text-primary"
                      onClick={handleAddComment}
                      disabled={!commentText.trim()}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
