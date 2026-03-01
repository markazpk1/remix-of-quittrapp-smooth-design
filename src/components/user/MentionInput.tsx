import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";

const communityUsers = [
  { username: "sarah_c", displayName: "Sarah C.", avatar: "SC" },
  { username: "marcus_r", displayName: "Marcus R.", avatar: "MR" },
  { username: "aiko_t", displayName: "Aiko T.", avatar: "AT" },
  { username: "james_o", displayName: "James O.", avatar: "JO" },
  { username: "emma_w", displayName: "Emma W.", avatar: "EW" },
  { username: "priya_k", displayName: "Priya K.", avatar: "PK" },
  { username: "david_l", displayName: "David L.", avatar: "DL" },
];

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

export function MentionInput({ value, onChange, onKeyDown, placeholder, className }: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(communityUsers);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const detectMention = useCallback((text: string, cursorPos: number) => {
    const before = text.slice(0, cursorPos);
    const match = before.match(/@(\w*)$/);
    if (match) {
      const query = match[1].toLowerCase();
      setMentionQuery(query);
      setMentionStart(match.index!);
      const filtered = communityUsers.filter(
        (u) => u.username.includes(query) || u.displayName.toLowerCase().includes(query)
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(0);
    } else {
      setShowSuggestions(false);
    }
  }, []);

  const insertMention = (username: string) => {
    const before = value.slice(0, mentionStart);
    const after = value.slice(mentionStart + mentionQuery.length + 1); // +1 for @
    const newValue = `${before}@${username} ${after}`;
    onChange(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    detectMention(newValue, e.target.selectionStart || newValue.length);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % suggestions.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        insertMention(suggestions[selectedIndex].username);
        return;
      }
      if (e.key === "Escape") {
        setShowSuggestions(false);
        return;
      }
    }
    onKeyDown?.(e);
  };

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 mb-1 w-full max-h-40 overflow-y-auto rounded-lg border border-border/60 bg-popover shadow-lg z-50"
        >
          {suggestions.map((user, i) => (
            <button
              key={user.username}
              onClick={() => insertMention(user.username)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                i === selectedIndex ? "bg-primary/10" : "hover:bg-secondary/40"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-secondary/60 flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0">
                {user.avatar}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-foreground truncate">{user.displayName}</div>
                <div className="text-[10px] text-muted-foreground">@{user.username}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Renders comment text with @mentions highlighted */
export function RenderMentionText({ text }: { text: string }) {
  const parts = text.split(/(@\w+)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("@") ? (
          <span key={i} className="text-primary font-medium cursor-pointer hover:underline">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
