import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Line, ReferenceDot } from "recharts";
import { TrendingUp, ArrowUpRight, Target } from "lucide-react";

const forecastData = [
  { month: "Jan", actual: 73.6, forecast: 62.5, low: 52.0, high: 73.0 },
  { month: "Feb", actual: 67.5, forecast: 68.4, low: 58.0, high: 78.8 },
  { month: "Mar", actual: 75.4, forecast: 74.1, low: 63.7, high: 84.5 },
  { month: "Apr", actual: 108.7, forecast: 97.2, low: 86.8, high: 107.6 },
  { month: "May", actual: 44.5, forecast: 83.3, low: 72.9, high: 93.7 },
  { month: "Jun", actual: 18.4, forecast: 62.3, low: 51.9, high: 72.7 },
  { month: "Jul", actual: 89.6, forecast: 110.4, low: 100.0, high: 120.8 },
  { month: "Aug", actual: 109.4, forecast: 123.9, low: 113.5, high: 134.3 },
  { month: "Sep", actual: 91.8, forecast: 101.1, low: 90.7, high: 111.5 },
  { month: "Oct", actual: 96.6, forecast: 104.7, low: 94.3, high: 115.1 },
  { month: "Nov", actual: 86.7, forecast: 98.2, low: 87.8, high: 108.6 },
  { month: "Dec", actual: 85.7, forecast: 97.9, low: 87.5, high: 108.3 },
];

const topForecast = [
  { branch: "Ain El Mreisseh", projected: "86.8M", growth: "-27%" },
  { branch: "Sin El Fil", projected: "84.5M", growth: "+310%" },
  { branch: "Zalka", projected: "80.1M", growth: "-26%" },
  { branch: "Amioun", projected: "75.2M", growth: "+285%" },
  { branch: "Khaldeh", projected: "72.8M", growth: "-14%" },
];

export default function ForecastSection() {
  const { ref, isInView } = useInView(0.1);
  const actual = useCountUp(840, 2000, 0, isInView);
  const projected = useCountUp(1057, 2000, 0, isInView);

  return (
    <section id="forecast" className="py-24 md:py-32 bg-background relative overflow-hidden" ref={ref}>
      <div className="orb-glow orb-gold w-64 h-64 top-20 -left-32" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="section-number">06 — Forecast</div>
          <span className="section-badge mb-4">
            <Target className="w-4 h-4" />
            2026 Forecast
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mt-5 tracking-tight">
            Revenue Projection
          </h2>
          <p className="section-subtitle">
            GradientBoosting model trained on per-branch seasonal features with ±1.5σ confidence intervals.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, type: "spring" }}
            className="text-center card-3d"
          >
            <div className="mega-number text-3xl md:text-4xl text-foreground">{actual}M</div>
            <div className="text-xs text-muted-foreground mt-2 font-semibold">2025 Actual</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, type: "spring" }}
            className="text-center card-3d !border-success/20"
            style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.02), rgba(34,197,94,0.05))" }}
          >
            <div className="mega-number text-3xl md:text-4xl text-success flex items-center justify-center gap-1.5">
              {projected}M
              <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="text-xs text-muted-foreground mt-2 font-semibold">2026 Projected</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, type: "spring" }}
            className="text-center card-3d"
          >
            <span className="inline-block px-4 py-2 bg-success/8 text-success rounded-xl mega-number text-2xl md:text-3xl">
              +11.5%
            </span>
            <div className="text-xs text-muted-foreground mt-3 font-semibold">YoY Growth</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
          className="card-3d mb-8"
        >
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 92%)" />
              <XAxis dataKey="month" fontSize={12} tick={{ fill: "hsl(20 12% 42%)" }} />
              <YAxis fontSize={12} tick={{ fill: "hsl(20 12% 42%)" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid hsl(30 15% 88%)", borderRadius: "12px", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                formatter={(v: number, name: string) => [`${v}M`, name === "actual" ? "2025 Actual" : name === "forecast" ? "2026 Forecast" : name]}
              />
              <Area dataKey="high" stackId="band" stroke="none" fill="hsl(210 80% 55% / 0.08)" />
              <Area dataKey="low" stackId="band" stroke="none" fill="white" />
              <Line type="monotone" dataKey="actual" stroke="hsl(25 80% 28%)" strokeWidth={3} dot={{ r: 4, fill: "hsl(25 80% 28%)" }} />
              <Line type="monotone" dataKey="forecast" stroke="hsl(210 80% 55%)" strokeWidth={3} strokeDasharray="8 4" dot={{ r: 4, fill: "hsl(210 80% 55%)" }} />
              <ReferenceDot x="Jan" y={62.5} r={7} fill="hsl(152 65% 42%)" stroke="white" strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground text-center mt-4 font-medium">
            GradientBoosting model · Per-branch seasonal features · ±1.5σ confidence interval
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6, type: "spring" }}
          className="card-3d max-w-2xl mx-auto"
        >
          <h3 className="text-base font-display font-bold mb-2 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-success" />
            Top 5 Branches — 2026 Projections
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Projected annual revenue and year-over-year growth rate</p>
          <div className="flex items-center gap-3 text-[10px] font-bold tracking-wider uppercase text-muted-foreground/50 mb-3 px-11">
            <span className="flex-1">Branch</span>
            <span className="mr-12">Projected</span>
            <span>YoY</span>
          </div>
          <div className="space-y-2.5">
            {topForecast.map((b, i) => (
              <div key={b.branch} className="flex items-center gap-3 group p-1.5 -mx-1.5 rounded-xl hover:bg-success/[0.03] transition-colors">
                <span className="w-8 h-8 rounded-lg bg-success/10 text-success text-xs font-bold flex items-center justify-center group-hover:bg-success group-hover:text-white transition-all duration-300">{i + 1}</span>
                <span className="flex-1 text-sm font-semibold">{b.branch}</span>
                <span className="text-sm font-bold tabular-nums">{b.projected}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${b.growth.startsWith("+") ? "text-success bg-success/10" : "text-destructive bg-destructive/8"}`}>{b.growth}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
