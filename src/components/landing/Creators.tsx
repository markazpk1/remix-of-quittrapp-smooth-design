import { Twitter } from "lucide-react";

const creators = [
  { name: "Sarah Chen", handle: "@sarahchen", role: "CEO, TechFlow" },
  { name: "Marcus Rivera", handle: "@marcusdev", role: "CTO, BuildFast" },
  { name: "Aiko Tanaka", handle: "@aikocodes", role: "Founder, NexGen" },
  { name: "James O'Brien", handle: "@jamesobrien", role: "VP Eng, ScaleUp" },
  { name: "Priya Sharma", handle: "@priyabuilds", role: "Lead Dev, Moonshot" },
  { name: "Leo Martinez", handle: "@leomartz", role: "Co-founder, Rapid" },
];

export default function Creators({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-scroll-in">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            {title || (
              <>
                Loved by <span className="text-gradient-purple">builders</span>
              </>
            )}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {subtitle || "Join thousands of creators and engineering leaders who trust LaunchKit."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {creators.map((c) => (
            <div key={c.name} className="animate-scroll-in glass-card p-5 hover:border-primary/30 transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-foreground">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.role}</div>
                </div>
                <Twitter className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{c.handle}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
