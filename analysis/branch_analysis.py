"""
Stories Coffee — Branch Performance Analysis
=============================================
BCG-style quadrant analysis, seasonality patterns,
category mix, and service type distribution.
"""

import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots


def branch_performance_quadrant(monthly_df, category_df):
    """
    Create BCG-style 2x2 scatter: Revenue vs Growth, sized by volume, colored by margin.
    """
    # Get 2025 annual revenue per branch
    df_2025 = monthly_df[monthly_df['Year'] == 2025].copy()
    df_2026 = monthly_df[monthly_df['Year'] == 2026].copy()

    # YoY Growth: compare Jan 2026 vs Jan 2025
    jan_2025 = df_2025.set_index('Branch')['January'].to_dict()
    jan_2026 = df_2026.set_index('Branch')['January'].to_dict()

    rows = []
    for branch in df_2025['Branch'].unique():
        rev_2025 = df_2025[df_2025['Branch'] == branch]['Total_By_Year'].values[0]
        j25 = jan_2025.get(branch, 0)
        j26 = jan_2026.get(branch, 0)

        # Growth rate
        if j25 > 0:
            growth = (j26 - j25) / j25 * 100
        elif j26 > 0:
            growth = 100  # New branch, infinite growth capped
        else:
            growth = 0

        # Get margin from category summary
        branch_cat = category_df[(category_df['Branch'] == branch) & (~category_df['IsAggregate'])]
        if len(branch_cat) > 0:
            total_profit = branch_cat['TotalProfit'].sum()
            total_revenue = branch_cat['TrueRevenue'].sum()
            margin = total_profit / total_revenue * 100 if total_revenue > 0 else 0
            qty = branch_cat['Qty'].sum()
        else:
            margin = 0
            qty = 0

        region = df_2025[df_2025['Branch'] == branch]['Region'].values[0]

        rows.append({
            'Branch': branch.replace('Stories ', ''),
            'Branch_Full': branch,
            'Revenue_2025': rev_2025,
            'Jan_Growth_Pct': growth,
            'Avg_Margin_Pct': margin,
            'Total_Qty': qty,
            'Region': region,
        })

    perf_df = pd.DataFrame(rows)

    # Compute medians for quadrant lines
    med_rev = perf_df['Revenue_2025'].median()
    med_growth = perf_df['Jan_Growth_Pct'].median()

    # Assign quadrant labels
    def assign_quadrant(row):
        if row['Revenue_2025'] >= med_rev and row['Jan_Growth_Pct'] >= med_growth:
            return '⭐ Star'
        elif row['Revenue_2025'] >= med_rev and row['Jan_Growth_Pct'] < med_growth:
            return '🐄 Cash Cow'
        elif row['Revenue_2025'] < med_rev and row['Jan_Growth_Pct'] >= med_growth:
            return '❓ Question Mark'
        else:
            return '🐕 Dog'

    perf_df['Quadrant'] = perf_df.apply(assign_quadrant, axis=1)

    fig = px.scatter(
        perf_df,
        x='Revenue_2025',
        y='Jan_Growth_Pct',
        size='Total_Qty',
        color='Quadrant',
        hover_name='Branch',
        hover_data={
            'Revenue_2025': ':,.0f',
            'Jan_Growth_Pct': ':.1f',
            'Avg_Margin_Pct': ':.1f',
            'Region': True,
            'Total_Qty': ':,.0f',
        },
        color_discrete_map={
            '⭐ Star': '#2ecc71',
            '🐄 Cash Cow': '#3498db',
            '❓ Question Mark': '#f39c12',
            '🐕 Dog': '#e74c3c',
        },
        title='Branch Performance Quadrant — Revenue vs Growth',
        labels={
            'Revenue_2025': '2025 Total Revenue',
            'Jan_Growth_Pct': 'YoY Growth (Jan 2026 vs Jan 2025) %',
        },
    )

    # Add quadrant lines
    fig.add_hline(y=med_growth, line_dash='dash', line_color='gray', opacity=0.5)
    fig.add_vline(x=med_rev, line_dash='dash', line_color='gray', opacity=0.5)

    fig.update_layout(
        height=600,
        template='plotly_white',
        font=dict(family='Inter, sans-serif'),
    )

    return fig, perf_df


def seasonality_analysis(monthly_df):
    """
    Analyze monthly seasonality patterns across the chain.
    Returns two figures: chain-level trend + branch heatmap.
    """
    df_2025 = monthly_df[monthly_df['Year'] == 2025].copy()
    months = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']

    # Chain-level monthly totals
    chain_monthly = df_2025[months].sum()

    # Line chart
    fig_trend = go.Figure()
    fig_trend.add_trace(go.Scatter(
        x=months,
        y=chain_monthly.values,
        mode='lines+markers',
        name='2025 Monthly Revenue',
        line=dict(color='#8B4513', width=3),
        marker=dict(size=10),
        hovertemplate='%{x}: %{y:,.0f}<extra></extra>',
    ))

    # Add annotations for key months
    peak_month = chain_monthly.idxmax()
    trough_month = chain_monthly.idxmin()

    fig_trend.add_annotation(
        x=peak_month, y=chain_monthly[peak_month],
        text=f"Peak: {peak_month}<br>{chain_monthly[peak_month]:,.0f}",
        showarrow=True, arrowhead=2, ax=0, ay=-40,
        font=dict(color='green', size=12),
    )
    fig_trend.add_annotation(
        x=trough_month, y=chain_monthly[trough_month],
        text=f"Trough: {trough_month}<br>{chain_monthly[trough_month]:,.0f}",
        showarrow=True, arrowhead=2, ax=0, ay=40,
        font=dict(color='red', size=12),
    )

    fig_trend.update_layout(
        title='Chain-Wide Monthly Revenue — 2025 Seasonality',
        xaxis_title='Month',
        yaxis_title='Total Revenue',
        height=450,
        template='plotly_white',
    )

    # Branch × Month heatmap
    heatmap_data = df_2025.set_index('Branch')[months]
    # Normalize each branch by its own max (to show relative seasonality)
    heatmap_norm = heatmap_data.div(heatmap_data.max(axis=1), axis=0)

    fig_heatmap = px.imshow(
        heatmap_norm,
        labels=dict(x='Month', y='Branch', color='Relative Revenue'),
        x=[m[:3] for m in months],
        y=[b.replace('Stories ', '') for b in heatmap_data.index],
        color_continuous_scale='YlOrBr',
        title='Branch Seasonality Heatmap (Relative to Each Branch\'s Peak)',
        aspect='auto',
    )
    fig_heatmap.update_layout(height=700, template='plotly_white')

    return fig_trend, fig_heatmap, chain_monthly


