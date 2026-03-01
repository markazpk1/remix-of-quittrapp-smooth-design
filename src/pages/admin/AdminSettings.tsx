import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { Copy, Eye, EyeOff, Key, Globe, Mail, Palette, Shield, Bell, Database, RefreshCw, Upload, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ApiKey { name: string; key: string; created: string; lastUsed: string; status: string; }
interface Integration { name: string; description: string; connected: boolean; icon: string; }

const initialApiKeys: ApiKey[] = [
  { name: "Production API Key", key: "pk_live_****************************3x9f", created: "2026-01-15", lastUsed: "2 min ago", status: "active" },
  { name: "Stripe Webhook Secret", key: "whsec_****************************h4kl", created: "2026-01-15", lastUsed: "5 min ago", status: "active" },
  { name: "Test API Key", key: "pk_test_****************************m2wq", created: "2026-02-01", lastUsed: "3 days ago", status: "active" },
  { name: "Legacy Key (v1)", key: "sk_old_****************************p8nj", created: "2025-06-10", lastUsed: "Never", status: "revoked" },
];

const initialIntegrations: Integration[] = [
  { name: "Stripe", description: "Payment processing", connected: true, icon: "💳" },
  { name: "SendGrid", description: "Email delivery", connected: true, icon: "📧" },
  { name: "Firebase", description: "Push notifications", connected: true, icon: "🔔" },
  { name: "Google Analytics", description: "Website analytics", connected: false, icon: "📊" },
  { name: "Slack", description: "Team alerts", connected: false, icon: "💬" },
  { name: "Intercom", description: "Live chat", connected: false, icon: "🎧" },
];

const initialToggles = [
  { label: "Maintenance Mode", desc: "Show maintenance page", value: false },
  { label: "User Registration", desc: "Allow new signups", value: true },
  { label: "Email Notifications", desc: "Send email alerts", value: true },
  { label: "Analytics Tracking", desc: "Collect usage data", value: true },
  { label: "Community Posts", desc: "Allow community posting", value: true },
  { label: "AI Companion", desc: "Enable AI chat support", value: true },
];

const initialSecurity = [
  { label: "Two-Factor Authentication", desc: "Require 2FA for admins", value: true },
  { label: "Session Timeout", desc: "Auto-logout after 30 min", value: true },
  { label: "IP Whitelisting", desc: "Restrict admin IPs", value: false },
  { label: "Login Rate Limiting", desc: "Block after 5 failed attempts", value: true },
  { label: "Audit Log Retention", desc: "Keep logs for 90 days", value: true },
  { label: "Data Encryption", desc: "Encrypt sensitive data at rest", value: true },
];

const emailTemplates = [
  { name: "Welcome Email", subject: "Welcome to QuittrApp! 🎉", lastEdited: "2026-02-20", status: "active" },
  { name: "Password Reset", subject: "Reset your password", lastEdited: "2026-02-15", status: "active" },
  { name: "Streak Milestone", subject: "🔥 You hit {{days}} days!", lastEdited: "2026-02-10", status: "active" },
  { name: "Subscription Confirmation", subject: "Your Pro plan is active", lastEdited: "2026-01-28", status: "active" },
  { name: "Relapse Support", subject: "We're here for you", lastEdited: "2026-01-20", status: "draft" },
  { name: "Weekly Digest", subject: "Your weekly progress report", lastEdited: "2026-01-15", status: "active" },
];

export default function AdminSettings() {
  const [showKey, setShowKey] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [toggles, setToggles] = useState(initialToggles);
  const [security, setSecurity] = useState(initialSecurity);
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void; variant?: "destructive" | "warning" }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const toggleFeature = (index: number) => {
    setToggles((prev) => prev.map((t, i) => i === index ? { ...t, value: !t.value } : t));
    toast({ title: "Feature Updated", description: `${toggles[index].label} has been ${!toggles[index].value ? "enabled" : "disabled"}.` });
  };

  const toggleSecurity = (index: number) => {
    setSecurity((prev) => prev.map((s, i) => i === index ? { ...s, value: !s.value } : s));
    toast({ title: "Security Setting Updated" });
  };

  const toggleIntegration = (name: string) => {
    setIntegrations((prev) => prev.map((i) => i.name === name ? { ...i, connected: !i.connected } : i));
    const integ = integrations.find((i) => i.name === name);
    toast({ title: !integ?.connected ? "Connected" : "Disconnected", description: `${name} has been ${!integ?.connected ? "connected" : "disconnected"}.` });
  };

  const rotateKey = (name: string) => {
    setConfirm({
      open: true, title: `Rotate "${name}"?`, description: "This will invalidate the current key and generate a new one. Any services using the old key will stop working.", variant: "warning",
      onConfirm: () => {
        setApiKeys((prev) => prev.map((k) => k.name === name ? { ...k, key: `pk_new_${"*".repeat(28)}${Math.random().toString(36).slice(-4)}`, lastUsed: "Just now" } : k));
        toast({ title: "Key Rotated", description: `${name} has been regenerated.` });
      },
    });
  };

  const revokeKey = (name: string) => {
    setConfirm({
      open: true, title: `Revoke "${name}"?`, description: "This will permanently revoke the API key. Any services using this key will immediately lose access.",
      onConfirm: () => {
        setApiKeys((prev) => prev.map((k) => k.name === name ? { ...k, status: "revoked" } : k));
        toast({ title: "Key Revoked", description: `${name} has been revoked.` });
      },
    });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: "Copied to Clipboard" });
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} variant={confirm.variant} confirmLabel="Yes, continue" />

      <div><h1 className="font-display text-2xl font-bold text-foreground">Settings</h1><p className="text-sm text-muted-foreground">Configure your platform, integrations, and security.</p></div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-secondary/40 border border-border/30 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="general" className="text-xs"><Globe className="w-3 h-3 mr-1.5" /> General</TabsTrigger>
          <TabsTrigger value="branding" className="text-xs"><Palette className="w-3 h-3 mr-1.5" /> Branding</TabsTrigger>
          <TabsTrigger value="emails" className="text-xs"><Mail className="w-3 h-3 mr-1.5" /> Email Templates</TabsTrigger>
          <TabsTrigger value="integrations" className="text-xs"><Database className="w-3 h-3 mr-1.5" /> Integrations</TabsTrigger>
          <TabsTrigger value="api" className="text-xs"><Key className="w-3 h-3 mr-1.5" /> API Keys</TabsTrigger>
          <TabsTrigger value="security" className="text-xs"><Shield className="w-3 h-3 mr-1.5" /> Security</TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general" className="space-y-4">
          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm font-medium text-foreground">Platform Settings</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              <div className="space-y-2"><Label>Site Name</Label><Input defaultValue="QuittrApp" className="bg-secondary/40 border-border/30" /></div>
              <div className="space-y-2"><Label>Support Email</Label><Input defaultValue="support@quittrapp.com" className="bg-secondary/40 border-border/30" /></div>
              <div className="space-y-2"><Label>Site URL</Label><Input defaultValue="https://quittrapp.com" className="bg-secondary/40 border-border/30" /></div>
              <div className="space-y-2"><Label>Default Timezone</Label>
                <Select defaultValue="utc"><SelectTrigger className="bg-secondary/40 border-border/30"><SelectValue /></SelectTrigger><SelectContent className="bg-card border-border/40"><SelectItem value="utc">UTC</SelectItem><SelectItem value="est">Eastern</SelectItem><SelectItem value="pst">Pacific</SelectItem></SelectContent></Select>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm font-medium text-foreground">Feature Toggles</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              {toggles.map((f, i) => (
                <div key={f.label} className="flex items-center justify-between">
                  <div><div className="text-sm text-foreground font-medium">{f.label}</div><div className="text-xs text-muted-foreground">{f.desc}</div></div>
                  <Switch checked={f.value} onCheckedChange={() => toggleFeature(i)} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/40 border-red-500/20">
            <CardHeader><CardTitle className="text-sm font-medium text-red-400">Danger Zone</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between">
                <div><div className="text-sm text-foreground font-medium">Delete All Data</div><div className="text-xs text-muted-foreground">Permanently remove all data</div></div>
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setConfirm({ open: true, title: "Delete all data?", description: "This will permanently delete ALL platform data including users, content, and settings. This cannot be undone.", onConfirm: () => toast({ title: "Action Blocked", description: "This action requires confirmation via email." }) })}>Delete</Button>
              </div>
              <div className="flex items-center justify-between">
                <div><div className="text-sm text-foreground font-medium">Reset to Defaults</div><div className="text-xs text-muted-foreground">Restore all settings</div></div>
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => setConfirm({ open: true, title: "Reset all settings?", description: "This will restore all platform settings to their default values.", variant: "warning", onConfirm: () => toast({ title: "Settings Reset", description: "All settings have been restored to defaults." }) })}>Reset</Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => toast({ title: "Settings Saved", description: "Platform settings have been updated." })}>Save Changes</Button>
          </div>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="space-y-4">
          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm font-medium text-foreground">Brand Assets</CardTitle></CardHeader>
            <CardContent className="space-y-6 max-w-xl">
              <div className="space-y-2"><Label>App Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">Q</div>
                  <div><Button variant="outline" size="sm" className="border-border/30 text-xs" onClick={() => toast({ title: "Upload Logo", description: "File picker would open here." })}><Upload className="w-3 h-3 mr-1.5" /> Upload Logo</Button><div className="text-[10px] text-muted-foreground mt-1">512×512 PNG recommended</div></div>
                </div>
              </div>
              <div className="space-y-2"><Label>Brand Color</Label>
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-primary border-2 border-border/40" /><Input defaultValue="#7C3AED" className="bg-secondary/40 border-border/30 w-32" /></div>
              </div>
              <div className="space-y-2"><Label>App Description</Label><Textarea defaultValue="Break free from addiction with science-backed tools." rows={3} className="bg-secondary/40 border-border/30" /></div>
            </CardContent>
          </Card>
          <div className="flex justify-end"><Button onClick={() => toast({ title: "Branding Saved" })}>Save Branding</Button></div>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="emails" className="space-y-4">
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-foreground">Email Templates</CardTitle>
              <Button variant="outline" size="sm" className="border-border/30 text-xs" onClick={() => toast({ title: "Template Editor", description: "Template editor would open here." })}><Mail className="w-3 h-3 mr-1.5" /> New Template</Button></div>
            </CardHeader>
            <CardContent className="space-y-2">
              {emailTemplates.map((t) => (
                <div key={t.name} className="flex items-center justify-between py-3 px-3 rounded-lg bg-secondary/20 border border-border/20">
                  <div className="flex-1 min-w-0"><div className="text-sm text-foreground font-medium">{t.name}</div><div className="text-xs text-muted-foreground mt-0.5">Subject: {t.subject}</div></div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`text-[10px] ${t.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>{t.status}</Badge>
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => toast({ title: "Edit Template", description: `Editing ${t.name}.` })}>Edit</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm font-medium text-foreground">SMTP Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>SMTP Host</Label><Input defaultValue="smtp.sendgrid.net" className="bg-secondary/40 border-border/30" /></div>
                <div className="space-y-2"><Label>Port</Label><Input defaultValue="587" className="bg-secondary/40 border-border/30" /></div>
              </div>
              <div className="space-y-2"><Label>From Email</Label><Input defaultValue="noreply@quittrapp.com" className="bg-secondary/40 border-border/30" /></div>
              <Button variant="outline" size="sm" className="border-border/30 text-xs" onClick={() => toast({ title: "Test Email Sent", description: "Check your inbox." })}><Mail className="w-3 h-3 mr-1.5" /> Send Test Email</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((int) => (
              <Card key={int.name} className="bg-card/60 border-border/40">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/60 flex items-center justify-center text-lg">{int.icon}</div>
                      <div><div className="text-sm font-semibold text-foreground">{int.name}</div><div className="text-xs text-muted-foreground">{int.description}</div></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] ${int.connected ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-secondary text-muted-foreground border-border/30"}`}>{int.connected ? "Connected" : "Not Connected"}</Badge>
                    <Button variant={int.connected ? "outline" : "default"} size="sm" className="text-xs" onClick={() => toggleIntegration(int.name)}>{int.connected ? "Disconnect" : "Connect"}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api" className="space-y-4">
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between"><CardTitle className="text-sm font-medium text-foreground">API Keys</CardTitle>
              <Button size="sm" className="text-xs" onClick={() => { setApiKeys((prev) => [{ name: `New Key ${prev.length + 1}`, key: `pk_gen_${"*".repeat(28)}${Math.random().toString(36).slice(-4)}`, created: new Date().toISOString().split("T")[0], lastUsed: "Never", status: "active" }, ...prev]); toast({ title: "API Key Generated" }); }}><Key className="w-3 h-3 mr-1.5" /> Generate Key</Button></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {apiKeys.map((k) => (
                <div key={k.name} className="flex items-center justify-between py-3 px-3 rounded-lg bg-secondary/20 border border-border/20">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground font-medium">{k.name}</span>
                      <Badge variant="outline" className={`text-[9px] ${k.status === "active" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>{k.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs text-muted-foreground font-mono">{showKey === k.name ? k.key.replace(/\*/g, "a") : k.key}</code>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowKey(showKey === k.name ? null : k.name)}>{showKey === k.name ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}</Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyKey(k.key)}><Copy className="w-3 h-3" /></Button>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1">Created: {k.created} · Last used: {k.lastUsed}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => rotateKey(k.name)}><RefreshCw className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => revokeKey(k.name)} disabled={k.status === "revoked"}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm font-medium text-foreground">Authentication & Security</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              {security.map((f, i) => (
                <div key={f.label} className="flex items-center justify-between">
                  <div><div className="text-sm text-foreground font-medium">{f.label}</div><div className="text-xs text-muted-foreground">{f.desc}</div></div>
                  <Switch checked={f.value} onCheckedChange={() => toggleSecurity(i)} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm font-medium text-foreground">Password Policy</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              <div className="space-y-2"><Label>Minimum Password Length</Label><Input type="number" defaultValue="8" className="bg-secondary/40 border-border/30 w-24" /></div>
              <Button onClick={() => toast({ title: "Security Settings Saved" })}>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
