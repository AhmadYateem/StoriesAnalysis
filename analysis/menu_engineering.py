"""
Stories Coffee — Menu Engineering Matrix
=========================================
Classic BCG-for-menus: Stars, Plowhorses, Puzzles, Dogs.
Plus modifier attachment rate analysis.
"""

import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go


def build_menu_matrix(product_df, min_qty=5):
    """
    Build menu engineering matrix — classify every product into 4 quadrants.

    Stars: High volume + High margin (promote aggressively)
    Plowhorses: High volume + Low margin (reprice)
    Puzzles: Low volume + High margin (market more)
    Dogs: Low volume + Low margin (consider removing)
    """
    # Filter to individual products only
    df = product_df[
        (~product_df['IsAggregate']) &
        (product_df['Qty'] >= min_qty) &
        (~product_df['Product'].str.startswith('Total')) &
        (~product_df['Product'].str.startswith('ADD ')) &  # Exclude modifiers
        (~product_df['Product'].str.startswith('REPLACE ')) &
        (product_df['TrueRevenue'] > 0)
    ].copy()

    # Aggregate across all branches for chain-level view
    chain = df.groupby('Product').agg(
        Total_Qty=('Qty', 'sum'),
        Total_Revenue=('TrueRevenue', 'sum'),
        Total_Cost=('TotalCost', 'sum'),
        Total_Profit=('TotalProfit', 'sum'),
        Branches=('Branch', 'nunique'),
        Category=('Category', 'first'),
        Section=('Section', 'first'),
    ).reset_index()

    chain['Margin_Pct'] = np.where(
        chain['Total_Revenue'] > 0,
        chain['Total_Profit'] / chain['Total_Revenue'] * 100,
        0
    )
    chain['Unit_Profit'] = np.where(
        chain['Total_Qty'] > 0,
        chain['Total_Profit'] / chain['Total_Qty'],
        0
    )
    chain['Unit_Revenue'] = np.where(
        chain['Total_Qty'] > 0,
        chain['Total_Revenue'] / chain['Total_Qty'],
        0
    )

    # Compute medians for quadrant thresholds
    med_qty = chain['Total_Qty'].median()
    med_margin = chain['Margin_Pct'].median()

    def classify(row):
        high_vol = row['Total_Qty'] >= med_qty
        high_margin = row['Margin_Pct'] >= med_margin
        if high_vol and high_margin:
            return '⭐ Star'
        elif high_vol and not high_margin:
            return '🐴 Plowhorse'
        elif not high_vol and high_margin:
            return '🧩 Puzzle'
        else:
            return '🐕 Dog'

    chain['Quadrant'] = chain.apply(classify, axis=1)

    return chain, med_qty, med_margin


def menu_matrix_chart(chain_df, med_qty, med_margin):
    """
    Create interactive plotly scatter of the menu engineering matrix.
    """
    fig = px.scatter(
        chain_df,
        x='Total_Qty',
        y='Margin_Pct',
        size='Total_Revenue',
        color='Quadrant',
        hover_name='Product',
        hover_data={
            'Total_Qty': ':,.0f',
            'Margin_Pct': ':.1f',
            'Total_Revenue': ':,.0f',
            'Total_Profit': ':,.0f',
            'Branches': True,
            'Category': True,
        },
        color_discrete_map={
            '⭐ Star': '#2ecc71',
            '🐴 Plowhorse': '#3498db',
            '🧩 Puzzle': '#f39c12',
            '🐕 Dog': '#e74c3c',
        },
        title='Menu Engineering Matrix — Volume vs Margin',
        labels={
            'Total_Qty': 'Total Quantity Sold (Chain-Wide)',
            'Margin_Pct': 'Profit Margin %',
        },
        log_x=True,
    )

    fig.add_hline(y=med_margin, line_dash='dash', line_color='gray', opacity=0.5,
                  annotation_text=f'Median Margin: {med_margin:.1f}%')
    fig.add_vline(x=med_qty, line_dash='dash', line_color='gray', opacity=0.5,
                  annotation_text=f'Median Qty: {med_qty:,.0f}')

    fig.update_layout(
        height=650,
        template='plotly_white',
        font=dict(family='Inter, sans-serif'),
    )

    return fig


