"""Extract all real data for website population."""
import sys, json
sys.path.insert(0, '.')

from data_cleaning import load_all_data, BRANCH_NAME_MAP, REGION_MAP

data = load_all_data()
monthly_df = data['monthly_sales']
product_df = data['product_profitability']
category_df = data['category_summary']
groups_df = data['sales_by_group']

months = ['January','February','March','April','May','June',
          'July','August','September','October','November','December']

# ===== 1. BRANCH RANKINGS =====
from analysis.branch_analysis import top_bottom_branches, chain_kpis
top, bottom = top_bottom_branches(monthly_df)

print("=== TOP 5 BRANCHES ===")
for _, r in top.iterrows():
    b = r['Branch']
    v = r['Total_By_Year']
    reg = r['Region']
    print(f"  {b} | {v:,.0f} | {reg}")

print("\n=== BOTTOM 5 BRANCHES ===")
for _, r in bottom.iterrows():
    b = r['Branch']
    v = r['Total_By_Year']
    reg = r['Region']
    print(f"  {b} | {v:,.0f} | {reg}")

# ===== 2. CHAIN KPIs =====
kpis = chain_kpis(monthly_df, category_df, product_df)
print("\n=== CHAIN KPIS ===")
for k, v in kpis.items():
    print(f"  {k}: {v}")

# ===== 3. MONTHLY REVENUE 2025 (chain-wide) =====
df_2025 = monthly_df[monthly_df['Year'] == 2025]
chain_monthly = df_2025[months].sum()
print("\n=== MONTHLY REVENUE 2025 (chain-wide) ===")
for m in months:
    print(f"  {m}: {chain_monthly[m]:,.0f}")

df_2026 = monthly_df[monthly_df['Year'] == 2026]
jan_2026_total = df_2026['January'].sum()
print(f"  January 2026: {jan_2026_total:,.0f}")

# ===== 4. ALL BRANCHES with 2025 revenue =====
print("\n=== ALL BRANCHES 2025 REVENUE ===")
all_branches = df_2025.sort_values('Total_By_Year', ascending=False)
for _, r in all_branches.iterrows():
    b = r['Branch']
    v = r['Total_By_Year']
    reg = r['Region']
    print(f"  {b} | {v:,.0f} | {reg}")

# ===== 5. MONTHLY DATA PER BRANCH (for heatmap) =====
print("\n=== BRANCH MONTHLY DATA 2025 ===")
for _, r in df_2025.iterrows():
    branch = r['Branch']
    vals = [str(r[m]) for m in months]
    print(f"  {branch} | {' | '.join(vals)}")

# ===== 6. MARGIN LEAKS =====
from analysis.margin_leaks import (
    generate_margin_leak_report, veggie_sub_analysis,
    free_modifiers_cost, cheesecake_margin_analysis, amioun_pricing_analysis,
    find_negative_margin_products
)

leak_df, total_leaks = generate_margin_leak_report(product_df)
print(f"\n=== MARGIN LEAKS (Total: {total_leaks:,.0f}) ===")
for _, r in leak_df.iterrows():
    print(f"  {r['Leak']}: {r['Annual_Loss']:,.0f} | {r['Priority']} | {r['Description']}")

_, veggie_stats = veggie_sub_analysis(product_df)
print(f"\n=== VEGGIE SUB STATS ===")
for k, v in veggie_stats.items():
    print(f"  {k}: {v}")

_, cheese_stats = cheesecake_margin_analysis(product_df)
print(f"\n=== CHEESECAKE STATS ===")
for k, v in cheese_stats.items():
    print(f"  {k}: {v}")

_, total_absorbed = free_modifiers_cost(product_df)
print(f"\n=== FREE MODIFIERS TOTAL COST: {total_absorbed:,.0f} ===")

_, amioun_loss = amioun_pricing_analysis(product_df)
print(f"=== AMIOUN LOSS: {amioun_loss:,.0f} ===")

neg_df = find_negative_margin_products(product_df)
print(f"=== NEGATIVE MARGIN PRODUCTS COUNT: {len(neg_df)} ===")
print(f"=== NEGATIVE MARGIN TOTAL LOSS: {neg_df['Loss_Amount'].sum():,.0f} ===")

