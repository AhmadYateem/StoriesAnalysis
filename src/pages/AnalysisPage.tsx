/**
 * AnalysisPage — deep-dive analysis with three tabs:
 *   1. Margin Leaks (the 62M report with enhanced modifier narrative)
 *   2. Menu Engineering (scatter plot + quadrant cards)
 *   3. Modifier Gold Mine (attach rates + playbook)
 *
 * Adapts to uploaded data or clearly labels Stories Coffee default dataset.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalysisData } from "@/context/DataContext";
import { useDataContext } from "@/context/DataContext";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { formatCurrency } from "@/lib/formatters";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, CartesianGrid, ReferenceLine,
  PieChart, Pie, Legend,
} from "recharts";
import {
  AlertTriangle, TrendingDown, Gift, CakeSlice, Leaf, Monitor,
  ChevronDown, ChevronRight, Star, Puzzle, Beef, Dog,
  Gem, ClipboardList, Sparkles, Info, Lightbulb,
  Database, Upload, Coffee, ArrowRight, Target,
  ShieldAlert, Zap, CheckCircle2, ArrowUpRight, BarChart3,
  CircleDollarSign, TrendingUp, Package, FileWarning,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* Icon lookup for data-driven rendering */
const ICON_MAP: Record<string, LucideIcon> = {
  TrendingDown, Gift, CakeSlice, Leaf, Monitor, Star, Puzzle, Beef, Dog,
};

/* Tab definitions */
const TABS = [
  { id: "leaks", label: "Margin Leaks", icon: ShieldAlert, badge: "62M", badgeColor: "bg-red-500" },
  { id: "menu", label: "Menu Matrix", icon: Target, badge: "409", badgeColor: "bg-blue-500" },
  { id: "modifiers", label: "Modifier Goldmine", icon: Gem, badge: "16.9M", badgeColor: "bg-amber-500" },
];

/* Quadrant color map */
const QUADRANT_COLORS: Record<string, string> = {
  star: "#22c55e",
  puzzle: "#3b82f6",
  plowhorse: "#f59e0b",
  dog: "#ef4444",
};

