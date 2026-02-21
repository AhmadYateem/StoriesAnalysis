import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts";
import { UtensilsCrossed, Star, Puzzle, Beef, Dog } from "lucide-react";
import { type LucideIcon } from "lucide-react";

const products = [
  { name: "Mango Yoghurt Combo S", volume: 93737, margin: 80.5, quadrant: "star" },
  { name: "Original Yoghurt Combo S", volume: 96077, margin: 77.4, quadrant: "star" },
  { name: "Water", volume: 588364, margin: 88.2, quadrant: "star" },
  { name: "Classic Cinnamon Roll L", volume: 81166, margin: 83.1, quadrant: "star" },
  { name: "Blueberry Yoghurt Combo S", volume: 62838, margin: 80.9, quadrant: "star" },
  { name: "Iced Latte M", volume: 85568, margin: 82.4, quadrant: "star" },
  { name: "Caramel Frapp M", volume: 72360, margin: 73.6, quadrant: "star" },
  { name: "Latte M", volume: 78083, margin: 77.7, quadrant: "star" },
  { name: "Black Coffee S", volume: 66752, margin: 68.3, quadrant: "plowhorse" },
  { name: "Brown Turkey & Cheese Sub", volume: 22236, margin: 70.0, quadrant: "plowhorse" },
  { name: "Lazy Cake", volume: 23790, margin: 53.5, quadrant: "plowhorse" },
  { name: "Cheese Croissant", volume: 28184, margin: 60.0, quadrant: "plowhorse" },
  { name: "Mocha Frapp M", volume: 22930, margin: 72.3, quadrant: "plowhorse" },
  { name: "Choc Yoghurt Combo XL", volume: 1509, margin: 77.2, quadrant: "puzzle" },
  { name: "Lotus Spread Yoghurt M", volume: 1577, margin: 82.6, quadrant: "puzzle" },
  { name: "Iced White Mocha", volume: 2076, margin: 87.0, quadrant: "puzzle" },
  { name: "Double Espresso Mac", volume: 2107, margin: 85.0, quadrant: "puzzle" },
  { name: "Matcha Cream Frapp L", volume: 2111, margin: 74.1, quadrant: "puzzle" },
  { name: "Asian Salad (Grab&Go)", volume: 1999, margin: 70.8, quadrant: "dog" },
  { name: "Quinoa Salad (Grab&Go)", volume: 2136, margin: 59.1, quadrant: "dog" },
  { name: "Pistachio Yoghurt Combo M", volume: 1720, margin: 34.4, quadrant: "dog" },
  { name: "Chicken Caesar Salad", volume: 1033, margin: 55.2, quadrant: "dog" },
  { name: "Signature Hot Choc L", volume: 1887, margin: 66.5, quadrant: "dog" },
];

const quadrantColors: Record<string, string> = {
  star: "hsl(152 65% 42%)",
  puzzle: "hsl(210 80% 55%)",
  plowhorse: "hsl(32 95% 52%)",
  dog: "hsl(0 80% 55%)",
};

const quadrants: { icon: LucideIcon; name: string; desc: string; color: string; items: string[] }[] = [
  { icon: Star, name: "Stars (124)", desc: "Promote Aggressively", color: "text-success", items: ["Mango Yoghurt Combo", "Iced Latte", "Water", "Classic Cinnamon Roll"] },
  { icon: Puzzle, name: "Puzzles (81)", desc: "Market More", color: "text-blue-500", items: ["Iced White Mocha (87%)", "Double Espresso Mac", "Lotus Spread Yoghurt"] },
  { icon: Beef, name: "Plowhorses (81)", desc: "Reprice or Optimize", color: "text-accent", items: ["Black Coffee", "Lazy Cake (53.5%)", "Cheese Croissant"] },
  { icon: Dog, name: "Dogs (123)", desc: "Consider Removing", color: "text-destructive", items: ["Pistachio Yoghurt Combo", "Chicken Caesar Salad", "Quinoa Salad"] },
];

export default function MenuEngineering() {
  const { ref, isInView } = useInView(0.1);

  return (
    <section id="menu-engineering" className="animated-gradient-bg py-24 md:py-32 relative overflow-hidden noise-overlay" ref={ref}>
      <div className="orb-glow orb-gold w-80 h-80 -bottom-40 -right-40 opacity-[0.08]" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="section-number-dark">04 — Menu Matrix</div>
          <span className="section-badge mb-4 !bg-white/8 !text-amber-300 !border-white/10">
            <UtensilsCrossed className="w-4 h-4" />
            Menu Engineering
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mt-5 tracking-tight text-white">
            409 Products Classified
          </h2>
          <p className="section-subtitle-dark">
            Every product mapped by volume and margin to identify Stars to promote, Dogs to cut, and Puzzles to unlock.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
          className="card-3d-dark mb-10"
        >
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="volume" type="number" name="Volume" fontSize={11}
                tick={{ fill: "rgba(255,255,255,0.35)" }}
                label={{ value: "Volume →", position: "bottom", fill: "rgba(255,255,255,0.35)", fontSize: 12 }}
              />
              <YAxis dataKey="margin" type="number" name="Margin" fontSize={11}
                tick={{ fill: "rgba(255,255,255,0.35)" }}
                label={{ value: "Margin % →", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.35)", fontSize: 12 }}
              />
              <ReferenceLine y={72.4} stroke="rgba(255,255,255,0.1)" strokeDasharray="8 4" strokeWidth={2} />
              <ReferenceLine x={2144} stroke="rgba(255,255,255,0.1)" strokeDasharray="8 4" strokeWidth={2} />
              <Tooltip
                contentStyle={{ backgroundColor: "hsl(20 60% 6%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 13, color: "white", fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
                formatter={(value: number, name: string) => [name === "volume" ? value.toLocaleString() : `${value}%`, name === "volume" ? "Volume" : "Margin"]}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ""}
              />
              <Scatter data={products}>
                {products.map((p, i) => (
                  <Cell key={i} fill={quadrantColors[p.quadrant]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quadrants.map((q, i) => {
            const Icon = q.icon;
            return (
              <motion.div
                key={q.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.1, type: "spring" }}
                className="card-3d-dark"
              >
                <div className="w-11 h-11 rounded-xl bg-white/8 flex items-center justify-center mb-4">
                  <Icon className={`w-5 h-5 ${q.color}`} />
                </div>
                <h4 className={`font-display font-bold text-lg ${q.color} mb-1`}>{q.name}</h4>
                <p className="text-[11px] text-white/30 mb-1 font-semibold uppercase tracking-wider">Action: {q.desc}</p>
                <div className="mt-3 pt-3 border-t border-white/[0.06]">
                  <p className="text-[10px] text-white/25 font-bold uppercase tracking-wider mb-2">Top Products</p>
                  <ul className="space-y-1.5">
                    {q.items.map((item) => (
                      <li key={item} className="text-sm text-white/55 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/25 mt-1.5 shrink-0" />
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
    </section>
  );
}