# ===== 7. MENU ENGINEERING =====
from analysis.menu_engineering import (
    build_menu_matrix, modifier_attachment_analysis,
    top_products_by_profit, bottom_products_by_profit
)

chain_df, med_qty, med_margin = build_menu_matrix(product_df)
print(f"\n=== MENU MATRIX ===")
print(f"  Total products classified: {len(chain_df)}")
print(f"  Median Qty threshold: {med_qty:,.0f}")
print(f"  Median Margin threshold: {med_margin:.1f}%")

for q in ['⭐ Star', '🐴 Plowhorse', '🧩 Puzzle', '🐕 Dog']:
    subset = chain_df[chain_df['Quadrant'] == q]
    print(f"\n  {q}: {len(subset)} products")
    top10 = subset.sort_values('Total_Profit', ascending=False).head(10)
    for _, r in top10.iterrows():
        print(f"    {r['Product']} | Qty:{r['Total_Qty']:,.0f} | Rev:{r['Total_Revenue']:,.0f} | Margin:{r['Margin_Pct']:.1f}% | Profit:{r['Total_Profit']:,.0f}")

# Modifier attach rates
stats_df, top_rate, opportunity = modifier_attachment_analysis(product_df)
print(f"\n=== MODIFIER ATTACHMENT RATES ===")
print(f"  Top rate: {top_rate:.1f}%")
print(f"  Opportunity: {opportunity:,.0f}")
for _, r in stats_df.iterrows():
    branch = r['Branch_Short']
    rate = r['Attach_Rate_Pct']
    mod_qty = r['Modifier_Qty']
    base_qty = r['Base_Beverage_Qty']
    profit = r['Modifier_Profit']
    print(f"  {branch} | Rate:{rate:.1f}% | ModQty:{mod_qty:,.0f} | BaseQty:{base_qty:,.0f} | Profit:{profit:,.0f}")

# Top/bottom products
print("\n=== TOP 20 PRODUCTS BY PROFIT ===")
top_prods = top_products_by_profit(product_df, 20)
for _, r in top_prods.iterrows():
    print(f"  {r['Product']} | {r['Category']} | Qty:{r['Total_Qty']:,.0f} | Profit:{r['Total_Profit']:,.0f} | Rev:{r['Total_Revenue']:,.0f} | Margin:{r['Avg_Margin']:.1f}%")

print("\n=== BOTTOM 20 PRODUCTS BY PROFIT ===")
bot_prods = bottom_products_by_profit(product_df, 20)
for _, r in bot_prods.iterrows():
    print(f"  {r['Product']} | {r['Category']} | Qty:{r['Total_Qty']:,.0f} | Profit:{r['Total_Profit']:,.0f} | Rev:{r['Total_Revenue']:,.0f} | Margin:{r['Avg_Margin']:.1f}%")

# ===== 8. FORECASTING =====
from models.forecasting import forecast_all_branches, compute_2026_projections
forecasts = forecast_all_branches(monthly_df)
projections = compute_2026_projections(monthly_df, forecasts)

print(f"\n=== 2026 PROJECTIONS ===")
chain_2025 = df_2025['Total_By_Year'].sum()
chain_2026 = projections['Projected_2026_Total'].sum()
print(f"  Chain 2025 Total: {chain_2025:,.0f}")
print(f"  Chain 2026 Projected: {chain_2026:,.0f}")
print(f"  YoY Growth: {(chain_2026 - chain_2025) / chain_2025 * 100:+.1f}%")

print("\n=== BRANCH 2026 PROJECTIONS ===")
for _, r in projections.sort_values('Projected_2026_Total', ascending=False).iterrows():
    b = r['Branch']
    t25 = r['Actual_2025_Total']
    j26 = r['Jan_2026_Actual']
    fc = r['Feb_Dec_Forecast']
    t26 = r['Projected_2026_Total']
    g = r['YoY_Growth_Pct']
    print(f"  {b} | 2025:{t25:,.0f} | Jan26:{j26:,.0f} | Forecast:{fc:,.0f} | Total26:{t26:,.0f} | Growth:{g:+.1f}%")

