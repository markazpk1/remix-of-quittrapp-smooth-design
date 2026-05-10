import { LayoutDashboard, Users, FileText, Settings, ChevronLeft, LogOut, Blocks, BookOpen, MessageSquare, CreditCard, Bell, BarChart3, ScrollText, LifeBuoy, ShieldCheck, ImageIcon, Handshake, Sparkles } from "lucide-react";
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
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Roles & Permissions", url: "/admin/roles", icon: ShieldCheck },
  { title: "Services", url: "/admin/services", icon: Blocks },
  { title: "Lessons & Sounds", url: "/admin/lessons", icon: BookOpen },
  { title: "Daily Inspiration", url: "/admin/inspiration", icon: Sparkles },
  { title: "Community", url: "/admin/community", icon: MessageSquare },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Support Tickets", url: "/admin/support", icon: LifeBuoy },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Content", url: "/admin/content", icon: FileText },
  { title: "Media Library", url: "/admin/media", icon: ImageIcon },
  { title: "Reports", url: "/admin/reports", icon: BarChart3 },
  { title: "Affiliates", url: "/admin/affiliates", icon: Handshake },
  { title: "Audit Logs", url: "/admin/audit-logs", icon: ScrollText },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarContent>
        <div className="p-4">
          <a href="/" className="font-display text-lg font-bold text-foreground tracking-tight">
            {collapsed ? "Q" : <>Quittr<span className="text-primary">App</span></>}
          </a>
          {!collapsed && <div className="text-xs text-muted-foreground mt-0.5">Admin Panel</div>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin profile dropdown */}
        <div className="mt-auto border-t border-border/40">
          <div className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center text-sm font-bold text-red-400 shrink-0">
                    SC
                  </div>
                  {!collapsed && (
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">Sarah Chen</div>
                      <div className="text-[11px] text-muted-foreground truncate">Super Admin</div>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Sarah Chen</span>
                    <span className="text-xs text-muted-foreground">sarah@quittrapp.com</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
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