def modifier_attachment_analysis(product_df):
    """
    Analyze modifier attachment rates across branches.
    Key modifiers: ADD SHOT, REPLACE ALT MILKS, DRIZZLES, WHIPPED CREAM.
    """
    df = product_df[
        (~product_df['IsAggregate']) &
        (product_df['Qty'] > 0)
    ].copy()

    # Identify modifiers vs base drinks
    modifier_keywords = ['ADD ', 'REPLACE ']
    df['IsModifier'] = df['Product'].apply(
        lambda x: any(x.startswith(kw) for kw in modifier_keywords) if isinstance(x, str) else False
    )

    # Per branch: modifier qty vs base beverage qty
    branch_stats = []
    for branch in df['Branch'].unique():
        branch_df = df[df['Branch'] == branch]
        bev_df = branch_df[branch_df['Category'] == 'BEVERAGES']

        base_qty = bev_df[~bev_df['IsModifier']]['Qty'].sum()
        modifier_qty = bev_df[bev_df['IsModifier']]['Qty'].sum()

        modifier_profit = bev_df[bev_df['IsModifier']]['TotalProfit'].sum()
        modifier_revenue = bev_df[bev_df['IsModifier']]['TrueRevenue'].sum()

        attach_rate = modifier_qty / base_qty * 100 if base_qty > 0 else 0

        branch_stats.append({
            'Branch': branch,
            'Branch_Short': branch.replace('Stories ', ''),
            'Base_Beverage_Qty': base_qty,
            'Modifier_Qty': modifier_qty,
            'Attach_Rate_Pct': attach_rate,
            'Modifier_Profit': modifier_profit,
            'Modifier_Revenue': modifier_revenue,
            'Modifier_Margin': modifier_profit / modifier_revenue * 100 if modifier_revenue > 0 else 0,
        })

    stats_df = pd.DataFrame(branch_stats).sort_values('Attach_Rate_Pct', ascending=False)

    # Quantify opportunity: if all branches matched top performer
    top_rate = stats_df['Attach_Rate_Pct'].max()
    avg_modifier_profit_per_unit = stats_df['Modifier_Profit'].sum() / stats_df['Modifier_Qty'].sum() if stats_df['Modifier_Qty'].sum() > 0 else 0

    opportunity = 0
    for _, row in stats_df.iterrows():
        gap = top_rate - row['Attach_Rate_Pct']
        additional_modifiers = row['Base_Beverage_Qty'] * gap / 100
        additional_profit = additional_modifiers * avg_modifier_profit_per_unit
        opportunity += additional_profit

    return stats_df, top_rate, opportunity


def modifier_chart(stats_df):
    """
    Create modifier attachment rate comparison chart.
    """
    fig = px.bar(
        stats_df.sort_values('Attach_Rate_Pct', ascending=True),
        x='Attach_Rate_Pct',
        y='Branch_Short',
        orientation='h',
        color='Attach_Rate_Pct',
        color_continuous_scale='YlOrRd',
        title='Modifier Attachment Rate by Branch',
        labels={'Attach_Rate_Pct': 'Modifier Attach Rate %', 'Branch_Short': 'Branch'},
        hover_data={
            'Modifier_Qty': ':,.0f',
            'Base_Beverage_Qty': ':,.0f',
            'Modifier_Profit': ':,.0f',
        },
    )

    fig.update_layout(
        height=600,
        template='plotly_white',
    )

    return fig


def top_products_by_profit(product_df, n=20):
    """
    Get top N products by total profit contribution (chain-wide).
    """
    df = product_df[
        (~product_df['IsAggregate']) &
        (~product_df['Product'].str.startswith('Total')) &
        (product_df['Qty'] > 0)
    ].copy()

    chain = df.groupby(['Product', 'Category']).agg(
        Total_Qty=('Qty', 'sum'),
        Total_Profit=('TotalProfit', 'sum'),
        Total_Revenue=('TrueRevenue', 'sum'),
        Avg_Margin=('ProfitPct', 'mean'),
    ).reset_index()

    chain = chain.sort_values('Total_Profit', ascending=False).head(n)
    return chain


def bottom_products_by_profit(product_df, n=20):
    """
    Get bottom N products by total profit (worst performers, including losses).
    """
    df = product_df[
        (~product_df['IsAggregate']) &
        (~product_df['Product'].str.startswith('Total')) &
        (product_df['Qty'] > 0)
    ].copy()

    chain = df.groupby(['Product', 'Category']).agg(
        Total_Qty=('Qty', 'sum'),
        Total_Profit=('TotalProfit', 'sum'),
        Total_Revenue=('TrueRevenue', 'sum'),
        Avg_Margin=('ProfitPct', 'mean'),
    ).reset_index()

    chain = chain.sort_values('Total_Profit', ascending=True).head(n)
    return chain
