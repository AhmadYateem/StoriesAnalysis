"""
Stories Coffee — Margin Leak Analysis
======================================
The "200K Report": Identifies and dollar-quantifies every profit leak.
This is the #1 McKinsey-grade insight — actionable, specific, and scary.
"""

import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go


def find_negative_margin_products(product_df):
    """
    Find all products with negative profit margins (losing money on each sale).
    """
    df = product_df[
        (~product_df['IsAggregate']) &
        (product_df['Qty'] > 0) &
        (product_df['TotalProfit'] < 0)
    ].copy()

    df['Loss_Amount'] = df['TotalProfit'].abs()
    df['Branch_Short'] = df['Branch'].str.replace('Stories ', '')

    df = df.sort_values('Loss_Amount', ascending=False)

    return df[['Branch', 'Branch_Short', 'ServiceType', 'Category', 'Section',
               'Product', 'Qty', 'TrueRevenue', 'TotalCost', 'TotalProfit',
               'ProfitPct', 'Loss_Amount', 'UnitRevenue', 'UnitCost']]


def find_zero_revenue_modifiers(product_df):
    """
    Find modifiers/products charged at $0 but with real costs.
    These are hidden margin destroyers.
    """
    df = product_df[
        (~product_df['IsAggregate']) &
        (product_df['TotalPrice'] == 0) &
        (product_df['TotalCost'] > 0) &
        (product_df['Qty'] > 0)
    ].copy()

    df['Absorbed_Cost'] = df['TotalCost']
    df = df.sort_values('Absorbed_Cost', ascending=False)

    return df[['Branch', 'ServiceType', 'Product', 'Qty', 'TotalCost',
               'Absorbed_Cost']]


def find_underpriced_products(product_df, margin_threshold=10):
    """
    Find products with abnormally low margins (below threshold %)
    that are being sold in significant volume.
    """
    df = product_df[
        (~product_df['IsAggregate']) &
        (product_df['Qty'] >= 10) &  # Meaningful volume
        (product_df['ProfitPct'] < margin_threshold) &
        (product_df['ProfitPct'] > -500) &  # Not data errors
        (product_df['TrueRevenue'] > 0) &
        (~product_df['Product'].str.startswith('Total'))
    ].copy()

    df = df.sort_values('TotalProfit', ascending=True)
    return df


def veggie_sub_analysis(product_df):
    """
    Deep dive into the Veggie Sub pricing disaster.
    """
    veggie = product_df[
        product_df['Product'].str.contains('VEGGIE', case=False, na=False) &
        (~product_df['IsAggregate'])
    ].copy()

    if len(veggie) == 0:
        return None, {}

    total_qty = veggie['Qty'].sum()
    total_revenue = veggie['TrueRevenue'].sum()
    total_cost = veggie['TotalCost'].sum()
    total_loss = veggie['TotalProfit'].sum()

    # What it should be priced at (benchmark against other subs)
    subs = product_df[
        product_df['Product'].str.contains('SUB|SANDWICH', case=False, na=False) &
        (~product_df['IsAggregate']) &
        (~product_df['Product'].str.contains('VEGGIE', case=False, na=False)) &
        (product_df['Qty'] > 0) &
        (product_df['ProfitPct'] > 30)
    ]
    if len(subs) > 0:
        avg_sub_price = subs['UnitRevenue'].mean()
    else:
        avg_sub_price = 150  # fallback estimate

    potential_revenue = total_qty * avg_sub_price
    recoverable = potential_revenue - total_revenue

    stats = {
        'total_qty': total_qty,
        'total_revenue': total_revenue,
        'total_cost': total_cost,
        'total_loss': abs(total_loss),
        'avg_unit_price': total_revenue / total_qty if total_qty > 0 else 0,
        'avg_unit_cost': total_cost / total_qty if total_qty > 0 else 0,
        'benchmark_price': avg_sub_price,
        'recoverable_revenue': recoverable,
    }

    return veggie, stats


def free_modifiers_cost(product_df):
    """
    Quantify the total cost absorbed by free modifiers.
    """
    free_mods = product_df[
        (~product_df['IsAggregate']) &
        (product_df['TotalPrice'] == 0) &
        (product_df['TotalCost'] > 0) &
        (product_df['Qty'] > 0)
    ].copy()

    # Group by product type
    summary = free_mods.groupby('Product').agg(
        Total_Qty=('Qty', 'sum'),
        Total_Cost=('TotalCost', 'sum'),
        Branches=('Branch', 'nunique'),
    ).sort_values('Total_Cost', ascending=False).reset_index()

    total_absorbed = summary['Total_Cost'].sum()

    return summary, total_absorbed


def cheesecake_margin_analysis(product_df):
    """
    Analyze the cheesecake margin problem — all varieties significantly below food avg.
    """
    cheese = product_df[
        product_df['Product'].str.contains('CHEESE CAKE|CHEESECAKE', case=False, na=False) &
        (~product_df['IsAggregate']) &
        (product_df['Qty'] > 0)
    ].copy()

    if len(cheese) == 0:
        return None, {}

    # Food average margin
    food = product_df[
        (product_df['Category'] == 'FOOD') &
        (~product_df['IsAggregate']) &
        (product_df['Qty'] > 0)
    ]
    food_avg_margin = food['TotalProfit'].sum() / food['TrueRevenue'].sum() * 100 if food['TrueRevenue'].sum() > 0 else 63

    cheese_margin = cheese['TotalProfit'].sum() / cheese['TrueRevenue'].sum() * 100 if cheese['TrueRevenue'].sum() > 0 else 0
    margin_gap = food_avg_margin - cheese_margin

    # If cheesecakes had food avg margin, how much more profit?
    additional_profit = cheese['TrueRevenue'].sum() * margin_gap / 100

    stats = {
        'total_qty': cheese['Qty'].sum(),
        'total_revenue': cheese['TrueRevenue'].sum(),
        'cheese_margin': cheese_margin,
        'food_avg_margin': food_avg_margin,
        'margin_gap': margin_gap,
        'additional_profit_potential': additional_profit,
    }

    return cheese, stats


