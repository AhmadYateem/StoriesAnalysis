/**
 * Number formatting helpers used across the dashboard.
 * Kept in one place so every chart/card shows consistent formatting.
 */

/** Format a raw number into a human-readable abbreviated string. */
export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2) + "B";
  if (value >= 1_000_000)     return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000)         return (value / 1_000).toFixed(1) + "K";
  return value.toLocaleString();
}

/** Format based on the KPI format type. */
export function formatKPIValue(value: number, format: string): string {
  if (format === "percent") return value + "%";
  if (format === "currency") return formatCurrency(value);
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  return value.toLocaleString();
}

/** Format for tooltip display (with millions suffix). */
export function formatMillions(value: number): string {
  return value + "M";
}
