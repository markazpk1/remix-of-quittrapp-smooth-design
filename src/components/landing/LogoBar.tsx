const logos = ["Vercel", "Stripe", "Notion", "Figma", "Slack", "Linear", "Supabase", "GitHub"];

export default function LogoBar() {
  return (
    <section className="py-12 border-y border-border/30 overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <p className="text-center text-sm text-muted-foreground uppercase tracking-widest">
          Trusted by teams at
        </p>
      </div>
      <div className="relative">
        <div className="flex marquee whitespace-nowrap">
          {[...logos, ...logos].map((name, i) => (
            <div key={i} className="inline-flex items-center mx-10 text-muted-foreground/50 text-xl font-display font-bold select-none">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
