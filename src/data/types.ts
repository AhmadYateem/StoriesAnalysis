/**
 * Shared TypeScript types for the Stories Coffee analytics dashboard.
 * All data flowing through the app — from hardcoded defaults or CSV uploads —
 * conforms to these interfaces.
 */

/* ── KPI (Key Performance Indicator) card ── */
export interface KPI {
  icon: string;           // lucide-react icon name
  label: string;
  value: number;
  subtext: string;
  format: "currency" | "percent" | "number";
  isAlert?: boolean;
}

/* ── Branch ranking row ── */
export interface BranchRanking {
  rank: number;
  name: string;
  revenue: string;
}

/* ── Monthly revenue data point ── */
export interface MonthlyDataPoint {
  month: string;
  revenue: number;
}

/* ── Heatmap raw data: branch name → 12 monthly values ── */
export type BranchMonthlyMap = Record<string, number[]>;

/* ── Margin leak waterfall bar ── */
export interface WaterfallItem {
  name: string;
  value: number;
  color: string;
}

/* ── Margin leak detail card ── */
export interface LeakCard {
  icon: string;
  title: string;
  amount: string;
  amountRaw: number;
  detail: string;
  severity: "critical" | "warning" | "info";
  rootCause?: string;
  recommendation?: string;
}

/* ── Free modifier breakdown row (for enhanced leak #2) ── */
export interface FreeModifierRow {
  product: string;
  quantity: number;
  absorbedCost: number;
  suggestedCharge: number;
  recoverable: number;
}

/* ── Menu engineering scatter point ── */
export interface MenuProduct {
  name: string;
  volume: number;
  margin: number;
  quadrant: "star" | "puzzle" | "plowhorse" | "dog";
}

/* ── Menu quadrant summary ── */
export interface QuadrantSummary {
  name: string;
  icon: string;
  desc: string;
  color: string;
  items: string[];
}

/* ── Modifier attach rate per branch ── */
export interface ModifierAttachRate {
  branch: string;
  rate: number;
}

/* ── Playbook step ── */
export interface PlaybookStep {
  step: number;
  text: string;
}

/* ── Forecast data point (one per month) ── */
export interface ForecastDataPoint {
  month: string;
  actual: number;
  forecast: number;
  low: number;
  high: number;
}

/* ── Branch forecast row ── */
export interface BranchForecast {
  branch: string;
  projected: string;
  growth: string;
}

/* ── Radar chart axis value ── */
export interface RadarDataPoint {
  axis: string;
  cashCow: number;
  cashCow2: number;
  growth: number;
  event: number;
}

/* ── Cluster definition ── */
export interface ClusterDef {
  name: string;
  icon: string;
  color: string;
  cssColor: string;
  bg: string;
  branches: string[];
  metrics: string;
  strategy: string;
}

/* ── Action plan phase ── */
export interface ActionPhase {
  phase: string;
  timeframe: string;
  icon: string;
  accentColor: string;
  iconColor: string;
  dotBg: string;
  items: { text: string; impact?: string }[];
}

/* ── Category split (for donut chart) ── */
export interface CategorySplit {
  name: string;
  revenue: number;
  profit: number;
  margin: number;
  color: string;
}

/* ── The full analysis result that flows through the app ── */
export interface AnalysisData {
  kpis: KPI[];
  topBranches: BranchRanking[];
  bottomBranches: BranchRanking[];
  monthlyRevenue: MonthlyDataPoint[];
  branchMonthly: BranchMonthlyMap;
  heatmapBranches: string[];
  waterfallData: WaterfallItem[];
  leakCards: LeakCard[];
  freeModifiers: FreeModifierRow[];
  menuProducts: MenuProduct[];
  quadrants: QuadrantSummary[];
  modifierAttachRates: ModifierAttachRate[];
  modifierPlaybook: PlaybookStep[];
  forecastData: ForecastDataPoint[];
  topForecasts: BranchForecast[];
  radarData: RadarDataPoint[];
  clusters: ClusterDef[];
  actionPlan: ActionPhase[];
  categorySplit: CategorySplit[];
  datasetName: string;
}
