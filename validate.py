"""Quick validation of all analysis modules."""
import sys
sys.path.insert(0, '.')

from data_cleaning import load_all_data
data = load_all_data()
print('Data loaded OK')

from analysis.branch_analysis import chain_kpis, branch_performance_quadrant, seasonality_analysis
kpis = chain_kpis(data['monthly_sales'], data['category_summary'], data['product_profitability'])
print(f"KPIs: Revenue={kpis['total_revenue']:,.0f}, Profit={kpis['total_profit']:,.0f}, Margin={kpis['avg_margin']:.1f}%")

from analysis.margin_leaks import generate_margin_leak_report
leak_df, total = generate_margin_leak_report(data['product_profitability'])
print(f"Margin Leaks: {total:,.0f} total across {len(leak_df)} categories")
for _, r in leak_df.iterrows():
    print(f"  - {r['Leak']}: {r['Annual_Loss']:,.0f}")

from analysis.menu_engineering import build_menu_matrix, modifier_attachment_analysis
chain, mq, mm = build_menu_matrix(data['product_profitability'])
print(f"Menu Matrix: {len(chain)} products, Median qty={mq:,.0f}, Median margin={mm:.1f}%")

mod_stats, top_rate, opportunity = modifier_attachment_analysis(data['product_profitability'])
print(f"Modifier: Top attach rate={top_rate:.1f}%, Opportunity={opportunity:,.0f}")

from models.forecasting import forecast_all_branches, compute_2026_projections
forecasts = forecast_all_branches(data['monthly_sales'])
proj = compute_2026_projections(data['monthly_sales'], forecasts)
total_2026 = proj['Projected_2026_Total'].sum()
print(f"2026 Projection: {total_2026:,.0f}")

from models.clustering import build_branch_features, cluster_branches
features = build_branch_features(data['monthly_sales'], data['category_summary'], data['product_profitability'])
clustered, _, _ = cluster_branches(features, 4)
for cl in clustered['Cluster'].unique():
    branches = clustered[clustered['Cluster']==cl]['Branch'].tolist()
    names = [b.replace("Stories ", "") for b in branches]
    print(f"  Cluster [{cl}]: {names}")

print("\nALL MODULES VALIDATED SUCCESSFULLY")
