import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Settings, Bell, Shield, Palette, Globe, Volume2, Moon, Sun } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function UserSettings() {
  const [loading, setLoading] = useState(true);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    dailyReminders: true,
    streakReminders: true,
  });
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showStreaks: true,
    anonymousPosting: false,
  });
  const [preferences, setPreferences] = useState({
    theme: "dark",
    language: "english",
    timezone: "UTC",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await api.getUserSettings(token);
      if (response.error) {
        toast.error('Failed to load settings');
        return;
      }
      
      setSettingsData(response);
      setNotifications(response.notifications || {});
      setPrivacy(response.privacy || {});
      setPreferences(response.preferences || {});
    } catch (error) {
      console.error('Settings data error:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      
      const response = await api.updateUserSettings(token, {
        notifications,
        privacy,
        preferences,
      });
      
      if (response.error) {
        toast.error('Failed to save settings');
        return;
      }
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your app experience.</p>
      </div>

      <Card className="bg-card/60 border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Email Notifications</div>
              <div className="text-xs text-muted-foreground">Receive updates via email</div>
            </div>
            <Switch checked={notifications.email} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Push Notifications</div>
              <div className="text-xs text-muted-foreground">Get push notifications on your device</div>
            </div>
            <Switch checked={notifications.push} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Daily Reminders</div>
              <div className="text-xs text-muted-foreground">Daily check-in reminders</div>
            </div>
            <Switch checked={notifications.dailyReminders} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dailyReminders: checked }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Streak Reminders</div>
              <div className="text-xs text-muted-foreground">Remind to maintain your streak</div>
            </div>
            <Switch checked={notifications.streakReminders} onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, streakReminders: checked }))} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Profile Visible</div>
              <div className="text-xs text-muted-foreground">Show your profile to other users</div>
            </div>
            <Switch checked={privacy.profileVisible} onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, profileVisible: checked }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Show Streaks</div>
              <div className="text-xs text-muted-foreground">Display your streak publicly</div>
            </div>
            <Switch checked={privacy.showStreaks} onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showStreaks: checked }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Anonymous Posting</div>
              <div className="text-xs text-muted-foreground">Post anonymously by default</div>
            </div>
            <Switch checked={privacy.anonymousPosting} onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, anonymousPosting: checked }))} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Theme</div>
              <div className="text-xs text-muted-foreground">Choose your preferred theme</div>
            </div>
            <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
              <SelectTrigger className="w-32 bg-secondary/40 border-border/30 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/40">
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="light">Light</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Language</div>
              <div className="text-xs text-muted-foreground">Select your language</div>
            </div>
            <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
              <SelectTrigger className="w-32 bg-secondary/40 border-border/30 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/40">
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="arabic">Arabic</SelectItem>
                <SelectItem value="urdu">Urdu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Timezone</div>
              <div className="text-xs text-muted-foreground">Set your timezone</div>
            </div>
            <Select value={preferences.timezone} onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}>
              <SelectTrigger className="w-32 bg-secondary/40 border-border/30 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/40">
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="EST">EST</SelectItem>
                <SelectItem value="PST">PST</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" className="border-border/30 text-sm">Reset to Defaults</Button>
        <Button className="bg-primary text-primary-foreground text-sm" onClick={saveSettings}>Save Changes</Button>
      </div>
    </div>
  );
}
