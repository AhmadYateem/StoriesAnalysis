/**
 * Sidebar — persistent left navigation for the SPA dashboard.
 *
 * Features:
 * - Collapsible (icon-only mode on mobile / when toggled)
 * - Active route indicator with smooth animated highlight
 * - Coffee-dark aesthetic with accent highlights
 * - Dataset source badge indicating loaded data
 */

import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Upload,
  MessageCircle,
  Coffee,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
} from "lucide-react";
import { useDataContext } from "@/context/DataContext";

/* Navigation items — each maps to a route */
const NAV_ITEMS = [
  { label: "Dashboard",    path: "/",          icon: LayoutDashboard },
  { label: "Analysis",     path: "/analysis",  icon: BarChart3 },
  { label: "Forecast",     path: "/forecast",  icon: TrendingUp },
  { label: "Upload",       path: "/upload",    icon: Upload },
  { label: "AI Chat",      path: "/chat",      icon: MessageCircle },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { state: dataState, dispatch } = useDataContext();

  return (
    <motion.aside
      className="fixed top-0 left-0 h-screen z-40 flex flex-col border-r border-white/[0.06]"
      style={{ background: "hsl(20 65% 6%)" }}
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    >
      {/* ── Logo area ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="relative shrink-0">
          <Coffee className="w-7 h-7 text-amber-500" strokeWidth={2} />
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-lg" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-black text-lg tracking-tighter text-white overflow-hidden whitespace-nowrap"
            >
              Stories
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 group"
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <div className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
                isActive ? "bg-amber-500/15 text-amber-500" : "text-white/35 group-hover:text-white/60"
              }`}>
                <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
              </div>

              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className={`relative z-10 text-sm font-semibold overflow-hidden whitespace-nowrap ${
                      isActive ? "text-white" : "text-white/40 group-hover:text-white/70"
                    }`}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* ── Dataset badge ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 pb-3"
          >
            <div className="px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03]">
              <div className="text-[10px] font-bold tracking-wider uppercase text-white/20 mb-1">
                Data Source
              </div>
              <div className="text-xs font-semibold text-white/50 truncate">
                {dataState.data.datasetName}
              </div>
              <div className={`mt-1.5 flex items-center gap-1.5 text-[10px] font-bold ${
                dataState.source === "uploaded" ? "text-emerald-400" : "text-white/25"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  dataState.source === "uploaded" ? "bg-emerald-400" : "bg-white/25"
                }`} />
                {dataState.source === "uploaded" ? "Custom Upload" : "Default Dataset"}
              </div>
              {/* Reset button — only shown when custom data is loaded */}
              {dataState.source === "uploaded" && (
                <button
                  onClick={() => dataState && dispatch({ type: "RESET" })}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-2 py-1.5 text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-all duration-200"
                  title="Reload the original Stories Coffee 2025 dataset"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Stories Data
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Collapsed reset button (icon only) ── */}
      <AnimatePresence>
        {collapsed && dataState.source === "uploaded" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-3 pb-3">
            <button
              onClick={() => dispatch({ type: "RESET" })}
              className="w-full flex items-center justify-center rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 p-2.5 text-amber-400 hover:text-amber-300 transition-all duration-200"
              title="Reset to Stories Coffee default data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-4 border-t border-white/[0.06] text-white/25 hover:text-white/50 transition-colors"
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeftOpen className="w-4 h-4" />
        ) : (
          <PanelLeftClose className="w-4 h-4" />
        )}
      </button>
    </motion.aside>
  );
}
