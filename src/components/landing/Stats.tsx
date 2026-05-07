import { useCounter } from "@/hooks/useCounter";

const stats = [
  { value: 10000, suffix: "+", label: "Active Users", prefix: "" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", prefix: "" },
  { value: 4.9, suffix: "★", label: "Average Rating", prefix: "" },
];

function StatItem({ value, suffix, label, isDecimal }: { value: number; suffix: string; label: string; isDecimal?: boolean }) {
  const { count, ref } = useCounter(isDecimal ? value * 10 : value, 2000);
  const display = isDecimal ? (count / 10).toFixed(1) : count.toLocaleString();

  return (
    <div ref={ref} className="text-center animate-scroll-in">
      <div className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-2">
        {display}
        <span className="text-primary">{suffix}</span>
      </div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </div>
  );
}

export default function Stats({ title }: { title?: string }) {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {title && <h2 className="text-3xl font-bold text-center mb-12 font-display">{title}</h2>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 max-w-3xl mx-auto">
          {stats.map((s) => (
            <StatItem key={s.label} {...s} isDecimal={s.value % 1 !== 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
