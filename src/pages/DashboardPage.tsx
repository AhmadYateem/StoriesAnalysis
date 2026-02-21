/**
 * DashboardPage — the main overview page.
 *
 * Shows:
 * - KPI cards (2 rows of 4)
 * - Category donut chart (Beverages vs Food)
 * - Monthly revenue area chart
 * - Branch heatmap
 * - Top / Bottom branch rankings
 */

import { motion } from "framer-motion";
import { useAnalysisData } from "@/context/DataContext";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { formatKPIValue } from "@/lib/formatters";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from "recharts";
import {
  DollarSign, TrendingUp, BarChart3, Store, ShoppingCart, Coffee,
  Rocket, AlertTriangle, Trophy, ArrowDownCircle, Activity,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* Icon lookup map so we can store icon names in data as strings */
const ICON_MAP: Record<string, LucideIcon> = {
  DollarSign, TrendingUp, BarChart3, Store, ShoppingCart, Coffee, Rocket, AlertTriangle,
};

/* Recharts custom tooltip */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl border border-border/60 px-4 py-3 shadow-lg text-sm">
      <p className="font-bold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: p.color }} />
          {p.name}: <strong className="text-foreground">{p.value}M</strong>
        </p>
      ))}
    </div>
  );
};

/* ── KPI Card component ── */
function KPICard({ icon, label, value, subtext, format, isAlert, delay, inView }: {
  icon: string; label: string; value: number; subtext: string;
  format: string; isAlert?: boolean; delay: number; inView: boolean;
}) {
  const animatedValue = useCountUp(value, 2000, 0, inView);
  const Icon = ICON_MAP[icon] || BarChart3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 120 }}
      className={`relative bg-white rounded-2xl p-5 border transition-all duration-300 hover:shadow-lg ${
        isAlert
          ? "border-red-200 bg-gradient-to-br from-red-50/80 to-red-50/40"
          : "border-border/60 hover:border-border"
      }`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full ${
        isAlert ? "bg-red-400" : "bg-amber-400"
      }`} />

      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${
        isAlert ? "bg-red-100 text-red-500" : "bg-amber-50 text-amber-600"
      }`}>
        <Icon className="w-4 h-4" strokeWidth={2} />
      </div>

      <div className={`mega-number text-2xl md:text-3xl mb-1 ${
        isAlert ? "text-red-600" : "text-foreground"
      }`}>
        {formatKPIValue(animatedValue, format)}
      </div>
      <div className="text-xs font-bold text-foreground tracking-tight">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{subtext}</div>
    </motion.div>
  );
}

/* Month labels for the heatmap header */
const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

/* ── Heatmap cell ── */
function HeatCell({ value }: { value: number }) {
  return (
    <div
      className="w-full aspect-square rounded-[3px] transition-all duration-300 hover:scale-125 hover:z-10 hover:shadow-md cursor-crosshair"
      style={{
        backgroundColor: value === 0
          ? "hsl(30 15% 93%)"
          : `hsl(25 ${30 + value * 60}% ${92 - value * 52}%)`,
        opacity: value === 0 ? 0.4 : 1,
      }}
      title={(value * 100).toFixed(0) + "% of peak"}
    />
  );
}

