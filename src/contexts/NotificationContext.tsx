import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

export interface CommunityNotification {
  id: string;
  type: "reply" | "mention";
  postId: number;
  commentId: number;
  fromUser: string;
  fromAvatar: string;
  preview: string;
  time: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: CommunityNotification[];
  unreadCount: number;
  addNotification: (notif: Omit<CommunityNotification, "id" | "time" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const STORAGE_KEY = "quittr_community_notifications";

const NotificationContext = createContext<NotificationContextType | null>(null);

function loadNotifications(): CommunityNotification[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveNotifications(notifs: CommunityNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<CommunityNotification[]>(loadNotifications);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notif: Omit<CommunityNotification, "id" | "time" | "read">) => {
      const newNotif: CommunityNotification = {
        ...notif,
        id: crypto.randomUUID(),
        time: "Just now",
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // Fire a toast notification globally
      toast({
        title: notif.type === "reply"
          ? `💬 ${notif.fromUser} replied`
          : `@️ ${notif.fromUser} mentioned you`,
        description: notif.preview,
        duration: 5000,
      });
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
