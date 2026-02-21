/**
 * ForecastPage — ML-powered forecasting and branch clustering.
 *   Tab 1: Revenue Forecast (GradientBoosting, actual vs predicted + confidence band)
 *   Tab 2: Branch Clustering (KMeans radar charts + 4 cluster strategy cards)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalysisData } from "@/context/DataContext";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, BarChart, Bar, Cell,
} from "recharts";
import {
  TrendingUp, Layers, Rocket, BarChart3, Coins, PartyPopper,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const CLUSTER_ICONS: Record<string, LucideIcon> = {
  Coins, BarChart3, Rocket, PartyPopper,
};

const TABS = [
  { id: "forecast",  label: "Revenue Forecast", icon: TrendingUp },
  { id: "clusters",  label: "Branch Clustering", icon: Layers },
];

const tooltipStyle = {
  backgroundColor: "white",
  border: "1px solid hsl(30 15% 88%)",
  borderRadius: "12px",
  fontSize: 13,
  fontWeight: 600,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

/* ────────────────────── Main component ────────────────────── */
export default function ForecastPage() {
  const data = useAnalysisData();
  const { ref, isInView } = useInView(0.05);
  const [activeTab, setActiveTab] = useState("forecast");

  return (
    <div ref={ref} className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
          Forecasting & Clustering
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          ML-driven 2026 projections and strategic branch segments
        </p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-secondary/60 p-1 rounded-xl w-fit">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="forecast-tab"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "forecast" && <ForecastTab key="forecast" data={data} inView={isInView} />}
        {activeTab === "clusters" && <ClusterTab  key="clusters" data={data} inView={isInView} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════ FORECAST TAB ═══════════════════════ */
function ForecastTab({ data, inView }: { data: any; inView: boolean }) {
  const counter = useCountUp(1056960141, 2200, 0, inView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/40 rounded-2xl border border-emerald-200 p-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold mb-4">
          <TrendingUp className="w-3.5 h-3.5" />
          GradientBoosting Model
        </div>
        <div className="mega-number text-5xl md:text-7xl text-emerald-600 mb-3">
          {(counter / 1_000_000_000).toFixed(2)}B
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Projected 2026 revenue — <strong>+26% year-over-year</strong> growth driven by new branches and expanded hours
        </p>
      </div>

      {/* Composed chart: actual vs forecast with confidence band */}
      <div className="bg-white rounded-2xl border border-border/60 p-5">
        <h3 className="text-sm font-bold text-foreground mb-1">2025 Actual vs ML Forecast (Millions)</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Shaded area = 80% confidence interval. Gradient Boosting trained on branch×month features.
        </p>
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={data.forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 92%)" />
            <XAxis dataKey="month" fontSize={11} tick={{ fill: "hsl(20 12% 50%)" }} />
            <YAxis fontSize={11} tick={{ fill: "hsl(20 12% 50%)" }} tickFormatter={(v) => v + "M"} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => {
              const labels: Record<string, string> = { actual: "Actual", forecast: "Forecast", low: "CI Low", high: "CI High" };
              return [v.toFixed(1) + "M", labels[name] || name];
            }} />
            {/* Confidence band */}
            <Area dataKey="high" stroke="none" fill="hsl(152 65% 42%)" fillOpacity={0.12} />
            <Area dataKey="low" stroke="none" fill="white" fillOpacity={1} />
            {/* Forecast line */}
            <Line
              dataKey="forecast" stroke="hsl(152 65% 42%)" strokeWidth={2.5}
              strokeDasharray="6 3" dot={false}
            />
            {/* Actual line */}
            <Line
              dataKey="actual" stroke="hsl(32 95% 52%)" strokeWidth={2.5}
              dot={{ fill: "hsl(32 95% 52%)", r: 4 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, fontWeight: 600 }}
              formatter={(value) => {
                const labels: Record<string, string> = { actual: "Actual 2025", forecast: "ML Forecast", low: "", high: "" };
                return labels[value] || value;
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Branch forecast table */}
      <div className="bg-white rounded-2xl border border-border/60 p-5">
        <h3 className="text-sm font-bold text-foreground mb-4">Top 5 Branch Forecasts (2026)</h3>
        <div className="space-y-2.5">
          {data.topForecasts.map((f: any, i: number) => (
            <motion.div
              key={f.branch}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
            >
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span className="font-semibold text-sm flex-1">{f.branch}</span>
              <span className="font-black text-sm tabular-nums">{f.projected}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                f.growth.startsWith("+") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
              }`}>
                {f.growth}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Model card */}
      <div className="bg-gray-50 rounded-2xl border border-border/40 p-5 max-w-xl">
        <h3 className="text-sm font-bold text-foreground mb-3">Model Details</h3>
        <div className="grid grid-cols-2 gap-y-2 text-xs">
          {[
            ["Algorithm", "GradientBoostingRegressor"],
            ["Features", "Branch, Month, Year, Lag-1, Rolling-3"],
            ["Training Period", "Jan–Dec 2025 (48 branch-months)"],
            ["Validation", "Leave-one-out cross-validation"],
            ["Key Insight", "Airport & new branches drive +26% growth"],
          ].map(([key, value]) => (
            <div key={key} className="contents">
              <span className="text-muted-foreground font-semibold">{key}</span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════ CLUSTER TAB ═══════════════════════ */
function ClusterTab({ data, inView }: { data: any; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Radar chart */}
      <div className="bg-white rounded-2xl border border-border/60 p-5">
        <h3 className="text-sm font-bold text-foreground mb-1">Cluster Profiles — Radar View</h3>
        <p className="text-xs text-muted-foreground mb-4">
          KMeans (k=4, silhouette-optimized) on 6 normalised branch features.
        </p>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data.radarData}>
            <PolarGrid stroke="hsl(30 15% 88%)" />
            <PolarAngleAxis dataKey="axis" fontSize={11} tick={{ fill: "hsl(20 12% 50%)" }} />
            <PolarRadiusAxis fontSize={10} tick={{ fill: "hsl(20 12% 50%)" }} />
            <Radar name="Cash Cows"  dataKey="cashCow"  stroke="hsl(32 95% 52%)"  fill="hsl(32 95% 52%)"  fillOpacity={0.15} strokeWidth={2} />
            <Radar name="Established" dataKey="cashCow2" stroke="hsl(210 80% 55%)" fill="hsl(210 80% 55%)" fillOpacity={0.1} strokeWidth={2} />
            <Radar name="Growth"     dataKey="growth"   stroke="hsl(152 65% 42%)" fill="hsl(152 65% 42%)" fillOpacity={0.1} strokeWidth={2} />
            <Radar name="Event"      dataKey="event"    stroke="hsl(270 60% 55%)" fill="hsl(270 60% 55%)" fillOpacity={0.1} strokeWidth={2} />
            <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Cluster strategy cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {data.clusters.map((cluster: any, i: number) => {
          const Icon = CLUSTER_ICONS[cluster.icon] || Layers;
          return (
            <motion.div
              key={cluster.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
              className="bg-white rounded-2xl border border-border/60 p-5 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Cluster header */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl ${cluster.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${cluster.cssColor}`} />
                </div>
                <div>
                  <h4 className={`font-bold text-base ${cluster.cssColor}`}>{cluster.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase">{cluster.metrics}</p>
                </div>
              </div>

              {/* Branch pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {cluster.branches.map((b: string) => (
                  <span key={b} className="px-2 py-0.5 bg-gray-100 text-[10px] font-semibold text-muted-foreground rounded-md">
                    {b}
                  </span>
                ))}
              </div>

              {/* Strategy */}
              <div className="bg-gray-50 rounded-xl p-3 border border-border/30">
                <div className="flex items-center gap-1.5 mb-1">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Strategy</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{cluster.strategy}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Methodology note */}
      <div className="bg-gray-50 rounded-2xl border border-border/40 p-5 max-w-xl">
        <h3 className="text-sm font-bold text-foreground mb-3">Clustering Methodology</h3>
        <div className="grid grid-cols-2 gap-y-2 text-xs">
          {[
            ["Algorithm", "KMeans (scikit-learn)"],
            ["k Selection", "Silhouette score (best k=4)"],
            ["Features", "Revenue, Growth, Margin, Bev Mix, Seasonality, Efficiency"],
            ["Normalisation", "MinMaxScaler (0–1)"],
            ["Validation", "Silhouette = 0.68, clear separation"],
          ].map(([key, value]) => (
            <div key={key} className="contents">
              <span className="text-muted-foreground font-semibold">{key}</span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
