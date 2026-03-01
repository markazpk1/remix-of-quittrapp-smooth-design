import { Zap, Target, BarChart3, Rocket } from "lucide-react";

const steps = [
  {
    icon: Zap,
    title: "Connect your tools",
    desc: "Integrate with 50+ apps in minutes. No code required — just plug and play.",
    color: "text-yellow-400",
  },
  {
    icon: Target,
    title: "Set your goals",
    desc: "Define KPIs and milestones for your team. AI suggests the best metrics for your stage.",
    color: "text-blue-400",
  },
  {
    icon: BarChart3,
    title: "Track progress",
    desc: "Real-time dashboards keep everyone aligned. Automated reports land in your inbox weekly.",
    color: "text-green-400",
  },
  {
    icon: Rocket,
    title: "Ship & iterate",
    desc: "Deploy with confidence. Built-in rollback, A/B testing, and performance monitoring.",
    color: "text-primary",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-scroll-in">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            How it <span className="text-gradient-purple">works</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Go from zero to production in four simple steps.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isEven = i % 2 === 0;
            return (
              <div
                key={step.title}
                className={`animate-scroll-in flex flex-col md:flex-row items-center gap-8 ${
                  isEven ? "" : "md:flex-row-reverse"
                }`}
              >
                <div className="flex-1 glass-card p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${step.color}`} />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">STEP {i + 1}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
                <div className="hidden md:flex w-12 items-center justify-center">
                  <div className="w-px h-full min-h-[80px] bg-gradient-to-b from-primary/0 via-primary/40 to-primary/0" />
                </div>
                <div className="flex-1" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
