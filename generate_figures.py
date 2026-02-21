"""
Generate publication-quality figures for the Executive Summary (LaTeX/Overleaf).
Outputs PDF vector graphics into figures/ directory.
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from matplotlib.patches import FancyBboxPatch
import os, sys

# ── Setup ────────────────────────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(__file__))
OUT = os.path.join(os.path.dirname(__file__), 'figures')
os.makedirs(OUT, exist_ok=True)

# Brand colours (coffee palette)
BROWN   = '#654321'
ACCENT  = '#D2691E'
CREAM   = '#FAF7F2'
DARK    = '#1C1C1C'
MUTED   = '#736E69'
RED     = '#DC3545'
GREEN   = '#228B22'
BLUE    = '#3B82F6'
PURPLE  = '#805AD5'
ORANGE  = '#F59E0B'

plt.rcParams.update({
    'font.family': 'sans-serif',
    'font.sans-serif': ['Helvetica', 'Arial', 'DejaVu Sans'],
    'font.size': 9,
    'axes.titlesize': 11,
    'axes.labelsize': 9,
    'xtick.labelsize': 8,
    'ytick.labelsize': 8,
    'figure.facecolor': 'white',
    'axes.facecolor': 'white',
    'axes.edgecolor': '#CCCCCC',
    'axes.grid': True,
    'grid.alpha': 0.3,
    'grid.color': '#DDDDDD',
})

# ── Load data ────────────────────────────────────────────────────────────────
DATA = os.path.join(os.path.dirname(__file__), 'data', 'cleaned')
monthly_df   = pd.read_parquet(os.path.join(DATA, 'monthly_sales.parquet'))
product_df   = pd.read_parquet(os.path.join(DATA, 'product_profitability.parquet'))
category_df  = pd.read_parquet(os.path.join(DATA, 'category_summary.parquet'))
group_df     = pd.read_parquet(os.path.join(DATA, 'sales_by_group.parquet'))

print(f"Data loaded: monthly={len(monthly_df)}, products={len(product_df)}, "
      f"categories={len(category_df)}, groups={len(group_df)}")


# ═══════════════════════════════════════════════════════════════════════════════
# FIGURE 1 — Margin Leak Waterfall
# ═══════════════════════════════════════════════════════════════════════════════
def fig_margin_waterfall():
    leaks = [
        ('Negative-Margin\nProducts', 30_100_000),
        ('Free\nModifiers', 28_100_000),
        ('Cheesecake\nUnderpricing', 2_100_000),
        ('Veggie Sub\nMispricing', 1_700_000),
        ('Amioun POS\nError', 49_000),
    ]
    labels = [l for l, _ in leaks]
    values = [v for _, v in leaks]
    total  = sum(values)

    fig, ax = plt.subplots(figsize=(5.5, 2.8))

    cumulative = 0
    bars = []
    for i, (label, val) in enumerate(leaks):
        bar = ax.bar(i, val / 1e6, bottom=cumulative / 1e6,
                     color=RED, alpha=0.75, width=0.6, edgecolor='white', linewidth=0.5)
        # Value label
        mid = (cumulative + val / 2) / 1e6
        ax.text(i, mid, f'{val/1e6:.1f}M', ha='center', va='center',
                fontsize=7, fontweight='bold', color='white')
        cumulative += val
        bars.append(bar)

    # Total bar
    ax.bar(len(leaks), total / 1e6, color=BROWN, alpha=0.9, width=0.6,
           edgecolor='white', linewidth=0.5)
    ax.text(len(leaks), total / 1e6 / 2, f'{total/1e6:.1f}M',
            ha='center', va='center', fontsize=8, fontweight='bold', color='white')

    ax.set_xticks(range(len(leaks) + 1))
    ax.set_xticklabels(labels + ['TOTAL\nRecoverable'], fontsize=7)
    ax.set_ylabel('LBP (Millions)', fontsize=8)
    ax.set_title('Margin Leak Waterfall — 62M LBP Recoverable', fontsize=10, fontweight='bold', color=DARK)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.yaxis.set_major_formatter(mticker.FormatStrFormatter('%.0fM'))
    plt.tight_layout()
    fig.savefig(os.path.join(OUT, 'waterfall.pdf'), bbox_inches='tight', dpi=300)
    fig.savefig(os.path.join(OUT, 'waterfall.png'), bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("✓ waterfall.pdf")


# ═══════════════════════════════════════════════════════════════════════════════
# FIGURE 2 — Menu Engineering Matrix (BCG scatter)
# ═══════════════════════════════════════════════════════════════════════════════
def fig_menu_matrix():
    from analysis.menu_engineering import build_menu_matrix
    chain_df, med_qty, med_margin = build_menu_matrix(product_df)

    # Clip extreme negative margins so the chart is readable
    plot_df = chain_df.copy()
    plot_df['Margin_Pct'] = plot_df['Margin_Pct'].clip(lower=-20)

    # Quadrant definitions for reference
    quad_info = {
        '⭐ Star':      ('Star\n(High Vol + High Margin)\nPromote these',      GREEN,  'Star'),
        '🐴 Plowhorse': ('Plowhorse\n(High Vol + Low Margin)\nReprice upward', BLUE,   'Plowhorse'),
        '🧩 Puzzle':    ('Puzzle\n(Low Vol + High Margin)\nMarket more',        ORANGE, 'Puzzle'),
        '🐕 Dog':       ('Dog\n(Low Vol + Low Margin)\nReview / cut',           RED,    'Dog'),
    }

    fig, ax = plt.subplots(figsize=(5.5, 3.5))

    # Shaded quadrant backgrounds
    xmin, xmax = plot_df['Total_Qty'].min() * 0.5, plot_df['Total_Qty'].max() * 2
    ymin, ymax = plot_df['Margin_Pct'].min() - 5, min(plot_df['Margin_Pct'].max() + 5, 105)

    ax.axhspan(med_margin, ymax, xmin=0, xmax=1, color=GREEN,  alpha=0.04, transform=ax.get_yaxis_transform(), zorder=0)
    ax.axhspan(ymin, med_margin, xmin=0, xmax=1, color=RED,    alpha=0.04, transform=ax.get_yaxis_transform(), zorder=0)

    # Plot each quadrant
    for quad, (desc, color, short_label) in quad_info.items():
        subset = plot_df[plot_df['Quadrant'] == quad]
        sizes = np.clip(subset['Total_Revenue'] / plot_df['Total_Revenue'].max() * 150, 10, 150)
        ax.scatter(subset['Total_Qty'], subset['Margin_Pct'],
                   s=sizes, c=color, alpha=0.55, edgecolors='white', linewidth=0.3,
                   label=f"{short_label} ({len(subset)})", zorder=3)

    # Median lines
    ax.axhline(med_margin, color=DARK, ls='--', lw=1, alpha=0.4, zorder=2)
    ax.axvline(med_qty, color=DARK, ls='--', lw=1, alpha=0.4, zorder=2)

    # Quadrant labels on the plot background
    ax.text(xmax * 0.6, ymax - 3, 'STAR', fontsize=14, fontweight='bold',
            color=GREEN, alpha=0.25, ha='center', va='top', zorder=1)
    ax.text(xmin * 2, ymax - 3, 'PUZZLE', fontsize=14, fontweight='bold',
            color=ORANGE, alpha=0.25, ha='center', va='top', zorder=1)
    ax.text(xmax * 0.6, ymin + 2, 'PLOWHORSE', fontsize=14, fontweight='bold',
            color=BLUE, alpha=0.25, ha='center', va='bottom', zorder=1)
    ax.text(xmin * 2, ymin + 2, 'DOG', fontsize=14, fontweight='bold',
            color=RED, alpha=0.25, ha='center', va='bottom', zorder=1)

    # Median labels
    ax.text(xmax * 1.1, med_margin, f'Median\n{med_margin:.0f}%', fontsize=6,
            color=MUTED, ha='left', va='center')

    ax.set_xscale('log')
    ax.set_xlim(xmin, xmax)
    ax.set_ylim(ymin, ymax)
    ax.set_xlabel('Quantity Sold (log scale)', fontsize=8)
    ax.set_ylabel('Profit Margin %', fontsize=8)
    ax.set_title('Menu Engineering Matrix — 409 Products Classified', fontsize=10, fontweight='bold', color=DARK)
    ax.legend(fontsize=6.5, loc='lower left', framealpha=0.9, edgecolor='#ddd')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    plt.tight_layout()
    fig.savefig(os.path.join(OUT, 'menu_matrix.pdf'), bbox_inches='tight', dpi=300)
    fig.savefig(os.path.join(OUT, 'menu_matrix.png'), bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("✓ menu_matrix.pdf")


# ═══════════════════════════════════════════════════════════════════════════════
# FIGURE 3 — Seasonality + Forecasting combined
# ═══════════════════════════════════════════════════════════════════════════════
def fig_seasonality_forecast():
    from models.forecasting import prepare_time_series, forecast_branch_xgboost

    months = ['January','February','March','April','May','June',
              'July','August','September','October','November','December']
    month_short = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

    # 2025 actuals — chain-wide
    df_2025 = monthly_df[monthly_df['Year'] == 2025]
    chain_2025 = df_2025[months].sum().values  # 12 monthly values

    # Jan 2026 actual
    df_2026 = monthly_df[monthly_df['Year'] == 2026]
    jan_2026_actual = df_2026['January'].sum() if len(df_2026) > 0 else 0

    # Forecast per branch, then sum
    branches = monthly_df['Branch'].unique()
    forecast_sums = np.zeros(11)  # Feb-Dec 2026
    forecast_lower = np.zeros(11)
    forecast_upper = np.zeros(11)
    count = 0

    for branch in branches:
        result = forecast_branch_xgboost(monthly_df, branch, forecast_months=11)
        if result is not None:
            forecast_sums += result['yhat'].values
            forecast_lower += result['yhat_lower'].values
            forecast_upper += result['yhat_upper'].values
            count += 1

    # Build full time series for plotting
    x_actual = list(range(12))  # Jan-Dec 2025
    y_actual = chain_2025.tolist()

    x_jan26 = [12]  # Jan 2026
    y_jan26 = [jan_2026_actual]

    x_forecast = list(range(13, 24))  # Feb-Dec 2026
    y_forecast = forecast_sums.tolist()
    y_lower = forecast_lower.tolist()
    y_upper = forecast_upper.tolist()

    # X labels
    xlabels = [f"{m}\n2025" for m in month_short] + [f"{m}\n2026" for m in month_short]

    fig, ax = plt.subplots(figsize=(5.5, 2.8))

    # 2025 actuals
    ax.plot(x_actual, y_actual, '-o', color=BROWN, lw=2, ms=4, label='2025 Actual', zorder=3)

    # Jan 2026 actual
    ax.plot([12], [jan_2026_actual], '*', color=GREEN, ms=10, zorder=5, label='Jan 2026 Actual')

    # Connect last actual to first forecast
    ax.plot([12] + x_forecast, [jan_2026_actual] + y_forecast, '--', color=ACCENT, lw=1.5, alpha=0.8)
    ax.plot(x_forecast, y_forecast, 'o', color=ACCENT, ms=3, alpha=0.8, label='2026 Forecast')

    # Confidence band
    ax.fill_between(x_forecast, y_lower, y_upper, color=ACCENT, alpha=0.15, label='Confidence Band')

    # Annotations
    peak_idx = np.argmax(y_actual)
    trough_idx = np.argmin(y_actual)
    ax.annotate(f'Peak\n{month_short[peak_idx]}', xy=(peak_idx, y_actual[peak_idx]),
                xytext=(peak_idx+0.5, y_actual[peak_idx]*1.08),
                fontsize=6, color=GREEN, fontweight='bold',
                arrowprops=dict(arrowstyle='->', color=GREEN, lw=0.8))
    ax.annotate(f'Trough\n{month_short[trough_idx]}', xy=(trough_idx, y_actual[trough_idx]),
                xytext=(trough_idx+0.5, y_actual[trough_idx]*0.85),
                fontsize=6, color=RED, fontweight='bold',
                arrowprops=dict(arrowstyle='->', color=RED, lw=0.8))

    ax.set_xticks(list(range(24)))
    ax.set_xticklabels(xlabels, fontsize=5, rotation=0)
    ax.yaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{x/1e6:.0f}M'))
    ax.set_ylabel('Revenue (LBP)', fontsize=8)
    ax.set_title('Chain Revenue: 2025 Actual → 2026 Forecast (+26% YoY)', fontsize=10, fontweight='bold', color=DARK)
    ax.legend(fontsize=6, loc='upper left', framealpha=0.8)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    plt.tight_layout()
    fig.savefig(os.path.join(OUT, 'forecast.pdf'), bbox_inches='tight', dpi=300)
    fig.savefig(os.path.join(OUT, 'forecast.png'), bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("✓ forecast.pdf")


# ═══════════════════════════════════════════════════════════════════════════════
# FIGURE 4 — Branch Clustering
# ═══════════════════════════════════════════════════════════════════════════════
def fig_clustering():
    from models.clustering import build_branch_features, cluster_branches
    features_df = build_branch_features(monthly_df, category_df, product_df)
    cluster_df, kmeans, scaler = cluster_branches(features_df, n_clusters=4)

    quad_colors_list = [BROWN, BLUE, GREEN, ORANGE]

    fig, ax = plt.subplots(figsize=(5.5, 3.0))

    clusters = sorted(cluster_df['Cluster'].unique())
    for i, cname in enumerate(clusters):
        subset = cluster_df[cluster_df['Cluster'] == cname]
        c = quad_colors_list[i % len(quad_colors_list)]
        sizes = np.clip(subset['Total_Qty'] / cluster_df['Total_Qty'].max() * 150, 20, 150)
        ax.scatter(subset['Revenue_Per_Month'], subset['Profit_Margin_Pct'],
                   s=sizes, c=c, alpha=0.7, edgecolors='white', linewidth=0.5,
                   label=f"{cname} ({len(subset)})")
        # Label each branch
        for _, row in subset.iterrows():
            ax.annotate(row['Branch'].replace('Stories ', ''),
                        (row['Revenue_Per_Month'], row['Profit_Margin_Pct']),
                        fontsize=4.5, ha='center', va='bottom', color=MUTED)

    ax.set_xlabel('Revenue per Active Month', fontsize=8)
    ax.set_ylabel('Profit Margin %', fontsize=8)
    ax.set_title('Branch Clustering — 4 Strategic Segments', fontsize=10, fontweight='bold', color=DARK)
    ax.legend(fontsize=6, loc='best', framealpha=0.8)
    ax.xaxis.set_major_formatter(mticker.FuncFormatter(lambda x, _: f'{x/1e6:.0f}M'))
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    plt.tight_layout()
    fig.savefig(os.path.join(OUT, 'clustering.pdf'), bbox_inches='tight', dpi=300)
    fig.savefig(os.path.join(OUT, 'clustering.png'), bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("✓ clustering.pdf")


# ═══════════════════════════════════════════════════════════════════════════════
# FIGURE 5 — Modifier Attach Rate bar chart
# ═══════════════════════════════════════════════════════════════════════════════
def fig_modifier_rates():
    from analysis.menu_engineering import modifier_attachment_analysis
    mod_df, top_rate, opportunity = modifier_attachment_analysis(product_df)

    if mod_df is None or len(mod_df) == 0:
        print("✗ modifier data not available")
        return

    # Sort by attach rate
    mod_df = mod_df.sort_values('Attach_Rate_Pct', ascending=True).copy()
    mod_df['Branch_Short'] = mod_df['Branch'].str.replace('Stories ', '')

    fig, ax = plt.subplots(figsize=(5.5, 3.5))

    colors = [GREEN if r >= mod_df['Attach_Rate_Pct'].median() else ACCENT
              for r in mod_df['Attach_Rate_Pct']]

    ax.barh(mod_df['Branch_Short'], mod_df['Attach_Rate_Pct'],
            color=colors, alpha=0.8, edgecolor='white', linewidth=0.3)

    # Best rate line
    best = mod_df['Attach_Rate_Pct'].max()
    ax.axvline(best, color=GREEN, ls='--', lw=1, alpha=0.6)
    ax.text(best + 0.5, len(mod_df) - 1, f'Best: {best:.0f}%', fontsize=6, color=GREEN)

    ax.set_xlabel('Modifier Attach Rate %', fontsize=8)
    ax.set_title(f'Modifier Upsell Gap — 16.9M LBP Opportunity', fontsize=10, fontweight='bold', color=DARK)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    plt.tight_layout()
    fig.savefig(os.path.join(OUT, 'modifiers.pdf'), bbox_inches='tight', dpi=300)
    fig.savefig(os.path.join(OUT, 'modifiers.png'), bbox_inches='tight', dpi=300)
    plt.close(fig)
    print("✓ modifiers.pdf")


# ═══════════════════════════════════════════════════════════════════════════════
# Main
# ═══════════════════════════════════════════════════════════════════════════════
if __name__ == '__main__':
    print("Generating figures for executive summary...")
    fig_margin_waterfall()
    fig_menu_matrix()
    fig_seasonality_forecast()
    fig_clustering()
    fig_modifier_rates()
    print(f"\nAll figures saved to {OUT}/")
    print("Upload the figures/ folder to Overleaf alongside executive_summary.tex")
