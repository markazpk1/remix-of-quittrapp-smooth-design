import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Play, Sparkles, TrendingUp, Bell, CheckCircle2, Activity, Users, DollarSign, Layers } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const scaleIn = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const chartData = [35, 52, 45, 68, 58, 78, 65, 88, 72, 92, 85, 98];
const activityItems = [
  { icon: CheckCircle2, text: "Deploy #384 successful", time: "2m ago", color: "text-green-400" },
  { icon: Users, text: "12 new signups today", time: "15m ago", color: "text-blue-400" },
  { icon: TrendingUp, text: "Revenue up 23%", time: "1h ago", color: "text-primary" },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Parallax layers at different speeds
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const glow2Y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const dashboardY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const floatingCard1Y = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const floatingCard2Y = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  return (
    <section ref={sectionRef} className="relative pt-32 pb-20 overflow-hidden">
      {/* Background glows — parallax */}
      <motion.div
        style={{ y: glowY, scale: glowScale }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px] animate-pulse-glow pointer-events-none"
      />
      <motion.div
        style={{ y: glow2Y }}
        className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px] pointer-events-none"
      />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — text parallax */}
          <motion.div style={{ y: textY }}>
            <motion.div {...fadeUp(0)}>
              <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5 text-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Trusted by 10,000+ users
              </Badge>
            </motion.div>

            <motion.h1 {...fadeUp(0.1)} className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Build faster.{" "}
              <span className="text-gradient-purple">Launch smarter.</span>
            </motion.h1>

            <motion.p {...fadeUp(0.2)} className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
              The all-in-one platform that helps teams ship products 10x faster with AI-powered workflows, real-time collaboration, and seamless integrations.
            </motion.p>

            <motion.div {...fadeUp(0.3)} className="flex flex-wrap gap-4">
              <a href="/register">
                <Button size="lg" className="bg-gradient-purple text-primary-foreground purple-glow-sm hover:opacity-90 transition-all text-base px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <a href="/login">
                <Button size="lg" variant="outline" className="border-border/60 text-foreground hover:bg-secondary text-base px-8">
                  <Play className="mr-2 w-4 h-4" />
                  Log In
                </Button>
              </a>
            </motion.div>

            <motion.div {...fadeUp(0.4)} className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {["S", "A", "M", "J", "L"].map((letter, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs text-muted-foreground font-medium"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="text-foreground font-semibold">4.9★</span> from 2,000+ reviews
              </div>
            </motion.div>
          </motion.div>

          {/* Right — dashboard mockup with parallax */}
          <motion.div {...scaleIn(0.3)} style={{ y: dashboardY }} className="relative hidden lg:block">
            <div className="relative purple-glow rounded-2xl overflow-hidden border border-border/30">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 text-center">
                    <div className="inline-block bg-secondary/60 rounded-md px-16 py-1 text-xs text-muted-foreground">
                      app.launchkit.io/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard content */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Welcome back</div>
                      <div className="text-sm font-semibold text-foreground font-display">Dashboard Overview</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary/60 flex items-center justify-center">
                        <Bell className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        JD
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Revenue", value: "$48,259", icon: DollarSign, change: "+12.5%", up: true },
                      { label: "Active Users", value: "12,847", icon: Users, change: "+8.2%", up: true },
                      { label: "Deployments", value: "1,284", icon: Layers, change: "+23.1%", up: true },
                    ].map((m) => (
                      <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + Math.random() * 0.3, duration: 0.5 }}
                        className="bg-secondary/30 rounded-xl p-3 border border-border/20"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <m.icon className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[10px] text-green-400 font-medium">{m.change}</span>
                        </div>
                        <div className="text-lg font-bold text-foreground font-display">{m.value}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{m.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-secondary/20 rounded-xl p-4 border border-border/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-primary" />
                        Performance
                      </div>
                      <div className="text-[10px] text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-md">Last 12 months</div>
                    </div>
                    <div className="flex items-end gap-1.5 h-24">
                      {chartData.map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t-sm bg-gradient-to-t from-primary/60 to-primary/30"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 0.8 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {activityItems.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.15, duration: 0.4 }}
                        className="flex items-center gap-3 bg-secondary/20 rounded-lg px-3 py-2 border border-border/10"
                      >
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-xs text-foreground flex-1">{item.text}</span>
                        <span className="text-[10px] text-muted-foreground">{item.time}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating notification card — faster parallax */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              style={{ y: floatingCard1Y }}
              className="absolute -right-4 top-16 glass-card p-3 shadow-lg animate-float"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground">Build passed</div>
                  <div className="text-[10px] text-muted-foreground">All 142 tests ✓</div>
                </div>
              </div>
            </motion.div>

            {/* Floating metric card — even faster parallax */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.7, duration: 0.6 }}
              style={{ y: floatingCard2Y }}
              className="absolute -left-6 bottom-20 glass-card p-3 shadow-lg animate-float"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-medium text-foreground">MRR Growth</div>
                  <div className="text-[10px] text-green-400 font-semibold">+47% this month</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
