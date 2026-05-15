import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import {
  Sparkles,
  Bot,
  Cpu,
  Shield,
  Key,
  Save,
  RefreshCw,
  Zap,
  Globe,
  Settings2
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export default function AdminAiSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    agent_name: "Quittr Guardian",
    provider: "openai",
    model_name: "gpt-4o",
    system_prompt: "",
    api_key: "",
    is_active: true,
    temperature: 0.7,
    max_tokens: 2048
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getAiSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load AI settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.updateAiSettings(settings);
      if (res.success) {
        toast({ title: "Success", description: "AI Configuration saved successfully" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Agentic AI Settings</h1>
          <p className="text-sm text-muted-foreground">Configure your recovery assistant and LLM integration.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
          {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* General Configuration */}
          <Card className="bg-card/40 border-border/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                General Configuration
              </CardTitle>
              <CardDescription>Basic personality and provider settings for the agent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Agent Name</Label>
                  <Input 
                    value={settings.agent_name} 
                    onChange={(e) => setSettings({...settings, agent_name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <Select value={settings.provider} onValueChange={(val) => setSettings({...settings, provider: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI (Recommended)</SelectItem>
                      <SelectItem value="google">Google Gemini</SelectItem>
                      <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>System Prompt (Personality & Rules)</Label>
                <Textarea 
                  className="min-h-[200px] bg-background/50"
                  placeholder="You are an expert recovery coach..."
                  value={settings.system_prompt}
                  onChange={(e) => setSettings({...settings, system_prompt: e.target.value})}
                />
                <p className="text-[10px] text-muted-foreground italic">
                  This prompt defines how the AI interacts with the admin and helps generate content.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Model Parameters */}
          <Card className="bg-card/40 border-border/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                Model Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Temperature ({settings.temperature})</Label>
                  <span className="text-[10px] text-muted-foreground">Creativity vs Precision</span>
                </div>
                <Slider 
                  value={[settings.temperature]} 
                  max={1} 
                  step={0.1} 
                  onValueChange={(val) => setSettings({...settings, temperature: val[0]})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Model Name</Label>
                  <Input 
                    value={settings.model_name} 
                    onChange={(e) => setSettings({...settings, model_name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <Input 
                    type="number"
                    value={settings.max_tokens} 
                    onChange={(e) => setSettings({...settings, max_tokens: parseInt(e.target.value)})} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* API Secrets */}
          <Card className="bg-card/40 border-border/40 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-500" />
                API Secrets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">API Key</Label>
                <div className="relative">
                  <Input 
                    type="password"
                    placeholder="sk-..."
                    className="bg-background/50 pr-10"
                    value={settings.api_key}
                    onChange={(e) => setSettings({...settings, api_key: e.target.value})}
                  />
                  <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2">
                  <Switch checked={settings.is_active} onCheckedChange={(val) => setSettings({...settings, is_active: val})} />
                  <span className="text-xs font-medium">Agent Active</span>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-0">
                  Ready
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <CardContent className="p-4 space-y-3">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Powering Recovery
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The Agentic AI helps the admin by finding Islamic motivational content, generating recovery blueprints, and suggesting curriculum updates based on user progress.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="p-2 bg-background/40 rounded border border-border/20">
                  <p className="text-[9px] text-muted-foreground uppercase">Model</p>
                  <p className="text-xs font-bold">{settings.model_name}</p>
                </div>
                <div className="p-2 bg-background/40 rounded border border-border/20">
                  <p className="text-[9px] text-muted-foreground uppercase">Latency</p>
                  <p className="text-xs font-bold">~1.2s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
