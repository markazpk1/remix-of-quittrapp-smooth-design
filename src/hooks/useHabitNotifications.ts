import { useEffect, useCallback, useRef } from "react";
import { format } from "date-fns";

const STORAGE_KEY_HABITS = "quittr_habits";
const STORAGE_KEY_LOG = "quittr_habit_log";
const STORAGE_KEY_GOALS = "quittr_habit_goals";
const NOTIF_PERMISSION_KEY = "quittr_notif_permission";
const LAST_NOTIF_KEY = "quittr_last_habit_notif";

interface Habit {
  id: string;
  label: string;
  icon: string;
}

function getIncompleteHabits(): { incomplete: Habit[]; total: number } {
  try {
    const habits: Habit[] = JSON.parse(localStorage.getItem(STORAGE_KEY_HABITS) || "[]");
    const log = JSON.parse(localStorage.getItem(STORAGE_KEY_LOG) || "{}");
    const today = format(new Date(), "yyyy-MM-dd");
    const done: string[] = log[today] || [];
    const incomplete = habits.filter(h => !done.includes(h.id));
    return { incomplete, total: habits.length };
  } catch {
    return { incomplete: [], total: 0 };
  }
}

function shouldNotifyToday(): boolean {
  const last = localStorage.getItem(LAST_NOTIF_KEY);
  const today = format(new Date(), "yyyy-MM-dd");
  return last !== today;
}

function markNotified() {
  localStorage.setItem(LAST_NOTIF_KEY, format(new Date(), "yyyy-MM-dd"));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") {
    localStorage.setItem(NOTIF_PERMISSION_KEY, "granted");
    return true;
  }
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  localStorage.setItem(NOTIF_PERMISSION_KEY, result);
  return result === "granted";
}

export function isNotificationEnabled(): boolean {
  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
}

function sendHabitReminder(incomplete: Habit[]) {
  if (incomplete.length === 0) return;
  const names = incomplete.slice(0, 3).map(h => `${h.icon} ${h.label}`).join(", ");
  const extra = incomplete.length > 3 ? ` and ${incomplete.length - 3} more` : "";
  new Notification("Habit Reminder 💪", {
    body: `You still have ${incomplete.length} habit${incomplete.length > 1 ? "s" : ""} left today: ${names}${extra}`,
    icon: "/favicon.ico",
    tag: "habit-reminder",
  });
  markNotified();
}

/**
 * Hook that checks for incomplete habits and sends a browser notification
 * reminder once per day, in the evening (after 6 PM) or after a configurable delay.
 */
export function useHabitNotifications(enabled = true) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkAndNotify = useCallback(() => {
    if (!enabled || !isNotificationEnabled()) return;
    if (!shouldNotifyToday()) return;

    const hour = new Date().getHours();
    // Only remind in the evening (18:00+) to give users time to complete habits
    if (hour < 18) return;

    const { incomplete } = getIncompleteHabits();
    if (incomplete.length > 0) {
      sendHabitReminder(incomplete);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Check immediately
    checkAndNotify();

    // Then check every 30 minutes
    timerRef.current = setInterval(checkAndNotify, 30 * 60 * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [enabled, checkAndNotify]);
}
