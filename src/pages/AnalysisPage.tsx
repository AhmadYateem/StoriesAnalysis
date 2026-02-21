/**
 * AnalysisPage — deep-dive analysis with three tabs:
 *   1. Margin Leaks (the 62M report with enhanced modifier narrative)
 *   2. Menu Engineering (scatter plot + quadrant cards)
 *   3. Modifier Gold Mine (attach rates + playbook)
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalysisData } from "@/context/DataContext";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { formatCurrency } from "@/lib/formatters";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, CartesianGrid, ReferenceLine,
  PieChart, Pie,
} from "recharts";
import {
  AlertTriangle, TrendingDown, Gift, CakeSlice, Leaf, Monitor,
  ChevronDown, ChevronRight, Star, Puzzle, Beef, Dog,
  Gem, ClipboardList, Sparkles, Info, Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* Icon lookup for data-driven rendering */
const ICON_MAP: Record<string, LucideIcon> = {
  TrendingDown, Gift, CakeSlice, Leaf, Monitor, Star, Puzzle, Beef, Dog,
};

/* Tab definitions */
const TABS = [
  { id: "leaks",     label: "Margin Leaks",    icon: AlertTriangle },
  { id: "menu",      label: "Menu Matrix",      icon: Star },
  { id: "modifiers", label: "Modifier Goldmine", icon: Gem },
];

