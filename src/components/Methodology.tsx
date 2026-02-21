import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { Cog, FileText, Sparkles, Database, Brain, LayoutDashboard, ArrowRight } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const techStack = ["Python", "React", "TypeScript", "Pandas", "NumPy", "scikit-learn", "Recharts", "Tailwind CSS"];

const dataSources = [
  { name: "Monthly Sales", rows: "48", desc: "Branch-level monthly revenue" },
  { name: "Product Profitability", rows: "13,089", desc: "Per-product cost & revenue" },
  { name: "Sales by Groups", rows: "12,199", desc: "Category-level aggregations" },
  { name: "Category Summary", rows: "75", desc: "High-level category metrics" },
];

const pipeline: { label: string; icon: LucideIcon }[] = [
  { label: "Raw CSVs", icon: FileText },
  { label: "Cleaning Pipeline", icon: Sparkles },
  { label: "Parquet Cache", icon: Database },
  { label: "Analysis + ML", icon: Brain },
  { label: "Interactive Website", icon: LayoutDashboard },
];

export default function Methodology() {
  const { ref, isInView } = useInView(0.1);

  return (
    <section className="animated-gradient-bg py-24 md:py-32 relative overflow-hidden noise-overlay" ref={ref}>
      <div className="orb-glow orb-gold w-64 h-64 bottom-10 -right-32 opacity-[0.06]" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="section-number-dark">09 — Methodology</div>
          <span className="section-badge mb-4 !bg-white/8 !text-amber-300 !border-white/10">
            <Cog className="w-4 h-4" />
            Under the Hood
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mt-5 tracking-tight text-white">
            Methodology & Architecture
          </h2>
          <p className="section-subtitle-dark">
            From raw POS exports to interactive platform — a fully reproducible pipeline built with modern tooling.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex flex-wrap justify-center gap-2.5 mb-14"
        >
          {techStack.map((tech, i) => (
            <motion.span
              key={tech}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.05, type: "spring" }}
              className="px-4 py-2 bg-white/6 backdrop-blur-sm border border-white/8 rounded-xl text-sm font-bold text-white/70 hover:bg-white/10 hover:border-white/15 transition-all duration-300 cursor-default"
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>

        {/* Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-14"
        >
          {pipeline.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="flex items-center gap-3 md:gap-4">
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/6 border border-white/8 flex items-center justify-center mb-2 hover:bg-white/10 transition-all duration-300">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-accent" />
                  </div>
                  <span className="text-[11px] text-white/40 font-semibold">{step.label}</span>
                </motion.div>
                {i < pipeline.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-white/15 mt-[-18px]" />
                )}
              </div>
            );
          })}
        </motion.div>

        {/* Data sources */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {dataSources.map((ds, i) => (
            <motion.div
              key={ds.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
              className="card-3d-dark"
            >
              <div className="text-sm font-bold mb-2 text-white/75">{ds.name}</div>
              <div className="mega-number text-3xl text-accent mb-2">{ds.rows}</div>
              <div className="text-xs text-white/35 font-medium">{ds.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
