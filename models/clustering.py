"""
Stories Coffee — Branch Clustering
====================================
Cluster branches into strategic segments based on performance features.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import plotly.express as px
import plotly.graph_objects as go


def build_branch_features(monthly_df, category_df, product_df):
    """
    Build feature matrix for branch clustering.
    Features: revenue, margin, category mix, seasonality, growth, volume.
    """
    months = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']

    df_2025 = monthly_df[monthly_df['Year'] == 2025].copy()
    df_2026 = monthly_df[monthly_df['Year'] == 2026].copy()

    features = []
    for _, row in df_2025.iterrows():
        branch = row['Branch']

        # Revenue
        total_rev = row['Total_By_Year']
        month_vals = [row[m] for m in months]
        active_months = sum(1 for v in month_vals if v > 0)

        # Seasonality: coefficient of variation across active months
        active_vals = [v for v in month_vals if v > 0]
        seasonality_cv = np.std(active_vals) / np.mean(active_vals) if len(active_vals) > 1 and np.mean(active_vals) > 0 else 0

        # Summer vs winter ratio
        summer = sum(row[m] for m in ['June', 'July', 'August'])
        winter = sum(row[m] for m in ['December', 'January', 'February'])
        summer_winter_ratio = summer / winter if winter > 0 else 0

        # Growth (Jan 2026 vs Jan 2025)
        j25 = row['January']
        j26_row = df_2026[df_2026['Branch'] == branch]
        j26 = j26_row['January'].values[0] if len(j26_row) > 0 else 0
        growth = (j26 - j25) / j25 * 100 if j25 > 0 else (100 if j26 > 0 else 0)

        # Category mix
        cat = category_df[(category_df['Branch'] == branch) & (~category_df['IsAggregate'])]
        bev_rev = cat[cat['Category'] == 'BEVERAGES']['TrueRevenue'].sum()
        food_rev = cat[cat['Category'] == 'FOOD']['TrueRevenue'].sum()
        bev_share = bev_rev / (bev_rev + food_rev) * 100 if (bev_rev + food_rev) > 0 else 50

        # Margin
        total_profit = cat['TotalProfit'].sum()
        total_actual_rev = cat['TrueRevenue'].sum()
        margin = total_profit / total_actual_rev * 100 if total_actual_rev > 0 else 0

        # Volume (total qty)
        total_qty = cat['Qty'].sum()

        # Service type diversity
        branch_products = product_df[product_df['Branch'] == branch]
        service_types = branch_products['ServiceType'].nunique()

        features.append({
            'Branch': branch,
            'Region': row['Region'],
            'Total_Revenue': total_rev,
            'Active_Months': active_months,
            'Seasonality_CV': seasonality_cv,
            'Summer_Winter_Ratio': summer_winter_ratio,
            'Growth_Pct': growth,
            'Beverage_Share_Pct': bev_share,
            'Profit_Margin_Pct': margin,
            'Total_Qty': total_qty,
            'Service_Types': service_types,
            'Revenue_Per_Month': total_rev / active_months if active_months > 0 else 0,
        })

    return pd.DataFrame(features)


def cluster_branches(features_df, n_clusters=4):
    """
    Apply KMeans clustering on branch features.
    """
    feature_cols = ['Total_Revenue', 'Seasonality_CV', 'Growth_Pct',
                    'Beverage_Share_Pct', 'Profit_Margin_Pct', 'Revenue_Per_Month']

    X = features_df[feature_cols].fillna(0).values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)

    features_df = features_df.copy()
    features_df['Cluster_ID'] = clusters

    # Name clusters based on characteristics
    cluster_names = {}
    for c in range(n_clusters):
        cluster_data = features_df[features_df['Cluster_ID'] == c]
        avg_rev = cluster_data['Total_Revenue'].mean()
        avg_growth = cluster_data['Growth_Pct'].mean()
        avg_margin = cluster_data['Profit_Margin_Pct'].mean()

        if avg_rev > features_df['Total_Revenue'].median() and avg_growth > 0:
            cluster_names[c] = 'Flagship'
        elif avg_rev > features_df['Total_Revenue'].median():
            cluster_names[c] = 'Cash Cow'
        elif avg_growth > features_df['Growth_Pct'].median():
            cluster_names[c] = 'Growth Engine'
        else:
            cluster_names[c] = 'Emerging'

    # Ensure unique names
    name_counts = {}
    for c, name in cluster_names.items():
        if name in name_counts:
            name_counts[name] += 1
            cluster_names[c] = f"{name} {name_counts[name]}"
        else:
            name_counts[name] = 1

    features_df['Cluster'] = features_df['Cluster_ID'].map(cluster_names)

    return features_df, kmeans, scaler


def cluster_chart(features_df):
    """
    Create scatter plot of clusters.
    """
    df = features_df.copy()
    df['Branch_Short'] = df['Branch'].str.replace('Stories ', '')

    fig = px.scatter(
        df,
        x='Revenue_Per_Month',
        y='Profit_Margin_Pct',
        color='Cluster',
        size='Total_Qty',
        hover_name='Branch_Short',
        hover_data={
            'Growth_Pct': ':.1f',
            'Total_Revenue': ':,.0f',
            'Region': True,
            'Active_Months': True,
        },
        title='Branch Clusters — Monthly Efficiency vs Profitability',
        labels={
            'Revenue_Per_Month': 'Revenue per Active Month',
            'Profit_Margin_Pct': 'Profit Margin %',
        },
    )

    fig.update_layout(
        height=550,
        template='plotly_white',
    )

    return fig


def cluster_radar(features_df):
    """
    Create radar chart comparing clusters.
    """
    metrics = ['Total_Revenue', 'Growth_Pct', 'Profit_Margin_Pct',
               'Beverage_Share_Pct', 'Seasonality_CV', 'Revenue_Per_Month']
    labels = ['Revenue', 'Growth', 'Margin', 'Beverage Mix', 'Seasonality', 'Efficiency']

    fig = go.Figure()

    for cluster in features_df['Cluster'].unique():
        cl_data = features_df[features_df['Cluster'] == cluster]
        # Normalize each metric to 0-1 scale
        values = []
        for m in metrics:
            col_min = features_df[m].min()
            col_max = features_df[m].max()
            col_range = col_max - col_min if col_max != col_min else 1
            values.append((cl_data[m].mean() - col_min) / col_range)

        fig.add_trace(go.Scatterpolar(
            r=values + [values[0]],  # Close the polygon
            theta=labels + [labels[0]],
            name=cluster,
            fill='toself',
            opacity=0.5,
        ))

    fig.update_layout(
        polar=dict(radialaxis=dict(visible=True, range=[0, 1])),
        title='Cluster Profiles — Radar Comparison',
        height=500,
        template='plotly_white',
    )

    return fig


def cluster_recommendations(features_df):
    """
    Generate strategic recommendations per cluster.
    """
    recs = {}
    for cluster in features_df['Cluster'].unique():
        cl_data = features_df[features_df['Cluster'] == cluster]
        branches = cl_data['Branch'].tolist()

        avg_rev = cl_data['Total_Revenue'].mean()
        avg_growth = cl_data['Growth_Pct'].mean()
        avg_margin = cl_data['Profit_Margin_Pct'].mean()

        if 'Flagship' in cluster:
            strategy = "Protect and Optimize — These are your revenue powerhouses. Focus on margin improvement, modifier upsells, and operational efficiency. Don't change what works."
        elif 'Cash Cow' in cluster:
            strategy = "Harvest Profits — High revenue but slower growth. Optimize costs, push high-margin products, and consider if some innovation could reignite growth."
        elif 'Growth' in cluster:
            strategy = "Invest and Expand — These branches show high growth potential. Invest in marketing, introduce full product range, and build local customer base."
        else:
            strategy = "Evaluate and Experiment — Newer or smaller branches. Test new products, understand local demand, and decide on long-term viability."

        recs[cluster] = {
            'branches': branches,
            'strategy': strategy,
            'avg_revenue': avg_rev,
            'avg_growth': avg_growth,
            'avg_margin': avg_margin,
        }

    return recs
