import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { DollarSign, TrendingUp, BarChart3, Store, ShoppingCart, Coffee, Rocket, AlertTriangle, Trophy, ArrowDownCircle } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const kpis: { icon: LucideIcon; label: string; value: number; subtext: string; format: string; isAlert?: boolean }[] = [
  { icon: DollarSign, label: "Total Revenue", value: 840458583, subtext: "Full Year 2025", format: "currency" },
  { icon: TrendingUp, label: "Total Profit", value: 598228696, subtext: "71.2% margin", format: "currency" },
  { icon: BarChart3, label: "Avg Profit Margin", value: 71.2, subtext: "Chain-wide weighted", format: "percent" },
  { icon: Store, label: "Active Branches", value: 25, subtext: "Across Lebanon", format: "number" },
  { icon: ShoppingCart, label: "Total Items Sold", value: 6539335, subtext: "2025 volume", format: "number" },
  { icon: Coffee, label: "Unique Products", value: 551, subtext: "Beverages + Food", format: "number" },
  { icon: Rocket, label: "2026 Forecast", value: 1056960141, subtext: "+26% YoY growth", format: "currency" },
  { icon: AlertTriangle, label: "Margin Leaks Found", value: 62013109, subtext: "Recoverable profit", format: "currency", isAlert: true },
];

const topBranches = [
  { rank: 1, name: "Ain El Mreisseh", revenue: "119.6M" },
  { rank: 2, name: "Zalka", revenue: "108.0M" },
  { rank: 3, name: "Khaldeh", revenue: "84.2M" },
  { rank: 4, name: "Ramlet El Bayda", revenue: "56.1M" },
  { rank: 5, name: "Saida", revenue: "55.0M" },
];

const bottomBranches = [
  { rank: 21, name: "Unknown (Closed)", revenue: "13.9M" },
  { rank: 22, name: "Faqra", revenue: "11.0M" },
  { rank: 23, name: "Raouche", revenue: "9.1M" },
  { rank: 24, name: "Kaslik", revenue: "5.6M" },
  { rank: 25, name: "Event Starco", revenue: "0.6M" },
];

function formatValue(value: number, format: string) {
  if (format === "percent") return `${value}%`;
  if (format === "currency") {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    return value.toLocaleString();
  }
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  return value.toLocaleString();
}

function KPICard({ kpi, index, inView }: { kpi: typeof kpis[0]; index: number; inView: boolean }) {
  const animatedValue = useCountUp(kpi.value, 2000, 0, inView);
  const Icon = kpi.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, type: "spring", stiffness: 100 }}
      className={`card-3d gradient-border-glow cursor-default ${kpi.isAlert ? "!border-destructive/30 pulse-glow-red" : ""}`}
      style={kpi.isAlert ? { background: "linear-gradient(135deg, rgba(255,60,60,0.03), rgba(255,60,60,0.06))" } : undefined}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${kpi.isAlert ? "bg-destructive/10" : "bg-accent/10"}`}>
        <Icon className={`w-5 h-5 ${kpi.isAlert ? "text-destructive" : "text-accent"}`} strokeWidth={2} />
      </div>
      <div className={`mega-number text-3xl md:text-4xl mb-2 ${kpi.isAlert ? "text-destructive" : "text-foreground"}`}>
        {formatValue(animatedValue, kpi.format)}
      </div>
      <div className="text-sm font-bold text-foreground mb-1 tracking-tight">{kpi.label}</div>
      <div className="text-xs text-muted-foreground">{kpi.subtext}</div>
    </motion.div>
  );
}

export default function ExecutiveSnapshot() {
  const { ref, isInView } = useInView(0.1);

  return (
    <section id="executive" className="section-warm py-24 md:py-32 relative overflow-hidden" ref={ref}>
      {/* Decorative orbs */}
      <div className="orb-glow orb-gold w-80 h-80 -top-40 -right-40" />
      <div className="orb-glow orb-amber w-60 h-60 bottom-0 -left-30" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="section-number">01 — Overview</div>
          <span className="section-badge mb-4">
            <BarChart3 className="w-4 h-4" />
            Executive Summary
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mt-5 tracking-tight">
            The One-Slide Overview
          </h2>
          <p className="section-subtitle">
            Chain-wide KPIs from 25 branches, 300+ products, and a full year of POS data — distilled into the metrics that matter.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-14">
          {kpis.map((kpi, i) => (
            <KPICard key={kpi.label} kpi={kpi} index={i} inView={isInView} />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
            className="card-3d"
          >
            <h3 className="text-lg font-display font-bold mb-2 flex items-center gap-3">
              <Trophy className="w-5 h-5 text-accent" />
              Top 5 Branches by Revenue
            </h3>
            <p className="text-xs text-muted-foreground mb-5">Highest annual revenue — 2025</p>
            <div className="flex items-center gap-3 text-[10px] font-bold tracking-wider uppercase text-muted-foreground/50 mb-3 px-11">
              <span className="flex-1">Branch</span>
              <span>Revenue</span>
            </div>
            <div className="space-y-2.5">
              {topBranches.map((b) => (
                <div key={b.rank} className="flex items-center gap-3 group p-1.5 -mx-1.5 rounded-xl hover:bg-accent/[0.03] transition-colors">
                  <span className="w-8 h-8 rounded-lg bg-accent/10 text-accent text-xs font-bold flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-300">
                    {b.rank}
                  </span>
                  <span className="flex-1 text-sm font-semibold">{b.name}</span>
                  <span className="text-sm font-bold text-foreground tabular-nums">{b.revenue}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6, type: "spring" }}
            className="card-3d"
          >
            <h3 className="text-lg font-display font-bold mb-2 flex items-center gap-3">
              <ArrowDownCircle className="w-5 h-5 text-destructive" />
              Bottom 5 Branches by Revenue
            </h3>
            <p className="text-xs text-muted-foreground mb-5">Lowest annual revenue — candidates for optimization</p>
            <div className="flex items-center gap-3 text-[10px] font-bold tracking-wider uppercase text-muted-foreground/50 mb-3 px-11">
              <span className="flex-1">Branch</span>
              <span>Revenue</span>
            </div>
            <div className="space-y-2.5">
              {bottomBranches.map((b) => (
                <div key={b.rank} className="flex items-center gap-3 group p-1.5 -mx-1.5 rounded-xl hover:bg-destructive/[0.03] transition-colors">
                  <span className="w-8 h-8 rounded-lg bg-destructive/8 text-destructive text-xs font-bold flex items-center justify-center">
                    {b.rank}
                  </span>
                  <span className="flex-1 text-sm font-medium text-muted-foreground">{b.name}</span>
                  <span className="text-sm font-medium text-muted-foreground tabular-nums">{b.revenue}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