def category_mix_analysis(category_df):
    """
    Beverages vs Food performance analysis per branch.
    """
    df = category_df[~category_df['IsAggregate']].copy()

    # Pivot: Branch × Category
    pivot = df.pivot_table(
        index='Branch',
        columns='Category',
        values=['TrueRevenue', 'TotalProfit', 'Qty', 'ProfitMargin'],
        aggfunc='sum',
    ).reset_index()

    # Flatten columns
    pivot.columns = ['_'.join(col).strip('_') if isinstance(col, tuple) else col
                     for col in pivot.columns]

    # Beverage share %
    bev_rev = df[df['Category'] == 'BEVERAGES'].groupby('Branch')['TrueRevenue'].sum()
    food_rev = df[df['Category'] == 'FOOD'].groupby('Branch')['TrueRevenue'].sum()
    total_rev = bev_rev.add(food_rev, fill_value=0)
    bev_share = (bev_rev / total_rev * 100).reset_index()
    bev_share.columns = ['Branch', 'BeverageSharePct']

    # Stacked bar chart
    chart_data = df.copy()
    chart_data['Branch_Short'] = chart_data['Branch'].str.replace('Stories ', '')

    fig = px.bar(
        chart_data,
        x='Branch_Short',
        y='TrueRevenue',
        color='Category',
        barmode='stack',
        title='Revenue Breakdown: Beverages vs Food by Branch',
        labels={'TrueRevenue': 'Revenue', 'Branch_Short': 'Branch'},
        color_discrete_map={'BEVERAGES': '#8B4513', 'FOOD': '#DEB887'},
        hover_data={'ProfitMargin': ':.1f'},
    )

    fig.update_layout(
        height=500,
        template='plotly_white',
        xaxis_tickangle=-45,
    )

    return fig, bev_share


def service_type_analysis(product_df):
    """
    Analyze revenue split by service type (TAKE AWAY vs TABLE vs Toters).
    """
    # Filter to non-aggregate product rows
    df = product_df[~product_df['IsAggregate']].copy()

    # Group by branch + service type
    service_rev = df.groupby(['Branch', 'ServiceType']).agg(
        Revenue=('TrueRevenue', 'sum'),
        Profit=('TotalProfit', 'sum'),
        Qty=('Qty', 'sum'),
    ).reset_index()

    service_rev['Branch_Short'] = service_rev['Branch'].str.replace('Stories ', '')

    fig = px.bar(
        service_rev,
        x='Branch_Short',
        y='Revenue',
        color='ServiceType',
        barmode='stack',
        title='Revenue by Service Channel (Take Away vs Dine-In vs Delivery)',
        labels={'Revenue': 'Revenue', 'Branch_Short': 'Branch', 'ServiceType': 'Channel'},
        color_discrete_map={
            'TAKE AWAY': '#3498db',
            'TABLE': '#2ecc71',
            'Toters': '#e74c3c',
        },
    )

    fig.update_layout(
        height=500,
        template='plotly_white',
        xaxis_tickangle=-45,
    )

    return fig, service_rev


def top_bottom_branches(monthly_df, n=5):
    """Get top and bottom N branches by 2025 revenue."""
    df_2025 = monthly_df[monthly_df['Year'] == 2025].sort_values('Total_By_Year', ascending=False)
    top = df_2025.head(n)[['Branch', 'Total_By_Year', 'Region']].copy()
    bottom = df_2025.tail(n)[['Branch', 'Total_By_Year', 'Region']].copy()
    return top, bottom


def chain_kpis(monthly_df, category_df, product_df):
    """Compute chain-level KPIs."""
    df_2025 = monthly_df[monthly_df['Year'] == 2025]
    cat_data = category_df[~category_df['IsAggregate']]

    total_revenue = cat_data['TrueRevenue'].sum()
    total_profit = cat_data['TotalProfit'].sum()
    total_cost = cat_data['TotalCost'].sum()
    avg_margin = total_profit / total_revenue * 100 if total_revenue > 0 else 0
    n_branches = df_2025['Branch'].nunique()

    # Count unique products
    products = product_df[
        (~product_df['IsAggregate']) &
        (~product_df['Product'].str.startswith('Total'))
    ]
    n_products = products['Product'].nunique()

    total_qty = cat_data['Qty'].sum()

    return {
        'total_revenue': total_revenue,
        'total_profit': total_profit,
        'total_cost': total_cost,
        'avg_margin': avg_margin,
        'n_branches': n_branches,
        'n_products': n_products,
        'total_qty': total_qty,
    }
