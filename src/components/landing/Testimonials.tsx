import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Product Manager",
    quote: "LaunchKit completely transformed how our team ships features. We went from monthly to weekly releases.",
    stars: 5,
  },
  {
    name: "Emily Zhang",
    role: "Frontend Engineer",
    quote: "The best developer experience I've ever had. Setup took 5 minutes and everything just works.",
    stars: 5,
  },
  {
    name: "David Park",
    role: "Startup Founder",
    quote: "We replaced 4 different tools with LaunchKit. Saved us $2,000/month and countless hours.",
    stars: 5,
  },
  {
    name: "Maria Santos",
    role: "Engineering Lead",
    quote: "The AI-powered insights alone are worth the subscription. It catches issues before they become problems.",
    stars: 5,
  },
  {
    name: "Ryan Kim",
    role: "DevOps Engineer",
    quote: "Deployment confidence went from 60% to 99%. The rollback feature is a lifesaver.",
    stars: 5,
  },
  {
    name: "Lisa Chen",
    role: "CTO",
    quote: "Our team productivity increased by 3x after switching to LaunchKit. It's not even close.",
    stars: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 overflow-hidden" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-scroll-in">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            What people are <span className="text-gradient-purple">saying</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Don't just take our word for it.
          </p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="glass-card p-6 min-w-[300px] max-w-[340px] flex-shrink-0 snap-center hover:border-primary/30 transition-colors"
          >
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: t.stars }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              ))}
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed mb-4">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
                {t.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
