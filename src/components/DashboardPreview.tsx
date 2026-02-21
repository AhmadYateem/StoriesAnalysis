import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { Monitor, BarChart3, Bot, Upload, Container, ExternalLink } from "lucide-react";

export default function DashboardPreview() {
  const { ref, isInView } = useInView(0.1);

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden" ref={ref}>
      <div className="orb-glow orb-gold w-72 h-72 top-10 -right-36" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="section-number">08 — Dashboard</div>
          <span className="section-badge mb-4">
            <Monitor className="w-4 h-4" />
            Live Dashboard
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mt-5 tracking-tight">
            Interactive Intelligence Platform
          </h2>
          <p className="section-subtitle">
            A reusable tool that accepts new CSV exports and generates fresh insights — no code changes needed.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 8 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 2 } : {}}
          transition={{ duration: 1.2, delay: 0.2, type: "spring", stiffness: 60 }}
          className="max-w-4xl mx-auto"
          style={{ perspective: 1200 }}
        >
          <div className="rounded-2xl overflow-hidden border border-border/60" style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)" }}>
            {/* Browser chrome */}
            <div className="bg-secondary/80 px-5 py-3 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 bg-background rounded-lg px-5 py-1.5 text-xs text-muted-foreground text-center font-medium">
                stories-coffee-insights.app
              </div>
            </div>
            {/* Dashboard mockup */}
            <div className="bg-background p-6">
              <div className="grid grid-cols-4 gap-3 mb-5">
                {["Revenue Overview", "Profit Analysis", "Branch Metrics", "AI Insights"].map((t) => (
                  <div key={t} className="bg-secondary/60 rounded-xl p-3.5">
                    <div className="h-2 w-16 bg-accent/20 rounded-full mb-2.5" />
                    <div className="h-8 bg-accent/8 rounded-lg" />
                    <div className="text-[10px] text-muted-foreground mt-2 font-medium">{t}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 bg-secondary/60 rounded-xl p-4 h-32">
                  <div className="h-2 w-28 bg-accent/20 rounded-full mb-3" />
                  <div className="h-full bg-accent/4 rounded-lg flex items-end gap-1 p-2.5">
                    {[40, 55, 35, 70, 85, 60, 90, 82, 75, 68, 80, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-sm"
                        style={{ background: `linear-gradient(to top, hsl(25 80% 28%), hsl(32 95% 52%))` }}
                        initial={{ height: 0 }}
                        animate={isInView ? { height: `${h}%` } : {}}
                        transition={{ duration: 0.8, delay: 0.8 + i * 0.05 }}
                      />
                    ))}
                  </div>
                </div>
                <div className="bg-secondary/60 rounded-xl p-4 h-32">
                  <div className="h-2 w-16 bg-accent/20 rounded-full mb-3" />
                  <div className="flex items-center justify-center h-full">
                    <motion.div
                      className="w-20 h-20 rounded-full"
                      style={{ border: "8px solid hsl(30 15% 90%)", borderTopColor: "hsl(32 95% 52%)" }}
                      animate={isInView ? { rotate: 360 } : {}}
                      transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, type: "spring" }}
          className="text-center mt-12"
        >
          <a href="#executive" className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-foreground text-background font-bold text-base hover:opacity-90 transition-all duration-300 hover:scale-[1.02] group" style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
            Explore Analysis
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8">
            {[
              { icon: BarChart3, label: "12 Sections" },
              { icon: Bot, label: "ML Models" },
              { icon: Upload, label: "Real Data" },
              { icon: Container, label: "Open Source" },
            ].map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-xs px-3.5 py-2 bg-secondary/80 rounded-lg text-muted-foreground font-semibold border border-border/50">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
