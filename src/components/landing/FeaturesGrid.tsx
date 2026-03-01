import { Shield, Zap, BarChart3, Users, Globe, Lock, GitBranch, Cpu } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  { icon: Zap, title: "Lightning Fast", desc: "Sub-100ms response times globally with edge computing.", span: "col-span-1", preview: "bars" },
  { icon: Shield, title: "Enterprise Security", desc: "SOC 2 compliant with end-to-end encryption and SSO.", span: "col-span-1", preview: "shield" },
  { icon: BarChart3, title: "Advanced Analytics", desc: "Real-time dashboards, custom reports, and AI-powered insights.", span: "sm:col-span-2", preview: "chart" },
  { icon: Users, title: "Team Collaboration", desc: "Real-time editing, comments, and shared workspaces.", span: "col-span-1", preview: "users" },
  { icon: Globe, title: "Global CDN", desc: "Deploy to 200+ edge locations worldwide.", span: "col-span-1", preview: "globe" },
  { icon: Lock, title: "Access Control", desc: "Granular role-based permissions and audit logs.", span: "col-span-1", preview: "lock" },
  { icon: GitBranch, title: "Git Integration", desc: "Native GitHub, GitLab, and Bitbucket integrations.", span: "col-span-1", preview: "git" },
  { icon: Cpu, title: "AI Assistant", desc: "Smart suggestions, auto-fixes, and predictive monitoring.", span: "sm:col-span-2", preview: "ai" },
];

function MiniPreview({ type }: { type: string }) {
  if (type === "chart") {
    return (
      <div className="flex items-end gap-1 h-10 mt-3">
        {[40, 65, 50, 80, 60, 90, 75, 95, 70, 85].map((h, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/50 to-primary/20"
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          />
        ))}
      </div>
    );
  }
  if (type === "bars") {
    return (
      <div className="flex gap-2 mt-3">
        {[85, 45, 70].map((w, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full bg-primary/30"
            initial={{ width: 0 }}
            whileInView={{ width: `${w}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}
      </div>
    );
  }
  if (type === "users") {
    return (
      <div className="flex -space-x-1.5 mt-3">
        {["A", "B", "C", "D", "+3"].map((l, i) => (
          <motion.div
            key={i}
            className="w-6 h-6 rounded-full bg-secondary border border-border/30 flex items-center justify-center text-[9px] text-muted-foreground font-medium"
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            {l}
          </motion.div>
        ))}
      </div>
    );
  }
  if (type === "ai") {
    return (
      <div className="mt-3 space-y-1.5">
        {["Analyzing codebase...", "Found 3 optimizations", "Auto-fix applied ✓"].map((t, i) => (
          <motion.div
            key={i}
            className="text-[10px] text-muted-foreground bg-secondary/40 rounded px-2 py-1 w-fit"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
          >
            {t}
          </motion.div>
        ))}
      </div>
    );
  }
  if (type === "globe") {
    return (
      <div className="mt-3 flex items-center gap-2">
        {["🇺🇸", "🇪🇺", "🇯🇵", "🇧🇷", "🇮🇳"].map((flag, i) => (
          <motion.span
            key={i}
            className="text-sm"
            initial={{ opacity: 0, y: 5 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            {flag}
          </motion.span>
        ))}
        <span className="text-[10px] text-muted-foreground ml-1">200+ regions</span>
      </div>
    );
  }
  return null;
}

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function FeaturesGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const headerY = useTransform(scrollYProgress, [0, 1], [60, -30]);
  const gridY = useTransform(scrollYProgress, [0, 1], [80, -20]);

  return (
    <section ref={sectionRef} className="py-24 overflow-hidden" id="features">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          style={{ y: headerY }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Everything you need to <span className="text-gradient-purple">scale</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Powerful features built for modern teams.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
          style={{ y: gridY }}
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((f, index) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={itemVariants}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className={`glass-card p-6 hover:border-primary/30 transition-colors group cursor-default ${f.span}`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                <MiniPreview type={f.preview} />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
