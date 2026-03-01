import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UserSettings() {
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
          {[
            { label: "Daily Reminders", desc: "Get a daily check-in notification", default: true },
            { label: "Milestone Alerts", desc: "Celebrate when you hit a milestone", default: true },
            { label: "Community Replies", desc: "When someone replies to your post", default: true },
            { label: "Motivational Quotes", desc: "Random inspiration throughout the day", default: false },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between">
              <div>
                <div className="text-sm text-foreground font-medium">{n.label}</div>
                <div className="text-xs text-muted-foreground">{n.desc}</div>
              </div>
              <Switch defaultChecked={n.default} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Daily Check-in Time</div>
              <div className="text-xs text-muted-foreground">When should we remind you?</div>
            </div>
            <Select defaultValue="morning">
              <SelectTrigger className="w-32 bg-secondary/40 border-border/30 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border/40">
                <SelectItem value="morning">Morning (9 AM)</SelectItem>
                <SelectItem value="afternoon">Afternoon (2 PM)</SelectItem>
                <SelectItem value="evening">Evening (8 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Community Visibility</div>
              <div className="text-xs text-muted-foreground">Show your profile to other members</div>
            </div>
            <Switch defaultChecked={true} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Sound Autoplay</div>
              <div className="text-xs text-muted-foreground">Auto-play next track in therapy session</div>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground">Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm text-foreground">Change Password</Label>
            <Input type="password" placeholder="Current password" className="bg-secondary/40 border-border/30" />
            <Input type="password" placeholder="New password" className="bg-secondary/40 border-border/30" />
          </div>
          <Button variant="outline" className="border-border/30 text-sm">Update Password</Button>
        </CardContent>
      </Card>

      <Card className="bg-card/60 border-border/40 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-foreground font-medium">Delete Account</div>
              <div className="text-xs text-muted-foreground">Permanently remove your account and all data</div>
            </div>
            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm">Delete</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