/* Quadrant color map */
const QUADRANT_COLORS: Record<string, string> = {
  star: "hsl(152 65% 42%)",
  puzzle: "hsl(210 80% 55%)",
  plowhorse: "hsl(32 95% 52%)",
  dog: "hsl(0 80% 55%)",
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

/* ────────────────────── Main component ────────────────────── */
export default function AnalysisPage() {
  const data = useAnalysisData();
  const { ref, isInView } = useInView(0.05);
  const [activeTab, setActiveTab] = useState("leaks");

  return (
    <div ref={ref} className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">

      {/* ── Page header ── */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
          Deep Analysis
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Margin leaks, menu engineering, and modifier strategy
        </p>
      </motion.div>

      {/* ── Tab bar ── */}
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
                  layoutId="analysis-tab"
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

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        {activeTab === "leaks" && <MarginLeaksTab key="leaks" data={data} inView={isInView} />}
        {activeTab === "menu"  && <MenuMatrixTab   key="menu"  data={data} inView={isInView} />}
        {activeTab === "modifiers" && <ModifierTab key="modifiers" data={data} inView={isInView} />}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════ MARGIN LEAKS TAB ═══════════════════════ */
function MarginLeaksTab({ data, inView }: { data: any; inView: boolean }) {
  const counter = useCountUp(62013109, 2200, 0, inView);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Hero number */}
      <div className="bg-gradient-to-br from-red-50 to-red-50/40 rounded-2xl border border-red-200 p-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-xs font-bold mb-4">
          <AlertTriangle className="w-3.5 h-3.5" />
          The 62M Report
        </div>
        <div className="mega-number text-5xl md:text-7xl text-red-600 mb-3">
          {counter.toLocaleString()}
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          in annual profit leaks identified across 5 categories — all fixable with zero additional investment
        </p>
      </div>

      {/* Waterfall chart */}
      <div className="bg-white rounded-2xl border border-border/60 p-5">
        <h3 className="text-sm font-bold text-foreground mb-1">Margin Leak Waterfall</h3>
        <p className="text-xs text-muted-foreground mb-4">Five leak categories sorted by annual impact (millions)</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.waterfallData} layout="vertical">
            <XAxis type="number" fontSize={11} tick={{ fill: "hsl(20 12% 50%)" }} tickFormatter={(v) => v + "M"} />
            <YAxis type="category" dataKey="name" fontSize={11} width={180} tick={{ fill: "hsl(20 12% 50%)" }} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v + "M", "Impact"]} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {data.waterfallData.map((entry: any, i: number) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Leak detail cards */}
      <div className="space-y-3">
        {data.leakCards.map((card: any, i: number) => (
          <LeakDetailCard
            key={card.title}
            card={card}
            index={i}
            isExpanded={expandedCard === i}
            onToggle={() => setExpandedCard(expandedCard === i ? null : i)}
            freeModifiers={card.title.includes("Free Modifier") ? data.freeModifiers : undefined}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── Single leak card with expandable detail + root cause ── */
function LeakDetailCard({ card, index, isExpanded, onToggle, freeModifiers }: {
  card: any; index: number; isExpanded: boolean; onToggle: () => void; freeModifiers?: any[];
}) {
  const Icon = ICON_MAP[card.icon] || AlertTriangle;
  const isModifierLeak = freeModifiers && freeModifiers.length > 0;

  const severityStyles: Record<string, { border: string; iconBg: string; iconColor: string; amountColor: string }> = {
    critical: { border: "border-red-200", iconBg: "bg-red-50", iconColor: "text-red-500", amountColor: "text-red-600" },
    warning:  { border: "border-amber-200", iconBg: "bg-amber-50", iconColor: "text-amber-600", amountColor: "text-amber-600" },
    info:     { border: "border-border", iconBg: "bg-gray-100", iconColor: "text-muted-foreground", amountColor: "text-muted-foreground" },
  };
  const style = severityStyles[card.severity] || severityStyles.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, type: "spring" }}
      className={`bg-white rounded-2xl border ${style.border} overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-md`}
      onClick={onToggle}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 p-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
          <Icon className={`w-5 h-5 ${style.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm text-foreground">{card.title}</div>
          <div className={`text-[10px] font-bold tracking-wider uppercase mt-0.5 ${style.iconColor}`}>
            {card.severity}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className={`font-black text-lg tabular-nums tracking-tight ${style.amountColor}`}>
            {card.amount}
          </div>
          <div className="text-[10px] text-muted-foreground">annual impact</div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} className="shrink-0">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </div>

      {/* Expandable detail section */}
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
              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">{card.detail}</p>

              {/* Root cause analysis (if available) */}
              {card.rootCause && (
                <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Root Cause Analysis</span>
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
                    {card.rootCause}
                  </div>
                </div>
              )}

              {/* Free modifier breakdown table (only for the modifier leak card) */}
              {isModifierLeak && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Top 10 Free Modifiers by Cost Absorbed</span>
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
                      <tbody className="divide-y divide-gray-200">
                        {freeModifiers!.map((mod) => (
                          <tr key={mod.product} className="text-foreground">
                            <td className="py-2 font-semibold">{mod.product}</td>
                            <td className="py-2 text-right tabular-nums">{mod.quantity.toLocaleString()}</td>
                            <td className="py-2 text-right tabular-nums text-red-600">{formatCurrency(mod.absorbedCost)}</td>
                            <td className="py-2 text-right tabular-nums text-amber-600">{mod.suggestedCharge}/unit</td>
                            <td className="py-2 text-right tabular-nums text-emerald-600">{formatCurrency(mod.recoverable)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recommendation */}
              {card.recommendation && (
                <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <ChevronRight className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Recommendation</span>
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

/* ═══════════════════════ MENU MATRIX TAB ═══════════════════════ */
function MenuMatrixTab({ data, inView }: { data: any; inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Scatter chart */}
      <div className="bg-white rounded-2xl border border-border/60 p-5">
        <h3 className="text-sm font-bold text-foreground mb-1">Menu Engineering Matrix — 409 Products</h3>
        <p className="text-xs text-muted-foreground mb-4">Volume (units sold) vs Profit Margin (%). Quadrant lines at median values.</p>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 92%)" />
            <XAxis
              dataKey="volume" type="number" fontSize={11}
              tick={{ fill: "hsl(20 12% 50%)" }}
              label={{ value: "Volume (units)", position: "bottom", fill: "hsl(20 12% 50%)", fontSize: 11, offset: -5 }}
            />
            <YAxis
              dataKey="margin" type="number" fontSize={11}
              tick={{ fill: "hsl(20 12% 50%)" }}
              label={{ value: "Margin %", angle: -90, position: "insideLeft", fill: "hsl(20 12% 50%)", fontSize: 11 }}
            />
            <ReferenceLine y={72.4} stroke="hsl(30 15% 80%)" strokeDasharray="8 4" strokeWidth={1.5} />
            <ReferenceLine x={2144} stroke="hsl(30 15% 80%)" strokeDasharray="8 4" strokeWidth={1.5} />
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
                <Cell key={i} fill={QUADRANT_COLORS[p.quadrant]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Quadrant summary cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.quadrants.map((q: any, i: number) => {
          const Icon = ICON_MAP[q.icon] || Star;
          return (
            <motion.div
              key={q.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
              className="bg-white rounded-2xl border border-border/60 p-5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${q.color}`} />
              </div>
              <h4 className={`font-bold text-base ${q.color} mb-0.5`}>{q.name}</h4>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-3">
                Action: {q.desc}
              </p>
              <div className="border-t border-border/40 pt-3">
                <ul className="space-y-1.5">
                  {q.items.map((item: string) => (
                    <li key={item} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30 mt-1.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════ MODIFIER TAB ═══════════════════════ */
function ModifierTab({ data, inView }: { data: any; inView: boolean }) {
  const goldCounter = useCountUp(16900000, 2000, 0, inView);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Big number + highlights */}
        <div className="bg-white rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/60 to-amber-50/20 p-6">
          <div className="mega-number text-4xl md:text-5xl text-amber-600 mb-3">
            {(goldCounter / 1_000_000).toFixed(1)}M
          </div>
          <p className="text-base font-bold text-foreground mb-6">in untapped modifier upsell profit</p>
          <div className="space-y-3 text-sm text-muted-foreground">
            {[
              { label: "Modifier margins", value: "70–95%" },
              { label: "Yirgacheffe upgrade", value: "95% margin" },
              { label: "Drizzle toppings", value: "90% margin" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{item.label}: <strong className="text-foreground">{item.value}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Branch attach rate chart */}
        <div className="bg-white rounded-2xl border border-border/60 p-5">
          <h3 className="text-sm font-bold text-foreground mb-1">Modifier Attach Rate by Branch</h3>
          <p className="text-xs text-muted-foreground mb-3">% of drinks sold with at least one paid modifier</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.modifierAttachRates} layout="vertical">
              <XAxis type="number" fontSize={11} tick={{ fill: "hsl(20 12% 50%)" }} tickFormatter={(v) => v + "%"} />
              <YAxis type="category" dataKey="branch" fontSize={11} width={120} tick={{ fill: "hsl(20 12% 50%)" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v + "%", "Attach Rate"]} />
              <Bar dataKey="rate" fill="hsl(32 95% 52%)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy Playbook */}
      <div className="bg-white rounded-2xl border border-border/60 p-6 max-w-3xl">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-5">
          <ClipboardList className="w-4 h-4 text-amber-500" />
          Strategy Playbook
        </h3>
        <div className="space-y-3.5">
          {data.modifierPlaybook.map((item: any) => (
            <div key={item.step} className="flex gap-3 items-start group">
              <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 text-sm font-bold flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-200">
                {item.step}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed pt-1">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
