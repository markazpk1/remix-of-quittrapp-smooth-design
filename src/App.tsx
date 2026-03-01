import { ThemeProvider } from "@/components/ThemeProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminServices from "./pages/admin/AdminServices";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminCommunity from "./pages/admin/AdminCommunity";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminReports from "./pages/admin/AdminReports";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSupportTickets from "./pages/admin/AdminSupportTickets";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminAffiliates from "./pages/admin/AdminAffiliates";
import UserLayout from "./components/user/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import UserProgress from "./pages/user/UserProgress";
import UserLessons from "./pages/user/UserLessons";
import UserSounds from "./pages/user/UserSounds";
import UserAICompanion from "./pages/user/UserAICompanion";
import UserPanic from "./pages/user/UserPanic";
import UserCommunity from "./pages/user/UserCommunity";
import UserSubscription from "./pages/user/UserSubscription";
import UserProfile from "./pages/user/UserProfile";
import UserSettings from "./pages/user/UserSettings";
import UserVoiceTherapy from "./pages/user/UserVoiceTherapy";
import UserJournal from "./pages/user/UserJournal";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="quittr-theme">
    <NotificationProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="lessons" element={<AdminLessons />} />
              <Route path="community" element={<AdminCommunity />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="audit-logs" element={<AdminAuditLogs />} />
              <Route path="support" element={<AdminSupportTickets />} />
              <Route path="roles" element={<AdminRoles />} />
              <Route path="affiliates" element={<AdminAffiliates />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="/app" element={<UserLayout />}>
              <Route index element={<UserDashboard />} />
              <Route path="progress" element={<UserProgress />} />
              <Route path="lessons" element={<UserLessons />} />
              <Route path="sounds" element={<UserSounds />} />
              <Route path="voice-therapy" element={<UserVoiceTherapy />} />
              <Route path="journal" element={<UserJournal />} />
              <Route path="ai-companion" element={<UserAICompanion />} />
              <Route path="panic" element={<UserPanic />} />
              <Route path="community" element={<UserCommunity />} />
              <Route path="subscription" element={<UserSubscription />} />
              <Route path="profile" element={<UserProfile />} />
              <Route path="settings" element={<UserSettings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
    </NotificationProvider>
  </ThemeProvider>
);

export default App;
