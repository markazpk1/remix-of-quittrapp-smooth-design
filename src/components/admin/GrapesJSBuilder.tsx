import { useEffect, useRef, useState } from "react";
import grapesjs from "grapesjs";
import "grapesjs/dist/css/grapes.min.css";
import grapesjsPresetWebpage from "grapesjs-preset-webpage";
import { Button } from "@/components/ui/button";
import { Save, Undo2, Redo2, Monitor, Smartphone, Tablet, Code, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GrapesJSBuilderProps {
  initialHtml?: string;
  initialCss?: string;
  onSave?: (html: string, css: string) => Promise<void>;
}

export default function GrapesJSBuilder({ initialHtml, initialCss, onSave }: GrapesJSBuilderProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<any>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!editorRef.current || editorInstance.current) return;

    const defaultHtml = initialHtml || `
      <section style="padding:80px 20px;text-align:center;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);color:#fff;">
        <div style="max-width:800px;margin:0 auto;">
          <span style="display:inline-block;background:rgba(139,92,246,0.2);border:1px solid rgba(139,92,246,0.3);color:#a78bfa;padding:6px 16px;border-radius:20px;font-size:13px;margin-bottom:24px;">✨ Trusted by 10,000+ users</span>
          <h1 style="font-size:48px;font-weight:800;margin-bottom:20px;line-height:1.1;">Welcome to <span style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">The Momin Core</span></h1>
          <p style="font-size:18px;color:#94a3b8;max-width:600px;margin:0 auto 32px;line-height:1.6;">Your halal-first productivity platform. Break free, build discipline, and reclaim your best self.</p>
          <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
            <a href="/register" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;">Start Free Trial →</a>
            <a href="/login" style="background:transparent;border:1px solid rgba(255,255,255,0.2);color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px;">▶ Log In</a>
          </div>
        </div>
      </section>
      <section style="padding:60px 20px;background:#0f172a;text-align:center;">
        <div style="display:flex;justify-content:center;gap:80px;flex-wrap:wrap;max-width:800px;margin:0 auto;">
          <div><div style="font-size:42px;font-weight:800;color:#fff;">10,000<span style="color:#8b5cf6;">+</span></div><div style="font-size:14px;color:#64748b;">Active Users</div></div>
          <div><div style="font-size:42px;font-weight:800;color:#fff;">99.9<span style="color:#8b5cf6;">%</span></div><div style="font-size:14px;color:#64748b;">Uptime SLA</div></div>
          <div><div style="font-size:42px;font-weight:800;color:#fff;">4.9<span style="color:#8b5cf6;">★</span></div><div style="font-size:14px;color:#64748b;">Average Rating</div></div>
        </div>
      </section>
      <section style="padding:80px 20px;background:#1e1b4b;text-align:center;">
        <h2 style="font-size:36px;font-weight:700;color:#fff;margin-bottom:12px;">How it <span style="color:#8b5cf6;">works</span></h2>
        <p style="color:#94a3b8;margin-bottom:48px;font-size:16px;">Go from zero to production in four simple steps.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px;max-width:1000px;margin:0 auto;">
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;text-align:left;">
            <div style="font-size:11px;color:#64748b;margin-bottom:8px;">STEP 1</div>
            <h3 style="color:#fff;font-size:18px;margin-bottom:8px;">Connect your tools</h3>
            <p style="color:#94a3b8;font-size:14px;">Integrate with 50+ apps in minutes. No code required.</p>
          </div>
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;text-align:left;">
            <div style="font-size:11px;color:#64748b;margin-bottom:8px;">STEP 2</div>
            <h3 style="color:#fff;font-size:18px;margin-bottom:8px;">Set your goals</h3>
            <p style="color:#94a3b8;font-size:14px;">Define KPIs and milestones for your journey.</p>
          </div>
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;text-align:left;">
            <div style="font-size:11px;color:#64748b;margin-bottom:8px;">STEP 3</div>
            <h3 style="color:#fff;font-size:18px;margin-bottom:8px;">Track progress</h3>
            <p style="color:#94a3b8;font-size:14px;">Real-time dashboards keep you aligned with your goals.</p>
          </div>
        </div>
      </section>
      <section style="padding:80px 20px;background:#0f172a;text-align:center;">
        <h2 style="font-size:36px;font-weight:700;color:#fff;margin-bottom:12px;">Pricing <span style="color:#8b5cf6;">Plans</span></h2>
        <p style="color:#94a3b8;margin-bottom:48px;">Choose the plan that works for you.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px;max-width:900px;margin:0 auto;">
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;">
            <h3 style="color:#fff;font-size:20px;margin-bottom:8px;">Free</h3>
            <div style="font-size:36px;font-weight:800;color:#fff;margin-bottom:16px;">$0<span style="font-size:14px;color:#64748b;">/mo</span></div>
            <p style="color:#94a3b8;font-size:14px;">Basic tracking and community access.</p>
          </div>
          <div style="background:rgba(139,92,246,0.1);border:2px solid #8b5cf6;border-radius:16px;padding:40px;position:relative;">
            <span style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#8b5cf6;color:#fff;padding:4px 16px;border-radius:20px;font-size:12px;">Popular</span>
            <h3 style="color:#fff;font-size:20px;margin-bottom:8px;">Pro</h3>
            <div style="font-size:36px;font-weight:800;color:#fff;margin-bottom:16px;">$9<span style="font-size:14px;color:#64748b;">/mo</span></div>
            <p style="color:#94a3b8;font-size:14px;">Advanced analytics and accountability partner.</p>
          </div>
        </div>
      </section>
      <section style="padding:80px 20px;background:linear-gradient(135deg,#1a1a2e,#0f3460);text-align:center;">
        <h2 style="font-size:36px;font-weight:700;color:#fff;margin-bottom:16px;">Ready to start your journey?</h2>
        <p style="color:#94a3b8;margin-bottom:32px;font-size:16px;">Join thousands who have transformed their lives.</p>
        <a href="/register" style="display:inline-block;background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:#fff;padding:16px 40px;border-radius:12px;text-decoration:none;font-weight:700;font-size:17px;">Get Started Free →</a>
      </section>
    `;

    const editor = grapesjs.init({
      container: editorRef.current!,
      height: "calc(100vh - 180px)",
      width: "auto",
      fromElement: false,
      components: defaultHtml,
      style: initialCss || "",
      storageManager: false,
      plugins: [grapesjsPresetWebpage],
      pluginsOpts: {
        [grapesjsPresetWebpage as any]: {
          blocksBasicOpts: { flexGrid: true },
          countdownOpts: false,
          formsOpts: false,
        },
      },
      canvas: {
        styles: [
          "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap",
        ],
      },
      deviceManager: {
        devices: [
          { name: "Desktop", width: "" },
          { name: "Tablet", width: "768px", widthMedia: "992px" },
          { name: "Mobile", width: "375px", widthMedia: "480px" },
        ],
      },
      panels: { defaults: [] },
    });

    // Custom theme overrides for dark mode
    const style = document.createElement("style");
    style.innerHTML = `
      .gjs-one-bg { background-color: #0f172a !important; }
      .gjs-two-color { color: #e2e8f0 !important; }
      .gjs-three-bg { background-color: #1e293b !important; }
      .gjs-four-color, .gjs-four-color-h:hover { color: #8b5cf6 !important; }
      .gjs-cv-canvas { background-color: #1a1a2e !important; }
      .gjs-pn-panel { background-color: #0f172a !important; border-color: #1e293b !important; }
      .gjs-block { background-color: #1e293b !important; color: #e2e8f0 !important; border: 1px solid #334155 !important; border-radius: 8px !important; }
      .gjs-block:hover { border-color: #8b5cf6 !important; }
      .gjs-category-title, .gjs-layer-title, .gjs-sm-sector-title { background-color: #1e293b !important; color: #e2e8f0 !important; border-color: #334155 !important; }
      .gjs-clm-tags .gjs-sm-property { background-color: #0f172a !important; }
      .gjs-field { background-color: #1e293b !important; color: #e2e8f0 !important; border-color: #334155 !important; }
      .gjs-field input, .gjs-field select, .gjs-field textarea { color: #e2e8f0 !important; }
      .gjs-sm-sector .gjs-sm-property .gjs-sm-label { color: #94a3b8 !important; }
      .gjs-trt-trait { color: #e2e8f0 !important; }
      .gjs-pn-btn { color: #94a3b8 !important; }
      .gjs-pn-btn.gjs-pn-active { color: #8b5cf6 !important; }
      .gjs-am-assets-cont { background-color: #0f172a !important; }
      .gjs-mdl-dialog { background-color: #1e293b !important; }
      .gjs-mdl-header { background-color: #0f172a !important; color: #e2e8f0 !important; }
      .gjs-rte-toolbar { background-color: #1e293b !important; }
      .gjs-toolbar { background-color: #8b5cf6 !important; }
      .gjs-resizer-h { border-color: #8b5cf6 !important; }
      .gjs-highlighter { outline-color: #8b5cf6 !important; }
      .gjs-badge { background-color: #8b5cf6 !important; }
      #gjs { border: none !important; }
    `;
    document.head.appendChild(style);

    editorInstance.current = editor;

    return () => {
      editor.destroy();
      editorInstance.current = null;
      style.remove();
    };
  }, []);

  const handleSave = async () => {
    if (!editorInstance.current || !onSave) return;
    setSaving(true);
    try {
      const html = editorInstance.current.getHtml();
      const css = editorInstance.current.getCss();
      await onSave(html, css);
      toast({ title: "Saved!", description: "Landing page saved successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to save.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const setDevice = (name: string) => editorInstance.current?.setDevice(name);
  const undo = () => editorInstance.current?.UndoManager.undo();
  const redo = () => editorInstance.current?.UndoManager.redo();
  const togglePreview = () => {
    const editor = editorInstance.current;
    if (!editor) return;
    editor.runCommand(editor.Commands.has("preview") ? "preview" : "core:preview");
  };

  return (
    <div className="rounded-xl border border-border/40 overflow-hidden bg-[#0f172a]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f172a] border-b border-[#1e293b]">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10" onClick={undo} title="Undo">
            <Undo2 size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10" onClick={redo} title="Redo">
            <Redo2 size={16} />
          </Button>
          <div className="w-px h-5 bg-[#334155] mx-2" />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => setDevice("Desktop")} title="Desktop">
            <Monitor size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => setDevice("Tablet")} title="Tablet">
            <Tablet size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10" onClick={() => setDevice("Mobile")} title="Mobile">
            <Smartphone size={16} />
          </Button>
          <div className="w-px h-5 bg-[#334155] mx-2" />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10" onClick={togglePreview} title="Preview">
            <Eye size={16} />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">GrapesJS Builder</span>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white h-8 px-4 text-xs font-semibold">
            <Save size={14} className="mr-1.5" />
            {saving ? "Saving..." : "Save Page"}
          </Button>
        </div>
      </div>

      {/* GrapesJS Editor */}
      <div id="gjs" ref={editorRef} />
    </div>
  );
}
