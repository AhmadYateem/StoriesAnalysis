import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { Crosshair, Coins, Rocket, BarChart3, PartyPopper } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const radarData = [
  { axis: "Revenue", cashCow: 87, cashCow2: 27, growth: 22, event: 0 },
  { axis: "Growth", cashCow: 28, cashCow2: 26, growth: 100, event: 100 },
  { axis: "Margin", cashCow: 21, cashCow2: 19, growth: 30, event: 100 },
  { axis: "Bev Mix", cashCow: 34, cashCow2: 23, growth: 30, event: 100 },
  { axis: "Seasonality", cashCow: 3, cashCow2: 11, growth: 11, event: 100 },
  { axis: "Efficiency", cashCow: 87, cashCow2: 32, growth: 44, event: 0 },
];

const clusters: { name: string; icon: LucideIcon; color: string; cssColor: string; bg: string; branches: string[]; metrics: string; strategy: string }[] = [
  {
    name: "Cash Cows",
    icon: Coins,
    color: "hsl(32 95% 52%)",
    cssColor: "text-accent",
    bg: "bg-accent/8",
    branches: ["Ain El Mreisseh", "Zalka", "Khaldeh"],
    metrics: "Avg Revenue: 104M | Margin: 71.0%",
    strategy: "Maximize throughput, protect margins. These are your profit engines — focus on modifier upsells and operational efficiency.",
  },
  {
    name: "Established",
    icon: BarChart3,
    color: "hsl(210 80% 55%)",
    cssColor: "text-blue-500",
    bg: "bg-blue-500/8",
    branches: ["Batroun", "Bayada", "Le Mall", "Centro Mall", "Bir Hasan", "Antelias", "Saida", "Verdun", "Sin El Fil", "Amioun", "LAU", "Unknown (Closed)", "Faqra"],
    metrics: "Avg Revenue: 32M | Margin: 70.9%",
    strategy: "Maintain performance. Focus on operational efficiency, push high-margin products, and drive modifier training to boost margins.",
  },
  {
    name: "Growth Engines",
    icon: Rocket,
    color: "hsl(152 65% 42%)",
    cssColor: "text-success",
    bg: "bg-success/8",
    branches: ["Airport", "Ramlet El Bayda", "Aley", "Mansourieh", "Jbeil", "Sour 2", "Raouche", "Kaslik"],
    metrics: "Avg Revenue: 27M | Growth: +100%",
    strategy: "Invest in marketing and full product range. These branches are growing fast — accelerate with modifier training and staffing optimisation.",
  },
  {
    name: "Event/Specialty",
    icon: PartyPopper,
    color: "hsl(270 60% 55%)",
    cssColor: "text-purple-500",
    bg: "bg-purple-500/8",
    branches: ["Event Starco"],
    metrics: "Revenue: 0.6M | Margin: 76.0%",
    strategy: "Event-driven model. Different KPIs — focus on per-event profitability and booking frequency. Highest margin in the chain.",
  },
];

export default function BranchClustering() {
  const { ref, isInView } = useInView(0.1);

  return (
    <section id="clusters" className="section-warm py-24 md:py-32 relative overflow-hidden" ref={ref}>
      <div className="orb-glow orb-amber w-72 h-72 -top-36 -left-36" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="section-number">07 — Clusters</div>
          <span className="section-badge mb-4">
            <Crosshair className="w-4 h-4" />
            ML Clustering
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mt-5 tracking-tight">
            4 Strategic Segments
          </h2>
          <p className="section-subtitle">
            KMeans clustering groups 25 branches into actionable segments by revenue, growth, margin, and product mix.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 5 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
          className="card-3d mb-10 max-w-3xl mx-auto"
          style={{ perspective: 1000 }}
        >
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(30 15% 88%)" strokeWidth={1} />
              <PolarAngleAxis dataKey="axis" fontSize={12} tick={{ fill: "hsl(20 12% 42%)", fontWeight: 600 }} />
              <Radar name="Cash Cows" dataKey="cashCow" stroke="hsl(32 95% 52%)" fill="hsl(32 95% 52%)" fillOpacity={0.12} strokeWidth={2.5} />
              <Radar name="Established" dataKey="cashCow2" stroke="hsl(210 80% 55%)" fill="hsl(210 80% 55%)" fillOpacity={0.06} strokeWidth={2.5} />
              <Radar name="Growth Engines" dataKey="growth" stroke="hsl(152 65% 42%)" fill="hsl(152 65% 42%)" fillOpacity={0.08} strokeWidth={2.5} />
              <Radar name="Event" dataKey="event" stroke="hsl(270 60% 55%)" fill="hsl(270 60% 55%)" fillOpacity={0.06} strokeWidth={2.5} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {clusters.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.1, type: "spring" }}
                className="card-3d"
              >
                {/* Cluster header */}
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${c.cssColor}`} />
                  </div>
                  <div>
                    <h4 className={`font-display font-bold text-lg ${c.cssColor} leading-tight`}>{c.name}</h4>
                    <p className="text-[11px] text-muted-foreground font-medium">{c.branches.length} branch{c.branches.length !== 1 ? "es" : ""}</p>
                  </div>
                </div>

                {/* Key metrics */}
                <div className="mt-4 p-3 bg-secondary/50 rounded-xl border border-border/30">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/50 mb-1.5">Key Metrics</div>
                  <p className="text-xs text-foreground font-semibold">{c.metrics}</p>
                </div>

                {/* Branches in cluster */}
                <div className="mt-4">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/50 mb-2">Branches in This Cluster</div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.branches.slice(0, 5).map((b) => (
                      <span key={b} className={`text-xs px-2.5 py-1 rounded-lg ${c.bg} ${c.cssColor} font-semibold`}>{b}</span>
                    ))}
                    {c.branches.length > 5 && (
                      <span className="text-xs text-muted-foreground font-medium self-center">+{c.branches.length - 5} more</span>
                    )}
                  </div>
                </div>

                {/* Strategy recommendation */}
                <div className="mt-4 pt-4 border-t border-border/40">
                  <div className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground/50 mb-1.5">Recommended Strategy</div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.strategy}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