/* Shared recharts tooltip style */
const tooltipStyle = {
  backgroundColor: "white",
  border: "1px solid hsl(30 15% 88%)",
  borderRadius: "12px",
  fontSize: 13,
  fontWeight: 600,
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

/* Main component */
export default function AnalysisPage() {
  const data = useAnalysisData();
  const { state: dataState } = useDataContext();
  const { ref, isInView } = useInView(0.05);
  const [activeTab, setActiveTab] = useState("leaks");

  const isDefault = dataState.source === "default";

  return (
    <div ref={ref} className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">

      {/* Data Source Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`flex items-center justify-between gap-4 rounded-xl px-4 py-3 border ${
          isDefault
            ? "bg-amber-50/80 border-amber-200/60"
            : "bg-emerald-50/80 border-emerald-200/60"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isDefault ? "bg-amber-100" : "bg-emerald-100"
          }`}>
            {isDefault ? <Coffee className="w-4 h-4 text-amber-700" /> : <Database className="w-4 h-4 text-emerald-700" />}
          </div>
          <div>
            <p className={`text-sm font-bold ${isDefault ? "text-amber-900" : "text-emerald-900"}`}>
              {isDefault ? "Stories Coffee \u2014 Default Dataset" : `Custom Dataset: ${data.datasetName}`}
            </p>
            <p className={`text-xs ${isDefault ? "text-amber-700/70" : "text-emerald-700/70"}`}>
              {isDefault
                ? "Showing analysis for Stories Coffee 2025. Upload your own data to see custom insights."
                : "Analysis reflects your uploaded dataset. All charts and recommendations are data-driven."}
            </p>
          </div>
        </div>
        {isDefault && (
          <Link
            to="/upload"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Data
          </Link>
        )}
      </motion.div>

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
          Deep Analysis
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Margin leaks, menu engineering, and modifier strategy \u2014 everything you need for data-driven decisions
        </p>
      </motion.div>

      {/* Tab bar */}
      <div className="flex gap-1.5 bg-secondary/60 backdrop-blur-sm p-1.5 rounded-xl w-fit border border-border/40">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="analysis-tab"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-border/30"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${
                  isActive ? tab.badgeColor : "bg-muted-foreground/30"
                }`}>
                  {tab.badge}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "leaks" && <MarginLeaksTab key="leaks" data={data} inView={isInView} />}
        {activeTab === "menu" && <MenuMatrixTab key="menu" data={data} inView={isInView} />}
        {activeTab === "modifiers" && <ModifierTab key="modifiers" data={data} inView={isInView} />}
      </AnimatePresence>
    </div>
  );
}


/* MARGIN LEAKS TAB */
function MarginLeaksTab({ data, inView }: { data: any; inView: boolean }) {
  const counter = useCountUp(62013109, 2200, 0, inView);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const totalLeaks = data.leakCards.reduce((s: number, c: any) => s + c.amountRaw, 0);
  const criticalCount = data.leakCards.filter((c: any) => c.severity === "critical").length;
  const warningCount = data.leakCards.filter((c: any) => c.severity === "warning").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Summary KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Profit Leaks", value: formatCurrency(totalLeaks), icon: CircleDollarSign, color: "text-red-600", bg: "bg-red-50", borderColor: "border-red-100" },
          { label: "Critical Issues", value: criticalCount.toString(), icon: ShieldAlert, color: "text-red-500", bg: "bg-red-50", borderColor: "border-red-100" },
          { label: "Warnings", value: warningCount.toString(), icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50", borderColor: "border-amber-100" },
          { label: "Zero Investment Fix", value: "100%", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50", borderColor: "border-emerald-100" },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, type: "spring" }}
              className={`${kpi.bg} border ${kpi.borderColor} rounded-xl p-4 flex items-center gap-3`}
            >
              <Icon className={`w-5 h-5 ${kpi.color} shrink-0`} />
              <div>
                <div className={`text-lg font-black tabular-nums ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hero number */}
      <div className="relative bg-gradient-to-br from-red-50 via-red-50/60 to-orange-50/40 rounded-2xl border border-red-200/80 p-8 text-center overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-4 border border-red-200/50">
            <AlertTriangle className="w-3.5 h-3.5" />
            The 62M Report \u2014 Recoverable Profit
          </div>
          <div className="mega-number text-5xl md:text-7xl text-red-600 mb-3 tracking-tight">
            {counter.toLocaleString()}<span className="text-2xl md:text-3xl text-red-400 ml-1">LBP</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Annual profit leaks identified across <strong className="text-foreground">{data.leakCards.length} categories</strong> \u2014
            all fixable with <strong className="text-emerald-600">zero additional investment</strong>.
            Each card below explains <em>what</em> the issue is, <em>why</em> it happens, and <em>how</em> to fix it.
          </p>
        </div>
      </div>

      {/* Waterfall chart + impact distribution */}
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-border/60 p-5">
          <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            Margin Leak Waterfall
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Five leak categories sorted by annual impact (in millions LBP)</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.waterfallData} layout="vertical">
              <XAxis type="number" fontSize={11} tick={{ fill: "hsl(20 12% 50%)" }} tickFormatter={(v) => Math.abs(v) + "M"} />
              <YAxis type="category" dataKey="name" fontSize={11} width={180} tick={{ fill: "hsl(20 12% 50%)" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [Math.abs(v) + "M", "Annual Impact"]} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {data.waterfallData.map((entry: any, i: number) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-border/60 p-5">
          <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            Leak Distribution
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Share of total margin leak by category</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.waterfallData.map((d: any) => ({
                  name: d.name.replace(/\s*\(.*\)/, ""),
                  value: Math.abs(d.value),
                  color: d.color,
                }))}
                cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                dataKey="value" nameKey="name" paddingAngle={3}
                stroke="none"
              >
                {data.waterfallData.map((d: any, i: number) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [v.toFixed(1) + "M", "Impact"]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, lineHeight: "22px" }}
                formatter={(value: string) => <span className="text-muted-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leak detail cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileWarning className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Issue Breakdown \u2014 What, Why & How to Fix</h3>
        </div>
        <div className="space-y-3">
          {data.leakCards.map((card: any, i: number) => (
            <LeakDetailCard
              key={card.title}
              card={card}
              index={i}
              totalLeak={totalLeaks}
              isExpanded={expandedCard === i}
              onToggle={() => setExpandedCard(expandedCard === i ? null : i)}
              freeModifiers={card.title.includes("Free Modifier") ? data.freeModifiers : undefined}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}


/* Single leak card with expandable What/Why/How */
function LeakDetailCard({ card, index, totalLeak, isExpanded, onToggle, freeModifiers }: {
  card: any; index: number; totalLeak: number; isExpanded: boolean; onToggle: () => void; freeModifiers?: any[];
}) {
  const Icon = ICON_MAP[card.icon] || AlertTriangle;
  const isModifierLeak = freeModifiers && freeModifiers.length > 0;
  const impactPct = totalLeak > 0 ? ((card.amountRaw / totalLeak) * 100) : 0;

  const severityStyles: Record<string, {
    border: string; iconBg: string; iconColor: string; amountColor: string;
    badgeBg: string; badgeText: string; barColor: string;
  }> = {
    critical: {
      border: "border-red-200", iconBg: "bg-red-50", iconColor: "text-red-500",
      amountColor: "text-red-600", badgeBg: "bg-red-100", badgeText: "text-red-700",
      barColor: "bg-red-500",
    },
    warning: {
      border: "border-amber-200", iconBg: "bg-amber-50", iconColor: "text-amber-600",
      amountColor: "text-amber-600", badgeBg: "bg-amber-100", badgeText: "text-amber-700",
      barColor: "bg-amber-500",
    },
    info: {
      border: "border-border", iconBg: "bg-gray-100", iconColor: "text-muted-foreground",
      amountColor: "text-muted-foreground", badgeBg: "bg-gray-100", badgeText: "text-gray-600",
      barColor: "bg-gray-400",
    },
  };
  const s = severityStyles[card.severity] || severityStyles.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, type: "spring" }}
      className={`bg-white rounded-2xl border ${s.border} overflow-hidden transition-shadow duration-300 cursor-pointer hover:shadow-lg group`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-4 p-5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.iconBg} transition-transform group-hover:scale-105`}>
          <Icon className={`w-5 h-5 ${s.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground">{card.title}</span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${s.badgeBg} ${s.badgeText}`}>
              {card.severity}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[180px]">
              <motion.div
                className={`h-full rounded-full ${s.barColor}`}
                initial={{ width: 0 }}
                animate={{ width: `${impactPct}%` }}
                transition={{ delay: 0.3 + index * 0.08, duration: 0.8 }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground tabular-nums">{impactPct.toFixed(1)}% of total</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`font-black text-xl tabular-nums tracking-tight ${s.amountColor}`}>
            {card.amount}
          </div>
          <div className="text-[10px] text-muted-foreground font-medium">annual impact</div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0"
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-border/40 pt-4">
              <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">What's Happening</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{card.detail}</p>
              </div>

              {card.rootCause && (
                <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100/80">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Why It Happens</span>
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {card.rootCause}
                  </div>
                </div>
              )}

              {isModifierLeak && (
                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/80">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Top 10 Free Modifiers \u2014 Cost Being Absorbed</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-muted-foreground/60 font-bold uppercase tracking-wider">
                          <th className="pb-2">Modifier</th>
                          <th className="pb-2 text-right">Qty Sold</th>
                          <th className="pb-2 text-right">Cost Absorbed</th>
                          <th className="pb-2 text-right">Suggested Charge</th>
                          <th className="pb-2 text-right">Recoverable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-100">
                        {freeModifiers!.map((mod) => (
                          <tr key={mod.product} className="text-foreground hover:bg-blue-50/50">
                            <td className="py-2 font-semibold">{mod.product}</td>
                            <td className="py-2 text-right tabular-nums">{mod.quantity.toLocaleString()}</td>
                            <td className="py-2 text-right tabular-nums text-red-600 font-semibold">{formatCurrency(mod.absorbedCost)}</td>
                            <td className="py-2 text-right tabular-nums text-amber-600">{mod.suggestedCharge}/unit</td>
                            <td className="py-2 text-right tabular-nums text-emerald-600 font-semibold">{formatCurrency(mod.recoverable)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {card.recommendation && (
                <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-100/80">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">How to Fix It</span>
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {card.recommendation}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


/* MENU MATRIX TAB */
function MenuMatrixTab({ data, inView }: { data: any; inView: boolean }) {
  const totalProducts = data.menuProducts.length;
  const stars = data.menuProducts.filter((p: any) => p.quadrant === "star").length;
  const puzzles = data.menuProducts.filter((p: any) => p.quadrant === "puzzle").length;
  const plowhorses = data.menuProducts.filter((p: any) => p.quadrant === "plowhorse").length;
  const dogs = data.menuProducts.filter((p: any) => p.quadrant === "dog").length;
  const avgMargin = data.menuProducts.reduce((s: number, p: any) => s + p.margin, 0) / totalProducts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Summary KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Products Analyzed", value: totalProducts.toString(), color: "text-foreground", bg: "bg-gray-50", border: "border-gray-100", icon: Package },
          { label: "Stars", value: stars.toString(), color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: Star },
          { label: "Puzzles", value: puzzles.toString(), color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", icon: Puzzle },
          { label: "Plowhorses", value: plowhorses.toString(), color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: Beef },
          { label: "Dogs", value: dogs.toString(), color: "text-red-600", bg: "bg-red-50", border: "border-red-100", icon: Dog },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, type: "spring" }}
              className={`${kpi.bg} border ${kpi.border} rounded-xl p-3.5 flex items-center gap-3`}
            >
              <Icon className={`w-4 h-4 ${kpi.color} shrink-0`} />
              <div>
                <div className={`text-lg font-black tabular-nums ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Scatter chart + legend panel */}
      <div className="grid lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-border/60 p-5">
          <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            Menu Engineering Matrix
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Each dot is a product. <strong>X-axis</strong> = volume (units sold), <strong>Y-axis</strong> = profit margin (%).
            Dashed lines show median cutoffs.
          </p>
          <ResponsiveContainer width="100%" height={420}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 92%)" />
              <XAxis
                dataKey="volume" type="number" fontSize={11}
                tick={{ fill: "hsl(20 12% 50%)" }}
                label={{ value: "Volume (units sold) \u2192", position: "bottom", fill: "hsl(20 12% 50%)", fontSize: 11, offset: -5 }}
              />
              <YAxis
                dataKey="margin" type="number" fontSize={11}
                tick={{ fill: "hsl(20 12% 50%)" }}
                label={{ value: "Margin % \u2192", angle: -90, position: "insideLeft", fill: "hsl(20 12% 50%)", fontSize: 11 }}
              />
              <ReferenceLine y={72.4} stroke="hsl(30 15% 75%)" strokeDasharray="8 4" strokeWidth={1.5} label={{ value: "Median Margin", position: "left", fontSize: 10, fill: "hsl(20 12% 60%)" }} />
              <ReferenceLine x={2144} stroke="hsl(30 15% 75%)" strokeDasharray="8 4" strokeWidth={1.5} label={{ value: "Median Volume", position: "top", fontSize: 10, fill: "hsl(20 12% 60%)" }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [
                  name === "volume" ? value.toLocaleString() : value + "%",
                  name === "volume" ? "Volume" : "Margin",
                ]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""}
              />
              <Scatter data={data.menuProducts}>
                {data.menuProducts.map((p: any, i: number) => (
                  <Cell key={i} fill={QUADRANT_COLORS[p.quadrant]} opacity={0.75} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend + interpretation */}
        <div className="bg-white rounded-2xl border border-border/60 p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              How to Read This
            </h3>
            <div className="space-y-4">
              {[
                { q: "star", label: "Stars", desc: "High volume + High margin. Promote aggressively.", count: stars, color: "#22c55e" },
                { q: "puzzle", label: "Puzzles", desc: "Low volume + High margin. Needs more marketing.", count: puzzles, color: "#3b82f6" },
                { q: "plowhorse", label: "Plowhorses", desc: "High volume + Low margin. Reprice or optimize costs.", count: plowhorses, color: "#f59e0b" },
                { q: "dog", label: "Dogs", desc: "Low volume + Low margin. Consider removing.", count: dogs, color: "#ef4444" },
              ].map((item) => (
                <div key={item.q} className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="text-xs font-bold text-foreground">{item.label} ({item.count})</div>
                    <div className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5 bg-blue-50/60 rounded-xl p-3 border border-blue-100/60">
            <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-0.5">Avg Margin</div>
            <div className="text-2xl font-black text-blue-700 tabular-nums">{avgMargin.toFixed(1)}%</div>
            <div className="text-[10px] text-blue-500">across all {totalProducts} products</div>
          </div>
        </div>
      </div>

      {/* Quadrant action cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Strategic Actions by Quadrant</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.quadrants.map((q: any, i: number) => {
            const Icon = ICON_MAP[q.icon] || Star;
            const actionColors: Record<string, { bg: string; border: string; badge: string }> = {
              "text-success": { bg: "bg-emerald-50/50", border: "border-emerald-100", badge: "bg-emerald-100 text-emerald-700" },
              "text-blue-500": { bg: "bg-blue-50/50", border: "border-blue-100", badge: "bg-blue-100 text-blue-700" },
              "text-accent": { bg: "bg-amber-50/50", border: "border-amber-100", badge: "bg-amber-100 text-amber-700" },
              "text-destructive": { bg: "bg-red-50/50", border: "border-red-100", badge: "bg-red-100 text-red-700" },
            };
            const ac = actionColors[q.color] || actionColors["text-success"];

            return (
              <motion.div
                key={q.name}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
                className={`${ac.bg} rounded-2xl border ${ac.border} p-5 transition-shadow hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center border ${ac.border}`}>
                    <Icon className={`w-5 h-5 ${q.color}`} />
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${ac.badge}`}>
                    {q.desc}
                  </span>
                </div>
                <h4 className={`font-bold text-base ${q.color} mb-3`}>{q.name}</h4>
                <div className="border-t border-black/[0.04] pt-3">
                  <p className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider mb-2">Example Products</p>
                  <ul className="space-y-1.5">
                    {q.items.map((item: string) => (
                      <li key={item} className="text-xs text-muted-foreground flex items-start gap-2">
                        <ArrowRight className="w-3 h-3 mt-0.5 shrink-0 opacity-40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Insight callout */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/60 p-5">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-1">Key Insight</h4>
            <p className="text-sm text-blue-800/70 leading-relaxed">
              <strong>{dogs} Dog products</strong> generate minimal revenue with low margins \u2014 removing or repricing them frees menu space and reduces kitchen complexity.
              Meanwhile, <strong>{puzzles} Puzzles</strong> have high margins but low volume \u2014 these are your hidden gems.
              A targeted marketing push (social media features, barista recommendations) could convert Puzzles into Stars with significant profit impact.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}


/* MODIFIER TAB */
function ModifierTab({ data, inView }: { data: any; inView: boolean }) {
  const goldCounter = useCountUp(16900000, 2000, 0, inView);

  const rates = data.modifierAttachRates.map((b: any) => b.rate);
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  const avgRate = rates.reduce((s: number, r: number) => s + r, 0) / rates.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Summary KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Untapped Profit", value: "16.9M", icon: CircleDollarSign, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          { label: "Highest Attach Rate", value: maxRate + "%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          { label: "Lowest Attach Rate", value: minRate + "%", icon: TrendingDown, color: "text-red-500", bg: "bg-red-50", border: "border-red-100" },
          { label: "Avg Modifier Margin", value: "70\u201395%", icon: Sparkles, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, type: "spring" }}
              className={`${kpi.bg} border ${kpi.border} rounded-xl p-4 flex items-center gap-3`}
            >
              <Icon className={`w-5 h-5 ${kpi.color} shrink-0`} />
              <div>
                <div className={`text-lg font-black tabular-nums ${kpi.color}`}>{kpi.value}</div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{kpi.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Big opportunity number */}
        <div className="relative bg-gradient-to-br from-amber-50 via-amber-50/60 to-orange-50/30 rounded-2xl border border-amber-200/60 p-6 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-200/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 border border-amber-200/60">
              <Gem className="w-3 h-3" />
              Revenue Opportunity
            </div>
            <div className="mega-number text-4xl md:text-5xl text-amber-600 mb-2 tracking-tight">
              {(goldCounter / 1_000_000).toFixed(1)}M<span className="text-xl text-amber-400 ml-1">LBP</span>
            </div>
            <p className="text-sm font-semibold text-foreground/80 mb-6">in untapped modifier upsell profit</p>

            <div className="space-y-3">
              <h4 className="text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">Why Modifiers Are Gold</h4>
              {[
                { label: "Modifier margins", value: "70\u201395%", desc: "Almost pure profit" },
                { label: "Yirgacheffe upgrade", value: "95% margin", desc: "Premium bean upsell" },
                { label: "Drizzle toppings", value: "90% margin", desc: "Low-cost, high-perceived value" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 bg-white/60 rounded-lg p-2.5 border border-amber-100/50">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <div className="text-xs text-muted-foreground/50">{item.desc}</div>
                  </div>
                  <span className="text-sm font-bold text-foreground tabular-nums">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Branch attach rate chart */}
        <div className="bg-white rounded-2xl border border-border/60 p-5">
          <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            Modifier Attach Rate by Branch
          </h3>
          <p className="text-xs text-muted-foreground mb-1">% of drinks sold with at least one paid modifier</p>
          <p className="text-[10px] text-amber-600 font-semibold mb-3">
            Gap between highest and lowest: <strong>{(maxRate - minRate).toFixed(1)}pp</strong> \u2014 a training & execution gap, not a product gap
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={data.modifierAttachRates} layout="vertical">
              <XAxis type="number" fontSize={11} tick={{ fill: "hsl(20 12% 50%)" }} tickFormatter={(v) => v + "%"} domain={[0, 'auto']} />
              <YAxis type="category" dataKey="branch" fontSize={11} width={120} tick={{ fill: "hsl(20 12% 50%)" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v + "%", "Attach Rate"]} />
              <ReferenceLine x={avgRate} stroke="hsl(20 12% 60%)" strokeDasharray="4 4" strokeWidth={1} label={{ value: `Avg ${avgRate.toFixed(1)}%`, position: "top", fontSize: 10, fill: "hsl(20 12% 60%)" }} />
              <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                {data.modifierAttachRates.map((entry: any, i: number) => (
                  <Cell
                    key={i}
                    fill={entry.rate >= avgRate ? "hsl(32 95% 52%)" : "hsl(32 60% 72%)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Branch Gap Analysis */}
      <div className="bg-white rounded-2xl border border-border/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">Branch Improvement Opportunities</h3>
          <span className="text-xs text-muted-foreground">\u2014 ranked by gap to best performer ({maxRate}%)</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {data.modifierAttachRates
            .filter((b: any) => b.rate < maxRate)
            .sort((a: any, b: any) => a.rate - b.rate)
            .slice(0, 6)
            .map((branch: any) => {
              const gap = maxRate - branch.rate;
              return (
                <div key={branch.branch} className="bg-gray-50/80 rounded-xl p-3.5 border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-foreground">{branch.branch}</span>
                    <span className="text-xs tabular-nums text-amber-600 font-bold">{branch.rate}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                      style={{ width: `${(branch.rate / maxRate) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-red-500 font-semibold">Gap: {gap.toFixed(1)}pp</span>
                    <span className="text-muted-foreground">Target: {maxRate}%</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Strategy Playbook */}
      <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/30 rounded-2xl border border-amber-200/60 p-6">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-2">
          <ClipboardList className="w-5 h-5 text-amber-600" />
          Modifier Upsell Playbook
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          Five concrete steps to unlock the full 16.9M opportunity \u2014 from easiest to most impactful.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {data.modifierPlaybook.map((item: any) => (
            <div key={item.step} className="bg-white/80 rounded-xl p-4 border border-amber-100/50 hover:shadow-md transition-shadow group">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold mb-3 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200">
                {item.step}
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-200/60 p-5">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-purple-900 mb-1">Key Insight</h4>
            <p className="text-sm text-purple-800/70 leading-relaxed">
              The <strong>{(maxRate - minRate).toFixed(1)} percentage point spread</strong> between your best and worst branches
              proves this isn't a product problem \u2014 it's a <strong>training and execution gap</strong>.
              The modifier menu is identical across branches; the difference is how well baristas suggest add-ons.
              Bringing all branches to the top performer's level ({maxRate}%) would alone unlock significant incremental profit,
              since modifiers carry 70\u201395% margins.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
