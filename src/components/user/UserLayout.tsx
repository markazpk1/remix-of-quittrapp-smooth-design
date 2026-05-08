import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user/UserSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/user/NotificationBell";
import { Outlet } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

export default function UserLayout() {
  const { user } = useAuth();
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";
  const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <UserSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border/40 px-4 shrink-0">
            <div className="flex items-center">
              <SidebarTrigger className="mr-4" />
              <div className="text-sm font-medium text-muted-foreground">My Dashboard</div>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <ThemeToggle />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{initials}</div>
                <span className="text-sm text-foreground hidden md:inline">{fullName}</span>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