def amioun_pricing_analysis(product_df):
    """
    Analyze the Stories Amioun TABLE pricing catastrophe.
    """
    amioun = product_df[
        (product_df['Branch'].str.contains('Amioun', case=False, na=False)) &
        (product_df['ServiceType'] == 'TABLE') &
        (~product_df['IsAggregate']) &
        (product_df['ProfitPct'] < 0) &
        (product_df['Qty'] > 0)
    ].copy()

    if len(amioun) == 0:
        # Try all service types
        amioun = product_df[
            (product_df['Branch'].str.contains('Amioun', case=False, na=False)) &
            (~product_df['IsAggregate']) &
            (product_df['ProfitPct'] < 0) &
            (product_df['Qty'] > 0)
        ].copy()

    total_loss = amioun['TotalProfit'].sum() if len(amioun) > 0 else 0

    return amioun, abs(total_loss)


def generate_margin_leak_report(product_df):
    """
    Generate the complete margin leak report with all findings and total impact.
    """
    leaks = []

    # 1. Negative margin products
    neg_margin = find_negative_margin_products(product_df)
    total_neg_loss = neg_margin['Loss_Amount'].sum()
    leaks.append({
        'Leak': 'Negative Margin Products',
        'Description': f'{len(neg_margin)} products sold at a loss across all branches',
        'Annual_Loss': total_neg_loss,
        'Fix': 'Reprice or discontinue loss-making items',
        'Priority': 'Critical',
    })

    # 2. Veggie Sub
    _, veggie_stats = veggie_sub_analysis(product_df)
    if veggie_stats:
        leaks.append({
            'Leak': 'Veggie Sub Mispricing',
            'Description': f'{veggie_stats.get("total_qty", 0):,.0f} units sold at ~{veggie_stats.get("avg_unit_price", 0):.0f}/unit vs cost of ~{veggie_stats.get("avg_unit_cost", 0):.0f}/unit',
            'Annual_Loss': veggie_stats.get('total_loss', 0),
            'Fix': f'Reprice to ~{veggie_stats.get("benchmark_price", 150):.0f}/unit (benchmark with other subs)',
            'Priority': 'Critical',
        })

    # 3. Free modifiers
    _, total_absorbed = free_modifiers_cost(product_df)
    leaks.append({
        'Leak': 'Zero-Revenue Modifiers',
        'Description': 'Decafe shots, lactose-free milk, skimmed milk charged at $0 with real COGS',
        'Annual_Loss': total_absorbed,
        'Fix': 'Add nominal charge (~30-50% of cost) or track as loyalty cost',
        'Priority': 'Medium',
    })

    # 4. Cheesecake margins
    _, cheese_stats = cheesecake_margin_analysis(product_df)
    if cheese_stats:
        leaks.append({
            'Leak': 'Cheesecake Low Margins',
            'Description': f'All cheesecakes at ~{cheese_stats.get("cheese_margin", 0):.0f}% margin vs {cheese_stats.get("food_avg_margin", 63):.0f}% food average',
            'Annual_Loss': cheese_stats.get('additional_profit_potential', 0),
            'Fix': 'Raise price 15-20% or renegotiate supplier costs',
            'Priority': 'Medium',
        })

    # 5. Amioun TABLE pricing
    _, amioun_loss = amioun_pricing_analysis(product_df)
    if amioun_loss > 0:
        leaks.append({
            'Leak': 'Amioun TABLE POS Error',
            'Description': 'Systematic underpricing of items at Amioun dine-in service',
            'Annual_Loss': amioun_loss,
            'Fix': 'Audit and fix POS pricing tables for TABLE service type',
            'Priority': 'Critical',
        })

    leak_df = pd.DataFrame(leaks)
    total_leaks = leak_df['Annual_Loss'].sum()

    return leak_df, total_leaks


def margin_leak_waterfall(leak_df):
    """
    Create a waterfall chart showing cumulative margin leaks.
    """
    leak_df_sorted = leak_df.sort_values('Annual_Loss', ascending=False)

    fig = go.Figure(go.Waterfall(
        name='Margin Leaks',
        orientation='v',
        x=leak_df_sorted['Leak'].tolist() + ['Total Recoverable'],
        y=list(-leak_df_sorted['Annual_Loss']) + [leak_df_sorted['Annual_Loss'].sum()],
        measure=['relative'] * len(leak_df_sorted) + ['total'],
        connector=dict(line=dict(color='#666')),
        decreasing=dict(marker=dict(color='#e74c3c')),
        increasing=dict(marker=dict(color='#2ecc71')),
        totals=dict(marker=dict(color='#3498db')),
        text=[f'-{v:,.0f}' for v in leak_df_sorted['Annual_Loss']] + [f'+{leak_df_sorted["Annual_Loss"].sum():,.0f}'],
        textposition='outside',
    ))

    fig.update_layout(
        title='Profit Leak Waterfall — Annual Impact',
        yaxis_title='Profit Impact',
        height=500,
        template='plotly_white',
        showlegend=False,
    )

    return fig
