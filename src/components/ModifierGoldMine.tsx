import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Gem, ClipboardList, Sparkles } from "lucide-react";

const branchAttachRate = [
  { branch: "Verdun", rate: 60.4 },
  { branch: "Bir Hasan", rate: 53.0 },
  { branch: "Antelias", rate: 43.2 },
  { branch: "Raouche", rate: 42.0 },
  { branch: "Sour 2", rate: 41.1 },
  { branch: "Ramlet El Bayda", rate: 40.6 },
  { branch: "Khaldeh", rate: 39.3 },
  { branch: "LAU", rate: 38.8 },
  { branch: "Saida", rate: 35.7 },
  { branch: "Ain El Mreisseh", rate: 30.0 },
  { branch: "Zalka", rate: 24.8 },
];

const playbook = [
  { step: 1, text: "Train baristas on suggestive selling — \"Would you like to add a drizzle or upgrade to Yirgacheffe?\"" },
  { step: 2, text: "Add modifier prompts directly into POS system at checkout" },
  { step: 3, text: "\"Customize Your Drink\" menu boards at every register" },
  { step: 4, text: "Monthly barista competitions for best modifier attach rate" },
  { step: 5, text: "Stop giving away free modifiers — charge 5-10K per add-on" },
];

export default function ModifierGoldMine() {
  const { ref, isInView } = useInView(0.1);
  const goldCounter = useCountUp(16900000, 2000, 0, isInView);

  return (
    <section id="modifiers" className="section-warm py-24 md:py-32 relative overflow-hidden" ref={ref}>
      <div className="orb-glow orb-gold w-72 h-72 -bottom-36 -right-36" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="section-number">05 — Modifiers</div>
          <span className="section-badge mb-4">
            <Gem className="w-4 h-4" />
            Modifier Opportunity
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mt-5 tracking-tight">
            The Modifier Gold Mine
          </h2>
          <p className="section-subtitle">
            Extra shots, alternative milks, and drizzle toppings have 70-95% margins — but most branches barely sell them.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="card-3d gradient-border-glow"
          >
            <div className="mega-number text-5xl md:text-6xl text-gradient-gold mb-4">
              {(goldCounter / 1_000_000).toFixed(1)}M
            </div>
            <p className="text-lg font-display font-bold text-foreground mb-8">in untapped modifier upsell profit</p>
            <div className="space-y-4 text-sm text-muted-foreground">
              {[
                { label: "Modifier margins", value: "70–95%" },
                { label: "Yirgacheffe upgrade", value: "95% margin" },
                { label: "Drizzle toppings", value: "90% margin" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-accent shrink-0" />
                  <span>{item.label}: <strong className="text-foreground">{item.value}</strong></span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
            className="card-3d"
          >
            <h3 className="text-base font-display font-bold mb-1">Modifier Attach Rate by Branch</h3>
            <p className="text-xs text-muted-foreground mb-4">Percentage of drinks sold with at least one paid modifier</p>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={branchAttachRate} layout="vertical">
                <XAxis type="number" fontSize={11} tick={{ fill: "hsl(20 12% 42%)" }} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="branch" fontSize={11} width={110} tick={{ fill: "hsl(20 12% 42%)" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "white", border: "1px solid hsl(30 15% 88%)", borderRadius: "12px", fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                  formatter={(v: number) => [`${v}%`, "Attach Rate"]}
                />
                <Bar dataKey="rate" fill="hsl(32 95% 52%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
          className="card-3d gradient-border-glow max-w-3xl mx-auto"
        >
          <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-accent" />
            Strategy Playbook
          </h3>
          <div className="space-y-4">
            {playbook.map((item) => (
              <div key={item.step} className="flex gap-4 items-start group">
                <span className="w-9 h-9 rounded-lg bg-accent/10 text-accent text-sm font-bold flex items-center justify-center shrink-0 group-hover:bg-accent group-hover:text-white transition-all duration-300">
                  {item.step}
                </span>
                <p className="text-sm text-muted-foreground leading-relaxed pt-1.5">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
