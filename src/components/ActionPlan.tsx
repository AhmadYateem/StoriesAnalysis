import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { Zap, AlertCircle, Clock, TrendingUp, Compass, CheckCircle2 } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const timeline: { phase: string; timeframe: string; icon: LucideIcon; accentColor: string; iconColor: string; dotBg: string; items: { text: string; impact?: string }[] }[] = [
  {
    phase: "Immediate",
    timeframe: "This Week",
    icon: AlertCircle,
    accentColor: "bg-destructive",
    iconColor: "text-destructive",
    dotBg: "bg-destructive/10",
    items: [
      { text: "Fix Veggie Sub pricing", impact: "1.7M" },
      { text: "Audit Amioun POS configuration", impact: "49K" },
    ],
  },
  {
    phase: "Short-Term",
    timeframe: "This Month",
    icon: Clock,
    accentColor: "bg-accent",
    iconColor: "text-accent",
    dotBg: "bg-accent/10",
    items: [
      { text: "Charge for modifiers — decaf, lactose-free", impact: "28M" },
      { text: "Reprice all cheesecake products", impact: "2.1M" },
    ],
  },
  {
    phase: "Medium-Term",
    timeframe: "This Quarter",
    icon: TrendingUp,
    accentColor: "bg-success",
    iconColor: "text-success",
    dotBg: "bg-success/10",
    items: [
      { text: "Launch modifier suggestive selling training", impact: "16.9M" },
      { text: "Kill or reprice all 47 negative-margin products", impact: "30.1M" },
    ],
  },
  {
    phase: "Strategic",
    timeframe: "Next 6 Months",
    icon: Compass,
    accentColor: "bg-blue-500",
    iconColor: "text-blue-500",
    dotBg: "bg-blue-500/10",
    items: [
      { text: "Invest in growth-engine branches (Airport, Jbeil)" },
      { text: "Develop Ramadan programming strategy" },
      { text: "Set up new branch monitoring via dashboard" },
    ],
  },
];

export default function ActionPlan() {
  const { ref, isInView } = useInView(0.1);

  return (
    <section id="action-plan" className="py-24 md:py-32 bg-background relative overflow-hidden" ref={ref}>
      <div className="orb-glow orb-gold w-60 h-60 -bottom-30 -right-30" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="section-number">10 — Implementation</div>
          <span className="section-badge mb-4">
            <Zap className="w-4 h-4" />
            Implementation
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mt-5 tracking-tight">
            Action Plan Timeline
          </h2>
          <p className="section-subtitle">
            Concrete, prioritized steps to recover 62M in margin leaks — from quick fixes this week to strategic moves over 6 months.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent" />

          {timeline.map((phase, i) => {
            const Icon = phase.icon;
            return (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.15, type: "spring" }}
                className="relative pl-16 pb-10 last:pb-0"
              >
                {/* Timeline dot */}
                <div className={`absolute left-2.5 w-10 h-10 rounded-xl ${phase.dotBg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${phase.iconColor}`} />
                </div>

                <div className="card-3d">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-bold text-lg">{phase.phase}</h4>
                    <span className="text-xs font-semibold text-muted-foreground px-3 py-1 bg-secondary rounded-lg">{phase.timeframe}</span>
                  </div>
                  <ul className="space-y-3">
                    {phase.items.map((item) => (
                      <li key={item.text} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${phase.iconColor} opacity-60`} />
                        <span className="text-muted-foreground leading-relaxed flex-1">{item.text}</span>
                        {item.impact && (
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${phase.dotBg} ${phase.iconColor} shrink-0 tabular-nums`}>
                            {item.impact}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