/* ────────────────────────── Main component ────────────────────────── */
export default function DashboardPage() {
  const data = useAnalysisData();
  const { ref, isInView } = useInView(0.05);

  /* Compute heatmap normalized values */
  function getHeatValue(branch: string, monthIndex: number): number {
    const raw = data.branchMonthly[branch];
    if (!raw) return 0;
    const max = Math.max(...raw);
    if (max === 0) return 0;
    return raw[monthIndex] / max;
  }

  return (
    <div ref={ref} className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8">

      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
          Executive Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {data.datasetName} — Chain-wide KPIs and trends at a glance
        </p>
      </motion.div>

      {/* ── KPI Grid (2 rows of 4) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi, i) => (
          <KPICard
            key={kpi.label}
            icon={kpi.icon}
            label={kpi.label}
            value={kpi.value}
            subtext={kpi.subtext}
            format={kpi.format}
            isAlert={kpi.isAlert}
            delay={i * 0.06}
            inView={isInView}
          />
        ))}
      </div>

      {/* ── Charts row: Revenue trend + Category donut ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly revenue area chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4, type: "spring" }}
          className="lg:col-span-2 bg-white rounded-2xl border border-border/60 p-5"
        >
          <h3 className="text-sm font-bold text-foreground mb-1">Monthly Revenue 2025</h3>
          <p className="text-xs text-muted-foreground mb-4">All 25 branches aggregated (millions)</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.monthlyRevenue}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(32 95% 52%)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(32 95% 52%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 92%)" />
              <XAxis dataKey="month" fontSize={11} tick={{ fill: "hsl(20 12% 50%)" }} />
              <YAxis fontSize={11} tick={{ fill: "hsl(20 12% 50%)" }} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="hsl(32 95% 52%)"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={{ fill: "hsl(25 80% 28%)", r: 3, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "hsl(32 95% 52%)", stroke: "white", strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category donut chart */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, type: "spring" }}
          className="bg-white rounded-2xl border border-border/60 p-5 flex flex-col"
        >
          <h3 className="text-sm font-bold text-foreground mb-1">Revenue by Category</h3>
          <p className="text-xs text-muted-foreground mb-2">Beverages vs Food split</p>
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.categorySplit}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="revenue"
                  nameKey="name"
                  strokeWidth={0}
                >
                  {data.categorySplit.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [(value / 1_000_000).toFixed(0) + "M", "Revenue"]}
                  contentStyle={{ background: "white", borderRadius: 12, border: "1px solid hsl(30 15% 88%)", fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-1">
            {data.categorySplit.map((cat) => (
              <div key={cat.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                <span className="font-semibold text-foreground">{cat.name}</span>
                <span className="text-muted-foreground">{cat.margin}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Branch rankings: Top 5 + Bottom 5 side-by-side ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top 5 */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.55, type: "spring" }}
          className="bg-white rounded-2xl border border-border/60 p-5"
        >
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-500" />
            Top 5 Branches
          </h3>
          <div className="space-y-2.5">
            {data.topBranches.map((b) => (
              <div key={b.rank} className="flex items-center gap-3 group p-1.5 rounded-lg hover:bg-amber-50/50 transition-colors">
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold flex items-center justify-center">
                  {b.rank}
                </span>
                <span className="flex-1 text-sm font-semibold">{b.name}</span>
                <span className="text-sm font-bold tabular-nums text-foreground">{b.revenue}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom 5 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: 0.6, type: "spring" }}
          className="bg-white rounded-2xl border border-border/60 p-5"
        >
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
            <ArrowDownCircle className="w-4 h-4 text-red-400" />
            Bottom 5 Branches
          </h3>
          <div className="space-y-2.5">
            {data.bottomBranches.map((b) => (
              <div key={b.rank} className="flex items-center gap-3 group p-1.5 rounded-lg hover:bg-red-50/50 transition-colors">
                <span className="w-7 h-7 rounded-lg bg-red-50 text-red-400 text-xs font-bold flex items-center justify-center">
                  {b.rank}
                </span>
                <span className="flex-1 text-sm font-medium text-muted-foreground">{b.name}</span>
                <span className="text-sm font-medium tabular-nums text-muted-foreground">{b.revenue}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Branch × Month Heatmap ── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.65, type: "spring" }}
        className="bg-white rounded-2xl border border-border/60 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              Seasonality Heatmap
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Each row normalized to its peak — darker means closer to that branch's best month
            </p>
          </div>
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground">Low</span>
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
              <div key={v} className="w-5 h-3 rounded-sm" style={{ backgroundColor: `hsl(25 ${30 + v * 60}% ${92 - v * 52}%)` }} />
            ))}
            <span className="text-[10px] font-semibold text-muted-foreground">High</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {/* Month headers */}
            <div className="grid gap-1" style={{ gridTemplateColumns: "130px repeat(12, 1fr)" }}>
              <div />
              {MONTH_LABELS.map((m, i) => (
                <div key={m + i} className="text-center text-[10px] font-bold text-muted-foreground/60">{m}</div>
              ))}
            </div>
            {/* Branch rows */}
            {data.heatmapBranches.map((branch) => (
              <div key={branch} className="grid gap-1 mt-1" style={{ gridTemplateColumns: "130px repeat(12, 1fr)" }}>
                <div className="text-[11px] font-semibold text-muted-foreground truncate flex items-center">{branch}</div>
                {MONTH_LABELS.map((_, mIdx) => (
                  <HeatCell key={mIdx} value={getHeatValue(branch, mIdx)} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
