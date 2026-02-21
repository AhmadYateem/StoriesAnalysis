/**
 * Default analysis data for Stories Coffee.
 *
 * This file holds ALL the hardcoded constants that were previously scattered
 * across individual components. When a user uploads new CSV files and the
 * backend/fallback parser processes them, the result replaces this data
 * via DataContext — every chart automatically picks up the new values.
 */

import type { AnalysisData } from "./types";

const DEFAULT_DATA: AnalysisData = {

  /* ─────────────── Dataset label ─────────────── */
  datasetName: "Stories Coffee · Full Year 2025",

  /* ─────────────── KPI cards ─────────────── */
  kpis: [
    { icon: "DollarSign",    label: "Total Revenue",       value: 840458583,  subtext: "Full Year 2025",       format: "currency" },
    { icon: "TrendingUp",    label: "Total Profit",        value: 598228696,  subtext: "71.2% margin",         format: "currency" },
    { icon: "BarChart3",     label: "Avg Profit Margin",   value: 71.2,       subtext: "Chain-wide weighted",  format: "percent" },
    { icon: "Store",         label: "Active Branches",     value: 25,         subtext: "Across Lebanon",       format: "number" },
    { icon: "ShoppingCart",  label: "Total Items Sold",    value: 6539335,    subtext: "2025 volume",          format: "number" },
    { icon: "Coffee",        label: "Unique Products",     value: 551,        subtext: "Beverages + Food",     format: "number" },
    { icon: "Rocket",        label: "2026 Forecast",       value: 1056960141, subtext: "+26% YoY growth",      format: "currency" },
    { icon: "AlertTriangle", label: "Margin Leaks Found",  value: 62013109,   subtext: "Recoverable profit",   format: "currency", isAlert: true },
  ],

  /* ─────────────── Branch rankings ─────────────── */
  topBranches: [
    { rank: 1, name: "Ain El Mreisseh", revenue: "119.6M" },
    { rank: 2, name: "Zalka",           revenue: "108.0M" },
    { rank: 3, name: "Khaldeh",         revenue: "84.2M" },
    { rank: 4, name: "Ramlet El Bayda", revenue: "56.1M" },
    { rank: 5, name: "Saida",           revenue: "55.0M" },
  ],
  bottomBranches: [
    { rank: 21, name: "Unknown (Closed)", revenue: "13.9M" },
    { rank: 22, name: "Faqra",            revenue: "11.0M" },
    { rank: 23, name: "Raouche",          revenue: "9.1M" },
    { rank: 24, name: "Kaslik",           revenue: "5.6M" },
    { rank: 25, name: "Event Starco",     revenue: "0.6M" },
  ],

  /* ─────────────── Monthly revenue (chain-wide, millions) ─────────────── */
  monthlyRevenue: [
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
  ],

  /* ─────────────── Branch × Month heatmap ─────────────── */
  heatmapBranches: [
    "Ain El Mreisseh", "Zalka", "Khaldeh", "Ramlet El Bayda", "Saida",
    "Batroun", "Bayada", "Le Mall", "Airport", "Centro Mall",
    "Bir Hasan", "Antelias", "Aley",
  ],
  branchMonthly: {
    "Ain El Mreisseh": [12648547, 9929973, 9849927, 13025923, 7208975, 2883403, 11889329, 11610098, 11021124, 10516784, 9387783, 9640996],
    "Zalka":           [10449007, 8417640, 10840107, 11182530, 6433973, 2504900, 10265530, 10774439, 9882170, 9775940, 8876666, 8566292],
    "Khaldeh":         [7468155, 6108429, 6420841, 8455732, 4487118, 2262395, 9464292, 10661996, 7859844, 7348415, 6744352, 6874043],
    "Ramlet El Bayda": [0, 1570807, 3588563, 6011885, 3542743, 1445760, 7427540, 7668110, 6585103, 6435859, 5863676, 5944644],
    "Saida":           [7263332, 5121351, 4684911, 6361154, 3010782, 1323360, 5939826, 5925561, 4245092, 3639435, 3665841, 3825644],
    "Batroun":         [4266517, 3388117, 4890198, 5516882, 2963980, 1311240, 6135003, 6751770, 5041151, 4372226, 4272668, 5163712],
    "Bayada":          [4497377, 3419107, 5083387, 5196907, 3043400, 1208190, 5448610, 5613039, 4917258, 5224336, 4588470, 4403458],
    "Le Mall":         [3881015, 3772587, 4220770, 4428620, 2163877, 967783, 4986426, 5452826, 4201889, 3807124, 3984059, 5003541],
    "Airport":         [0, 0, 0, 0, 0, 8429, 2940003, 6963426, 7467198, 8414673, 7029720, 6604829],
    "Centro Mall":     [3264533, 2944807, 2218467, 3937167, 1955287, 924383, 4201340, 4307333, 3232538, 3059646, 3497555, 3998663],
    "Bir Hasan":       [3355705, 2842994, 2266051, 3459980, 2125379, 744638, 3799740, 3783898, 3255936, 3128529, 2851287, 2743088],
    "Antelias":        [2615854, 2139011, 3162717, 3391741, 2033636, 728978, 2963697, 3182364, 2909965, 2715153, 2551353, 2234760],
    "Aley":            [0, 0, 0, 0, 0, 0, 4219345, 8565845, 5397296, 4503168, 4071091, 3739481],
  },

  /* ─────────────── Margin leak waterfall ─────────────── */
  waterfallData: [
    { name: "Negative Margin Products", value: -30.1, color: "hsl(0 80% 55%)" },
    { name: "Zero-Revenue Modifiers",   value: -28.1, color: "hsl(0 80% 55%)" },
    { name: "Cheesecake Low Margins",    value: -2.1,  color: "hsl(25 80% 42%)" },
    { name: "Veggie Sub Mispricing",     value: -1.7,  color: "hsl(25 80% 42%)" },
    { name: "Amioun TABLE POS Error",    value: -0.049,color: "hsl(38 95% 50%)" },
  ],

  /* ─────────────── Margin leak detail cards ─────────────── */
  leakCards: [
    {
      icon: "TrendingDown",
      title: "Negative Margin Products",
      amount: "30.1M",
      amountRaw: 30100000,
      detail: "1,197 products sold below cost across all branches — highest loss category.",
      severity: "critical",
      rootCause: "47 distinct products have cost-of-goods that exceed their selling price. Most are leftover promotional prices that were never reverted, or items whose ingredient costs rose while menu prices stayed flat.",
      recommendation: "Reprice or discontinue immediately. Run a weekly automated margin check against COGS to catch future drift.",
    },
    {
      icon: "Gift",
      title: "Free Modifiers Bleeding Cash",
      amount: "28.1M",
      amountRaw: 28100000,
      detail: "Decaf shots, lactose-free milk, oat milk, almond milk, and other premium add-ons are recorded at zero price but carry real ingredient costs — absorbing 28.1M per year.",
      severity: "critical",
      rootCause: "Three contributing factors:\n\n1. POS Default Configuration — The system was set up with modifiers at $0 because the original drink pricing was designed to absorb basic add-on costs. But premium alternatives (oat milk costs 3–5× regular milk) were added later without updating the price.\n\n2. Competitive Positioning — Many Lebanese coffee chains (and global ones like Starbucks) charge premiums for alt-milk. Stories may have kept them free as a differentiator, but at 28.1M/year, the 'free upgrade' strategy costs far more than the customer loyalty it generates.\n\n3. Staff Training Gap — Baristas add modifiers via POS without being prompted for an upcharge. The system doesn't flag zero-priced high-cost items.",
      recommendation: "Implement a tiered modifier pricing strategy:\n• Regular modifiers (sugar, ice level): Stay free\n• Premium modifiers (oat milk, almond milk, extra shots): Charge 30–50% of cost\n• Ultra-premium (Yirgacheffe upgrade, specialty syrups): Charge 50–70% of cost\n\nProjected recovery: 8.4M–14.1M annually at 30–50% recapture rate.",
    },
    {
      icon: "CakeSlice",
      title: "Cheesecake Underpricing",
      amount: "2.1M",
      amountRaw: 2100000,
      detail: "34.4% margin vs 63% food category average — a 28.7pt gap across 20,068 units sold.",
      severity: "warning",
      rootCause: "Cheesecake items were priced based on competitor benchmarks rather than the internal cost structure. Ingredient costs (cream cheese, imported bases) are higher than other desserts, but the selling price doesn't reflect this.",
      recommendation: "Raise prices 15–20% to close the gap with food category average. A 15% increase on 20,068 units recovers the full 2.1M.",
    },
    {
      icon: "Leaf",
      title: "Veggie Sub Crisis",
      amount: "1.7M",
      amountRaw: 1700000,
      detail: "31,840 units sold at ~7/unit vs cost of ~60/unit. Every single sale destroys profit.",
      severity: "critical",
      rootCause: "Likely a POS data-entry error where the price was set to 7 instead of 70+ per unit. The cost structure is consistent with other subs (~60/unit), so the issue is entirely on the pricing side.",
      recommendation: "Fix POS pricing immediately to benchmark (~376/unit, matching other subs). Audit all product prices against a cost-plus-target-margin formula.",
    },
    {
      icon: "Monitor",
      title: "Amioun POS Error",
      amount: "49K",
      amountRaw: 49000,
      detail: "Systematic TABLE service undercharging at Amioun branch — multiple products priced wrong for dine-in.",
      severity: "info",
      rootCause: "TABLE service type at Amioun has different (lower) prices than TAKE AWAY for the same items, suggesting the POS profile was misconfigured or copied incorrectly from another branch.",
      recommendation: "Audit and correct Amioun TABLE pricing to match the chain-wide standard.",
    },
  ],

  /* ─────────────── Free modifier breakdown (top 10 by cost absorbed) ─────────────── */
  freeModifiers: [
    { product: "ADD Oat Milk",          quantity: 184320, absorbedCost: 7372800, suggestedCharge: 12, recoverable: 2211840 },
    { product: "ADD Almond Milk",       quantity: 156200, absorbedCost: 5467000, suggestedCharge: 10, recoverable: 1562000 },
    { product: "ADD Decaf Shot",        quantity: 142850, absorbedCost: 4285500, suggestedCharge: 10, recoverable: 1428500 },
    { product: "ADD Lactose Free Milk", quantity: 128400, absorbedCost: 3852000, suggestedCharge: 10, recoverable: 1284000 },
    { product: "ADD Coconut Milk",      quantity: 89600,  absorbedCost: 2688000, suggestedCharge: 10, recoverable: 896000 },
    { product: "REPLACE Skimmed Milk",  quantity: 76500,  absorbedCost: 1530000, suggestedCharge: 5,  recoverable: 382500 },
    { product: "ADD Sugar Free Syrup",  quantity: 63200,  absorbedCost: 948000,  suggestedCharge: 8,  recoverable: 505600 },
    { product: "ADD Whipped Cream",     quantity: 54800,  absorbedCost: 822000,  suggestedCharge: 5,  recoverable: 274000 },
    { product: "ADD Extra Shot",        quantity: 48900,  absorbedCost: 733500,  suggestedCharge: 10, recoverable: 489000 },
    { product: "ADD Caramel Drizzle",   quantity: 35400,  absorbedCost: 354000,  suggestedCharge: 5,  recoverable: 177000 },
  ],

  /* ─────────────── Menu engineering scatter ─────────────── */
  menuProducts: [
    { name: "Mango Yoghurt Combo S",     volume: 93737,  margin: 80.5, quadrant: "star" },
    { name: "Original Yoghurt Combo S",  volume: 96077,  margin: 77.4, quadrant: "star" },
    { name: "Water",                      volume: 588364, margin: 88.2, quadrant: "star" },
    { name: "Classic Cinnamon Roll L",   volume: 81166,  margin: 83.1, quadrant: "star" },
    { name: "Blueberry Yoghurt Combo S", volume: 62838,  margin: 80.9, quadrant: "star" },
    { name: "Iced Latte M",             volume: 85568,  margin: 82.4, quadrant: "star" },
    { name: "Caramel Frapp M",          volume: 72360,  margin: 73.6, quadrant: "star" },
    { name: "Latte M",                  volume: 78083,  margin: 77.7, quadrant: "star" },
    { name: "Black Coffee S",           volume: 66752,  margin: 68.3, quadrant: "plowhorse" },
    { name: "Brown Turkey & Cheese Sub", volume: 22236,  margin: 70.0, quadrant: "plowhorse" },
    { name: "Lazy Cake",                volume: 23790,  margin: 53.5, quadrant: "plowhorse" },
    { name: "Cheese Croissant",         volume: 28184,  margin: 60.0, quadrant: "plowhorse" },
    { name: "Mocha Frapp M",            volume: 22930,  margin: 72.3, quadrant: "plowhorse" },
    { name: "Choc Yoghurt Combo XL",    volume: 1509,   margin: 77.2, quadrant: "puzzle" },
    { name: "Lotus Spread Yoghurt M",   volume: 1577,   margin: 82.6, quadrant: "puzzle" },
    { name: "Iced White Mocha",         volume: 2076,   margin: 87.0, quadrant: "puzzle" },
    { name: "Double Espresso Mac",      volume: 2107,   margin: 85.0, quadrant: "puzzle" },
    { name: "Matcha Cream Frapp L",     volume: 2111,   margin: 74.1, quadrant: "puzzle" },
    { name: "Asian Salad (Grab&Go)",    volume: 1999,   margin: 70.8, quadrant: "dog" },
    { name: "Quinoa Salad (Grab&Go)",   volume: 2136,   margin: 59.1, quadrant: "dog" },
    { name: "Pistachio Yoghurt Combo M",volume: 1720,   margin: 34.4, quadrant: "dog" },
    { name: "Chicken Caesar Salad",     volume: 1033,   margin: 55.2, quadrant: "dog" },
    { name: "Signature Hot Choc L",     volume: 1887,   margin: 66.5, quadrant: "dog" },
  ],

  quadrants: [
    { name: "Stars (124)",      icon: "Star",   desc: "Promote Aggressively", color: "text-success",     items: ["Mango Yoghurt Combo", "Iced Latte", "Water", "Classic Cinnamon Roll"] },
    { name: "Puzzles (81)",     icon: "Puzzle", desc: "Market More",          color: "text-blue-500",    items: ["Iced White Mocha (87%)", "Double Espresso Mac", "Lotus Spread Yoghurt"] },
    { name: "Plowhorses (81)",  icon: "Beef",   desc: "Reprice or Optimize",  color: "text-accent",      items: ["Black Coffee", "Lazy Cake (53.5%)", "Cheese Croissant"] },
    { name: "Dogs (123)",       icon: "Dog",    desc: "Consider Removing",    color: "text-destructive", items: ["Pistachio Yoghurt Combo", "Chicken Caesar Salad", "Quinoa Salad"] },
  ],

  /* ─────────────── Modifier attach rates ─────────────── */
  modifierAttachRates: [
    { branch: "Verdun",          rate: 60.4 },
    { branch: "Bir Hasan",       rate: 53.0 },
    { branch: "Antelias",        rate: 43.2 },
    { branch: "Raouche",         rate: 42.0 },
    { branch: "Sour 2",          rate: 41.1 },
    { branch: "Ramlet El Bayda", rate: 40.6 },
    { branch: "Khaldeh",         rate: 39.3 },
    { branch: "LAU",             rate: 38.8 },
    { branch: "Saida",           rate: 35.7 },
    { branch: "Ain El Mreisseh", rate: 30.0 },
    { branch: "Zalka",           rate: 24.8 },
  ],

  modifierPlaybook: [
    { step: 1, text: "Train baristas on suggestive selling — \"Would you like to add a drizzle or upgrade to Yirgacheffe?\"" },
    { step: 2, text: "Add modifier prompts directly into POS system at checkout" },
    { step: 3, text: "\"Customize Your Drink\" menu boards at every register" },
    { step: 4, text: "Monthly barista competitions for best modifier attach rate" },
    { step: 5, text: "Stop giving away free modifiers — charge 5–10K per add-on" },
  ],

  /* ─────────────── Forecast data ─────────────── */
  forecastData: [
    { month: "Jan", actual: 73.6,  forecast: 62.5,  low: 52.0,  high: 73.0 },
    { month: "Feb", actual: 67.5,  forecast: 68.4,  low: 58.0,  high: 78.8 },
    { month: "Mar", actual: 75.4,  forecast: 74.1,  low: 63.7,  high: 84.5 },
    { month: "Apr", actual: 108.7, forecast: 97.2,  low: 86.8,  high: 107.6 },
    { month: "May", actual: 44.5,  forecast: 83.3,  low: 72.9,  high: 93.7 },
    { month: "Jun", actual: 18.4,  forecast: 62.3,  low: 51.9,  high: 72.7 },
    { month: "Jul", actual: 89.6,  forecast: 110.4, low: 100.0, high: 120.8 },
    { month: "Aug", actual: 109.4, forecast: 123.9, low: 113.5, high: 134.3 },
    { month: "Sep", actual: 91.8,  forecast: 101.1, low: 90.7,  high: 111.5 },
    { month: "Oct", actual: 96.6,  forecast: 104.7, low: 94.3,  high: 115.1 },
    { month: "Nov", actual: 86.7,  forecast: 98.2,  low: 87.8,  high: 108.6 },
    { month: "Dec", actual: 85.7,  forecast: 97.9,  low: 87.5,  high: 108.3 },
  ],

  topForecasts: [
    { branch: "Ain El Mreisseh", projected: "86.8M", growth: "-27%" },
    { branch: "Sin El Fil",      projected: "84.5M", growth: "+310%" },
    { branch: "Zalka",           projected: "80.1M", growth: "-26%" },
    { branch: "Amioun",          projected: "75.2M", growth: "+285%" },
    { branch: "Khaldeh",         projected: "72.8M", growth: "-14%" },
  ],

  /* ─────────────── Branch clustering ─────────────── */
  radarData: [
    { axis: "Revenue",     cashCow: 87, cashCow2: 27, growth: 22, event: 0 },
    { axis: "Growth",      cashCow: 28, cashCow2: 26, growth: 100, event: 100 },
    { axis: "Margin",      cashCow: 21, cashCow2: 19, growth: 30, event: 100 },
    { axis: "Bev Mix",     cashCow: 34, cashCow2: 23, growth: 30, event: 100 },
    { axis: "Seasonality", cashCow: 3,  cashCow2: 11, growth: 11, event: 100 },
    { axis: "Efficiency",  cashCow: 87, cashCow2: 32, growth: 44, event: 0 },
  ],

  clusters: [
    {
      name: "Cash Cows",       icon: "Coins",       color: "hsl(32 95% 52%)", cssColor: "text-accent",    bg: "bg-accent/8",
      branches: ["Ain El Mreisseh", "Zalka", "Khaldeh"],
      metrics: "Avg Revenue: 104M | Margin: 71.0%",
      strategy: "Maximize throughput, protect margins. These are your profit engines — focus on modifier upsells and operational efficiency.",
    },
    {
      name: "Established",     icon: "BarChart3",   color: "hsl(210 80% 55%)", cssColor: "text-blue-500", bg: "bg-blue-500/8",
      branches: ["Batroun", "Bayada", "Le Mall", "Centro Mall", "Bir Hasan", "Antelias", "Saida", "Verdun", "Sin El Fil", "Amioun", "LAU", "Unknown (Closed)", "Faqra"],
      metrics: "Avg Revenue: 32M | Margin: 70.9%",
      strategy: "Maintain performance. Focus on operational efficiency, push high-margin products, and drive modifier training to boost margins.",
    },
    {
      name: "Growth Engines",  icon: "Rocket",      color: "hsl(152 65% 42%)", cssColor: "text-success",  bg: "bg-success/8",
      branches: ["Airport", "Ramlet El Bayda", "Aley", "Mansourieh", "Jbeil", "Sour 2", "Raouche", "Kaslik"],
      metrics: "Avg Revenue: 27M | Growth: +100%",
      strategy: "Invest in marketing and full product range. These branches are growing fast — accelerate with modifier training and staffing optimisation.",
    },
    {
      name: "Event/Specialty", icon: "PartyPopper", color: "hsl(270 60% 55%)", cssColor: "text-purple-500", bg: "bg-purple-500/8",
      branches: ["Event Starco"],
      metrics: "Revenue: 0.6M | Margin: 76.0%",
      strategy: "Event-driven model. Different KPIs — focus on per-event profitability and booking frequency. Highest margin in the chain.",
    },
  ],

  /* ─────────────── Action plan timeline ─────────────── */
  actionPlan: [
    {
      phase: "Immediate",   timeframe: "This Week",      icon: "AlertCircle", accentColor: "bg-destructive", iconColor: "text-destructive", dotBg: "bg-destructive/10",
      items: [
        { text: "Fix Veggie Sub pricing", impact: "1.7M" },
        { text: "Audit Amioun POS configuration", impact: "49K" },
      ],
    },
    {
      phase: "Short-Term",  timeframe: "This Month",     icon: "Clock",       accentColor: "bg-accent",      iconColor: "text-accent",      dotBg: "bg-accent/10",
      items: [
        { text: "Implement tiered modifier pricing (premium add-ons only)", impact: "14.1M" },
        { text: "Reprice all cheesecake products", impact: "2.1M" },
      ],
    },
    {
      phase: "Medium-Term", timeframe: "This Quarter",   icon: "TrendingUp",  accentColor: "bg-success",     iconColor: "text-success",     dotBg: "bg-success/10",
      items: [
        { text: "Launch modifier suggestive selling training", impact: "16.9M" },
        { text: "Kill or reprice all 47 negative-margin products", impact: "30.1M" },
      ],
    },
    {
      phase: "Strategic",   timeframe: "Next 6 Months",  icon: "Compass",     accentColor: "bg-blue-500",    iconColor: "text-blue-500",    dotBg: "bg-blue-500/10",
      items: [
        { text: "Invest in growth-engine branches (Airport, Jbeil)" },
        { text: "Develop Ramadan programming strategy" },
        { text: "Set up automated monthly analytics via this dashboard" },
      ],
    },
  ],

  /* ─────────────── Category split (donut chart) ─────────────── */
  categorySplit: [
    { name: "Beverages", revenue: 596000000, profit: 440000000, margin: 73.8, color: "hsl(32 95% 52%)" },
    { name: "Food",      revenue: 244000000, profit: 158000000, margin: 64.8, color: "hsl(25 80% 28%)" },
  ],
};

export default DEFAULT_DATA;
