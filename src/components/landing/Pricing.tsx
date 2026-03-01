import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    period: "forever",
    desc: "Perfect for side projects and experiments.",
    features: ["Up to 3 projects", "1 team member", "Community support", "Basic analytics"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    desc: "For growing teams that need more power.",
    features: ["Unlimited projects", "Up to 10 members", "Priority support", "Advanced analytics", "Custom domains", "API access"],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "For organizations with advanced needs.",
    features: ["Everything in Pro", "Unlimited members", "SSO & SAML", "Dedicated support", "SLA guarantee", "Custom integrations"],
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section className="py-24" id="pricing">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-scroll-in">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Simple, transparent <span className="text-gradient-purple">pricing</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free. Scale when you're ready. No hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`animate-scroll-in rounded-xl p-6 border transition-all hover:-translate-y-1 ${
                plan.highlighted
                  ? "border-primary/50 bg-card purple-glow relative"
                  : "border-border/50 bg-card/60"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-purple text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{plan.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full ${
                  plan.highlighted
                    ? "bg-gradient-purple text-primary-foreground hover:opacity-90"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
