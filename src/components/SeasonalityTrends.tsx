import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts";
import { TrendingUp, TrendingDown, Activity, Key } from "lucide-react";

const monthlyData = [
  { month: "Jan", revenue: 73.6 },
  { month: "Feb", revenue: 67.5 },
  { month: "Mar", revenue: 75.4 },
  { month: "Apr", revenue: 108.7 },
  { month: "May", revenue: 44.5 },
  { month: "Jun", revenue: 18.4 },
  { month: "Jul", revenue: 89.6 },
  { month: "Aug", revenue: 109.4 },
  { month: "Sep", revenue: 91.8 },
  { month: "Oct", revenue: 96.6 },
  { month: "Nov", revenue: 86.7 },
  { month: "Dec", revenue: 85.7 },
];

const heatmapBranches = [
  "Ain El Mreisseh", "Zalka", "Khaldeh", "Ramlet El Bayda", "Saida",
  "Batroun", "Bayada", "Le Mall", "Airport", "Centro Mall",
  "Bir Hasan", "Antelias", "Aley",
];

const branchMonthlyRaw: Record<string, number[]> = {
  "Ain El Mreisseh": [12648547, 9929973, 9849927, 13025923, 7208975, 2883403, 11889329, 11610098, 11021124, 10516784, 9387783, 9640996],
  "Zalka": [10449007, 8417640, 10840107, 11182530, 6433973, 2504900, 10265530, 10774439, 9882170, 9775940, 8876666, 8566292],
  "Khaldeh": [7468155, 6108429, 6420841, 8455732, 4487118, 2262395, 9464292, 10661996, 7859844, 7348415, 6744352, 6874043],
  "Ramlet El Bayda": [0, 1570807, 3588563, 6011885, 3542743, 1445760, 7427540, 7668110, 6585103, 6435859, 5863676, 5944644],
  "Saida": [7263332, 5121351, 4684911, 6361154, 3010782, 1323360, 5939826, 5925561, 4245092, 3639435, 3665841, 3825644],
  "Batroun": [4266517, 3388117, 4890198, 5516882, 2963980, 1311240, 6135003, 6751770, 5041151, 4372226, 4272668, 5163712],
  "Bayada": [4497377, 3419107, 5083387, 5196907, 3043400, 1208190, 5448610, 5613039, 4917258, 5224336, 4588470, 4403458],
  "Le Mall": [3881015, 3772587, 4220770, 4428620, 2163877, 967783, 4986426, 5452826, 4201889, 3807124, 3984059, 5003541],
  "Airport": [0, 0, 0, 0, 0, 8429, 2940003, 6963426, 7467198, 8414673, 7029720, 6604829],
  "Centro Mall": [3264533, 2944807, 2218467, 3937167, 1955287, 924383, 4201340, 4307333, 3232538, 3059646, 3497555, 3998663],
  "Bir Hasan": [3355705, 2842994, 2266051, 3459980, 2125379, 744638, 3799740, 3783898, 3255936, 3128529, 2851287, 2743088],
  "Antelias": [2615854, 2139011, 3162717, 3391741, 2033636, 728978, 2963697, 3182364, 2909965, 2715153, 2551353, 2234760],
  "Aley": [0, 0, 0, 0, 0, 0, 4219345, 8565845, 5397296, 4503168, 4071091, 3739481],
};

const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

function getHeatValue(branch: string, monthIdx: number) {
  const data = branchMonthlyRaw[branch];
  if (!data) return 0;
  const max = Math.max(...data);
  if (max === 0) return 0;
  return data[monthIdx] / max;
}

function HeatCell({ value }: { value: number }) {
  const alpha = Math.max(0.05, value);
  return (
    <div
      className="w-full aspect-square rounded-[4px] transition-all duration-300 hover:scale-125 hover:z-10 hover:shadow-lg"
      style={{
        backgroundColor: value === 0
          ? "hsl(30 15% 93%)"
          : `hsl(25 ${30 + value * 60}% ${92 - value * 52}%)`,
        opacity: value === 0 ? 0.5 : 1,
      }}
      title={`${(value * 100).toFixed(0)}%`}
    />
  );
}

