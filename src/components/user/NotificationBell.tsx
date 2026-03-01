import { useState, useRef, useEffect } from "react";
import { Bell, Reply, AtSign, Check, Trash2 } from "lucide-react";
import { useNotifications, type CommunityNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-secondary/40 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto rounded-xl border border-border/60 bg-popover shadow-xl z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground" onClick={markAllAsRead}>
                  <Check className="w-3 h-3 mr-1" /> Read all
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-[10px] text-muted-foreground" onClick={() => { clearAll(); setOpen(false); }}>
                  <Trash2 className="w-3 h-3 mr-1" /> Clear
                </Button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-border/20">
              {notifications.slice(0, 20).map((n) => (
                <NotificationRow key={n.id} notification={n} onRead={() => markAsRead(n.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ notification: n, onRead }: { notification: CommunityNotification; onRead: () => void }) {
  return (
    <button
      onClick={onRead}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/30 ${
        !n.read ? "bg-primary/5" : ""
      }`}
    >
      <div className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
        {n.fromAvatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {n.type === "reply" ? (
            <Reply className="w-3 h-3 text-primary shrink-0" />
          ) : (
            <AtSign className="w-3 h-3 text-primary shrink-0" />
          )}
          <span className="text-xs font-medium text-foreground truncate">{n.fromUser}</span>
          <span className="text-[10px] text-muted-foreground shrink-0">{n.time}</span>
          {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
          {n.type === "reply" ? "replied to your comment: " : "mentioned you: "}
          {n.preview}
        </p>
      </div>
    </button>
  );
}
