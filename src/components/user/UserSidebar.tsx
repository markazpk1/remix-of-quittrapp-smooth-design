import { LayoutDashboard, BookOpen, Music, MessageSquare, CreditCard, Trophy, Settings, ChevronLeft, User, Heart, Brain, LogOut, Mic, PenLine, Bell } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const items = [
  { title: "Dashboard", url: "/app", icon: LayoutDashboard },
  { title: "My Progress", url: "/app/progress", icon: Trophy },
  { title: "Lessons", url: "/app/lessons", icon: BookOpen },
  { title: "Sound Therapy", url: "/app/sounds", icon: Music },
  { title: "Voice Therapy", url: "/app/voice-therapy", icon: Mic },
  { title: "Journal", url: "/app/journal", icon: PenLine },
  { title: "AI Companion", url: "/app/ai-companion", icon: Brain },
  { title: "Panic Button", url: "/app/panic", icon: Heart },
  { title: "Community", url: "/app/community", icon: MessageSquare },
  { title: "Subscription", url: "/app/subscription", icon: CreditCard },
  { title: "Profile", url: "/app/profile", icon: User },
  { title: "Settings", url: "/app/settings", icon: Settings },
];

export function UserSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarContent>
        <div className="p-4">
          <a href="/" className="font-display text-lg font-bold text-foreground tracking-tight">
            {collapsed ? "Q" : <>Quittr<span className="text-primary">App</span></>}
          </a>
          {!collapsed && <div className="text-xs text-muted-foreground mt-0.5">Your Journey</div>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/app"}
                      className="hover:bg-muted/50 relative"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title === "Community" && unreadCount > 0 && (
                        <span className="absolute top-1 left-4 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold px-0.5">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto border-t border-border/40">
          <div className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                    JD
                  </div>
                  {!collapsed && (
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">John Doe</div>
                      <div className="text-[11px] text-muted-foreground truncate">john@example.com</div>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">John Doe</span>
                    <span className="text-xs text-muted-foreground">john@example.com</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/app/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/login")} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
