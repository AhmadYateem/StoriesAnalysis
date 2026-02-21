import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlertTriangle, Leaf, Gift, TrendingDown, CakeSlice, Monitor, ChevronDown } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const waterfallData = [
  { name: "Negative Margin Products", value: -30.1, color: "hsl(0 80% 55%)" },
  { name: "Zero-Revenue Modifiers", value: -28.1, color: "hsl(0 80% 55%)" },
  { name: "Cheesecake Low Margins", value: -2.1, color: "hsl(25 80% 42%)" },
  { name: "Veggie Sub Mispricing", value: -1.7, color: "hsl(25 80% 42%)" },
  { name: "Amioun TABLE POS Error", value: -0.049, color: "hsl(38 95% 50%)" },
];

const leakCards: { icon: LucideIcon; title: string; amount: string; detail: string; severity: string }[] = [
  {
    icon: TrendingDown,
    title: "Negative Margin Products",
    amount: "30.1M",
    detail: "1,197 products sold below cost across all branches — highest loss category. Fix: reprice or discontinue immediately.",
    severity: "critical",
  },
  {
    icon: Gift,
    title: "Free Modifiers Bleeding Cash",
    amount: "28.1M",
    detail: "Decaf, lactose-free milk, extra shots given away free — 28.1M in absorbed costs annually. Fix: charge 5-10K per modifier.",
    severity: "critical",
  },
  {
    icon: CakeSlice,
    title: "Cheesecake Underpricing",
    amount: "2.1M",
    detail: "34.4% margin vs 63% food average — a 28.7pt gap across 20,068 units. Fix: raise prices 15-20% to align with category.",
    severity: "warning",
  },
  {
    icon: Leaf,
    title: "Veggie Sub Crisis",
    amount: "1.7M",
    detail: "31,840 units sold at ~7/unit vs cost of ~60/unit. Every sale destroys profit. Fix: reprice to benchmark (~376/unit).",
    severity: "critical",
  },
  {
    icon: Monitor,
    title: "Amioun POS Error",
    amount: "49K",
    detail: 'Systematic TABLE service undercharging at Amioun branch. Fix: audit POS configuration and correct pricing.',
    severity: "info",
  },
];

function LeakCard({ card, index, inView }: { card: typeof leakCards[0]; index: number; inView: boolean }) {
  const [open, setOpen] = useState(false);
  const Icon = card.icon;

  const borderColor = card.severity === "critical" ? "border-destructive/25" : card.severity === "warning" ? "border-accent/30" : "border-border";
  const iconBg = card.severity === "critical" ? "bg-destructive/8" : card.severity === "warning" ? "bg-accent/8" : "bg-muted/50";
  const iconColor = card.severity === "critical" ? "text-destructive" : card.severity === "warning" ? "text-accent" : "text-muted-foreground";
  const amountColor = card.severity === "critical" ? "text-destructive" : card.severity === "warning" ? "text-accent" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.6 + index * 0.1, type: "spring" }}
      className={`card-3d overflow-hidden cursor-pointer ${borderColor}`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-sm truncate">{card.title}</div>
          <div className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${iconColor} opacity-70`}>
            {card.severity === "critical" ? "Critical" : card.severity === "warning" ? "Warning" : "Info"}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`font-display font-bold text-lg tabular-nums ${amountColor}`}>
            {card.amount}
          </div>
          <div className="text-[10px] text-muted-foreground font-medium">annual impact</div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} className="shrink-0">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 text-sm text-muted-foreground leading-relaxed border-t border-border/50">
              {card.detail}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MarginLeakReport() {
  const { ref, isInView } = useInView(0.1);
  const counter = useCountUp(62013109, 2500, 0, isInView);

  return (
    <section id="margin-leaks" className="section-red py-24 md:py-32 relative overflow-hidden" ref={ref}>
      <div className="orb-glow orb-rose w-96 h-96 top-10 -left-48" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="section-number">03 — Margin Leaks</div>
          <span className="section-badge mb-4 !bg-destructive/8 !text-destructive !border-destructive/15">
            <AlertTriangle className="w-4 h-4" />
            The 62M Report
          </span>
          <div className="mt-8 mega-number text-6xl md:text-8xl lg:text-9xl text-destructive pulse-glow-red inline-block px-8 py-4 rounded-2xl">
            {counter.toLocaleString()}
          </div>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed">
            in annual profit leaks identified — fixable with zero additional investment
          </p>
          <div className="section-divider mt-8" style={{ background: "linear-gradient(90deg, hsl(0 80% 55%), hsl(25 80% 42%))" }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
          className="card-3d mb-10"
        >
          <h3 className="text-base font-display font-bold mb-1">Margin Leak Waterfall</h3>
          <p className="text-xs text-muted-foreground mb-5">Five identified profit leak categories sorted by impact (values in millions)</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={waterfallData} layout="vertical">
              <XAxis type="number" fontSize={12} tick={{ fill: "hsl(20 12% 42%)" }} tickFormatter={(v) => `${v}M`} />
              <YAxis type="category" dataKey="name" fontSize={11} width={140} tick={{ fill: "hsl(20 12% 42%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid hsl(30 15% 88%)", borderRadius: "12px", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                formatter={(v: number) => [`${v}M`, "Impact"]}
              />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {waterfallData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground text-center mb-1 italic">Click each card to see details and recommended fixes</p>
          {leakCards.map((card, i) => (
            <LeakCard key={card.title} card={card} index={i} inView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