export default function SeasonalityTrends() {
  const { ref, isInView } = useInView(0.1);

  return (
    <section id="seasonality" className="py-24 md:py-32 bg-background relative overflow-hidden" ref={ref}>
      <div className="orb-glow orb-amber w-72 h-72 top-20 -right-36" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-16"
        >
          <div className="section-number">02 — Seasonality</div>
          <span className="section-badge mb-4">
            <Activity className="w-4 h-4" />
            Seasonality & Trends
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mt-5 tracking-tight">
            Monthly Revenue Patterns
          </h2>
          <p className="section-subtitle">
            Revenue swings 5.9× between peak and trough — Ramadan and summer drive massive seasonality across all branches.
          </p>
          <div className="section-divider mt-6" />
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-6 mb-14">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="lg:col-span-3 card-3d"
          >
            <h3 className="text-base font-display font-bold mb-1 text-foreground">Monthly Revenue 2025</h3>
            <p className="text-xs text-muted-foreground mb-5">Aggregated across all 25 branches (values in millions)</p>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 92%)" />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: "hsl(20 12% 42%)" }} />
                <YAxis fontSize={12} tick={{ fill: "hsl(20 12% 42%)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid hsl(30 15% 88%)",
                    borderRadius: "12px",
                    fontSize: 13,
                    fontWeight: 600,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  }}
                  formatter={(v: number) => [`${v}M`, "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(25 80% 28%)"
                  strokeWidth={3}
                  dot={{ fill: "hsl(25 80% 28%)", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 7, fill: "hsl(32 95% 52%)", strokeWidth: 3, stroke: "white" }}
                />
                <ReferenceDot x="Aug" y={109.4} r={8} fill="hsl(152 65% 42%)" stroke="white" strokeWidth={3} />
                <ReferenceDot x="Jun" y={18.4} r={8} fill="hsl(0 80% 55%)" stroke="white" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
            className="lg:col-span-2 card-3d gradient-border-glow"
          >
            <h3 className="text-base font-display font-bold mb-6 flex items-center gap-2">
              <Key className="w-4 h-4 text-accent" />
              Seasonality Insights
            </h3>
            <div className="space-y-5 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4 text-success" />
                </div>
                <span><strong className="text-foreground">Peak:</strong> August (~109.4M)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                </div>
                <span><strong className="text-foreground">Trough:</strong> June (~18.4M)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 text-accent" />
                </div>
                <span><strong className="text-foreground">Peak/Trough Ratio:</strong> 5.9×</span>
              </div>
              <div className="mt-4 p-4 bg-secondary/60 rounded-xl text-muted-foreground leading-relaxed text-[13px] border border-border/50">
                June shows ~83% drop from peak, likely Ramadan. This is the #1 seasonality risk. Summer months (Jul–Aug) drive highest revenue consistently across branches.
              </div>
            </div>
          </motion.div>
        </div>

        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5, type: "spring" }}
          className="card-3d"
        >
          <h3 className="text-base font-display font-bold mb-1">Branch × Month Revenue Heatmap</h3>
          <p className="text-xs text-muted-foreground mb-5">Each row normalized to its own peak — darker = closer to that branch's best month</p>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid gap-1" style={{ gridTemplateColumns: "140px repeat(12, 1fr)" }}>
                <div />
                {months.map((m, i) => (
                  <div key={`${m}-${i}`} className="text-center text-xs font-bold text-muted-foreground">{m}</div>
                ))}
              </div>
              {heatmapBranches.map((branch) => (
                <div key={branch} className="grid gap-1 mt-1" style={{ gridTemplateColumns: "140px repeat(12, 1fr)" }}>
                  <div className="text-xs font-semibold text-muted-foreground truncate flex items-center">{branch}</div>
                  {months.map((_, mIdx) => (
                    <HeatCell key={mIdx} value={getHeatValue(branch, mIdx)} />
                  ))}
                </div>
              ))}
              <div className="flex items-center gap-2 mt-5 justify-end">
                <span className="text-xs font-semibold text-muted-foreground">Low</span>
                <div className="flex gap-0.5">
                  {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
                    <div key={v} className="w-6 h-4 rounded-[3px]" style={{ backgroundColor: `hsl(25 ${30 + v * 60}% ${92 - v * 52}%)` }} />
                  ))}
                </div>
                <span className="text-xs font-semibold text-muted-foreground">High</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