# Monthly forecast values per branch (chain-wide aggregated)
print("\n=== CHAIN MONTHLY FORECAST 2026 ===")
if len(forecasts) > 0:
    chain_fc = forecasts.groupby('Month')['yhat'].sum()
    month_names = ['Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    for i, m in enumerate(range(2, 13)):
        val = chain_fc.get(m, 0)
        print(f"  {month_names[i]} 2026: {val:,.0f}")

# ===== 9. CLUSTERING =====
from models.clustering import build_branch_features, cluster_branches, cluster_recommendations

features = build_branch_features(monthly_df, category_df, product_df)
clustered, _, _ = cluster_branches(features, 4)

print(f"\n=== CLUSTER ASSIGNMENTS ===")
for cluster_name in sorted(clustered['Cluster'].unique()):
    branches_in = clustered[clustered['Cluster'] == cluster_name]
    branch_list = ', '.join(branches_in['Branch'].tolist())
    avg_rev = branches_in['Total_Revenue'].mean()
    avg_growth = branches_in['Growth_Pct'].mean()
    avg_margin = branches_in['Profit_Margin_Pct'].mean()
    print(f"\n  Cluster: {cluster_name} ({len(branches_in)} branches)")
    print(f"  Branches: {branch_list}")
    print(f"  Avg Revenue: {avg_rev:,.0f} | Avg Growth: {avg_growth:+.1f}% | Avg Margin: {avg_margin:.1f}%")

print(f"\n=== CLUSTER FEATURE DETAILS ===")
for _, r in clustered.iterrows():
    print(f"  {r['Branch']} | Cluster:{r['Cluster']} | Rev:{r['Total_Revenue']:,.0f} | Growth:{r['Growth_Pct']:+.1f}% | Margin:{r['Profit_Margin_Pct']:.1f}% | BevShare:{r['Beverage_Share_Pct']:.1f}% | SeasonCV:{r['Seasonality_CV']:.3f} | RevPerMonth:{r['Revenue_Per_Month']:,.0f} | ActiveMonths:{r['Active_Months']}")

# ===== 10. RADAR CHART DATA =====
import numpy as np
metrics = ['Total_Revenue', 'Growth_Pct', 'Profit_Margin_Pct',
           'Beverage_Share_Pct', 'Seasonality_CV', 'Revenue_Per_Month']
labels = ['Revenue', 'Growth', 'Margin', 'Beverage Mix', 'Seasonality', 'Efficiency']

print(f"\n=== RADAR CHART DATA (normalized 0-1) ===")
for cluster in clustered['Cluster'].unique():
    cl_data = clustered[clustered['Cluster'] == cluster]
    values = []
    for m in metrics:
        col_min = clustered[m].min()
        col_max = clustered[m].max()
        col_range = col_max - col_min if col_max != col_min else 1
        values.append((cl_data[m].mean() - col_min) / col_range)
    vals_str = ' | '.join([f"{l}:{v:.3f}" for l, v in zip(labels, values)])
    print(f"  {cluster}: {vals_str}")

# ===== 11. BRANCH NAME MAP & REGION MAP =====
print(f"\n=== CANONICAL BRANCH NAMES ({len(set(BRANCH_NAME_MAP.values()))} unique) ===")
for canonical in sorted(set(BRANCH_NAME_MAP.values())):
    region = REGION_MAP.get(canonical, 'Unknown')
    print(f"  {canonical} -> {region}")

# ===== 12. CATEGORY MIX PER BRANCH =====
print(f"\n=== CATEGORY MIX PER BRANCH ===")
cat_clean = category_df[~category_df['IsAggregate']]
for branch in sorted(cat_clean['Branch'].unique()):
    bdata = cat_clean[cat_clean['Branch'] == branch]
    for _, r in bdata.iterrows():
        print(f"  {branch} | {r['Category']} | Rev:{r['TrueRevenue']:,.0f} | Profit:{r['TotalProfit']:,.0f} | Margin:{r['ProfitMargin']:.1f}%")

print("\n=== EXTRACTION COMPLETE ===")
