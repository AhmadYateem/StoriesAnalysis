"""
Stories Coffee — Sales Forecasting
====================================
Time series forecasting for branch-level sales using multiple approaches.
Supports Prophet, exponential smoothing, and XGBoost with time features.
"""

import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')


def prepare_time_series(monthly_df, branch=None):
    """
    Convert monthly sales data into time series format.
    Returns DataFrame with columns: [ds, y, Branch]
    """
    months = ['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December']
    month_nums = {m: i+1 for i, m in enumerate(months)}

    df = monthly_df.copy()
    if branch:
        df = df[df['Branch'] == branch]

    records = []
    for _, row in df.iterrows():
        year = int(row['Year'])
        for month_name in months:
            val = row.get(month_name, 0)
            if val > 0:  # Only include months with actual data
                month_num = month_nums[month_name]
                date = pd.Timestamp(year=year, month=month_num, day=1)
                records.append({
                    'ds': date,
                    'y': val,
                    'Branch': row['Branch'],
                    'Year': year,
                    'Month': month_num,
                })

    return pd.DataFrame(records)


def forecast_branch_xgboost(monthly_df, branch, forecast_months=11):
    """
    Forecast using XGBoost with time features.
    Forecasts Feb-Dec 2026 (11 months).
    """
    from sklearn.ensemble import GradientBoostingRegressor

    ts = prepare_time_series(monthly_df, branch)
    if len(ts) < 3:
        return None

    # Feature engineering — encode month as cyclical (sin/cos) so
    # January and December are close in feature space, plus a linear
    # trend for secular growth and raw month for residual seasonality.
    ts['month_sin'] = np.sin(2 * np.pi * ts['Month'] / 12)
    ts['month_cos'] = np.cos(2 * np.pi * ts['Month'] / 12)
    ts['months_since_start'] = (ts['Year'] - 2025) * 12 + ts['Month']

    features = ['month_sin', 'month_cos', 'months_since_start', 'Month']
    X = ts[features].values
    y = ts['y'].values

    model = GradientBoostingRegressor(
        n_estimators=100,
        max_depth=3,
        learning_rate=0.1,
        random_state=42,
    )
    model.fit(X, y)

    # Generate future dates (Feb-Dec 2026)
    future_records = []
    for month in range(2, 13):
        future_records.append({
            'Month': month,
            'month_sin': np.sin(2 * np.pi * month / 12),
            'month_cos': np.cos(2 * np.pi * month / 12),
            'months_since_start': (2026 - 2025) * 12 + month,
        })

    future_df = pd.DataFrame(future_records)
    X_future = future_df[features].values
    predictions = model.predict(X_future)

    # Ensure non-negative
    predictions = np.maximum(predictions, 0)

    # Simple confidence interval derived from training residuals.
    # 1.5x std gives approximately 86% coverage under Gaussian assumption.
    train_preds = model.predict(X)
    residual_std = np.std(y - train_preds)

    forecast_df = pd.DataFrame({
        'ds': [pd.Timestamp(2026, m, 1) for m in range(2, 13)],
        'yhat': predictions,
        'yhat_lower': predictions - 1.5 * residual_std,
        'yhat_upper': predictions + 1.5 * residual_std,
        'Month': list(range(2, 13)),
        'Branch': branch,
    })
    forecast_df['yhat_lower'] = forecast_df['yhat_lower'].clip(lower=0)

    return forecast_df


def forecast_all_branches(monthly_df):
    """
    Forecast 2026 for all branches.
    Returns combined DataFrame with forecasts.
    """
    all_forecasts = []
    branches = monthly_df['Branch'].unique()

    for branch in branches:
        try:
            fc = forecast_branch_xgboost(monthly_df, branch)
            if fc is not None:
                all_forecasts.append(fc)
        except Exception as e:
            print(f"  ⚠️ Could not forecast {branch}: {e}")

    if all_forecasts:
        return pd.concat(all_forecasts, ignore_index=True)
    return pd.DataFrame()


def compute_2026_projections(monthly_df, forecasts_df):
    """
    Combine actual Jan 2026 + forecast Feb-Dec 2026 for full year projection.
    """
    df_2026 = monthly_df[monthly_df['Year'] == 2026].copy()

    projections = []
    for branch in df_2026['Branch'].unique():
        jan_actual = df_2026[df_2026['Branch'] == branch]['January'].values[0]

        branch_fc = forecasts_df[forecasts_df['Branch'] == branch]
        if len(branch_fc) > 0:
            forecast_sum = branch_fc['yhat'].sum()
        else:
            forecast_sum = 0

        total_2026 = jan_actual + forecast_sum

        # Get 2025 total for comparison
        df_2025 = monthly_df[(monthly_df['Year'] == 2025) & (monthly_df['Branch'] == branch)]
        total_2025 = df_2025['Total_By_Year'].values[0] if len(df_2025) > 0 else 0

        yoy_growth = (total_2026 - total_2025) / total_2025 * 100 if total_2025 > 0 else 0

        projections.append({
            'Branch': branch,
            'Jan_2026_Actual': jan_actual,
            'Feb_Dec_Forecast': forecast_sum,
            'Projected_2026_Total': total_2026,
            'Actual_2025_Total': total_2025,
            'YoY_Growth_Pct': yoy_growth,
        })

    return pd.DataFrame(projections)


def forecast_chart(monthly_df, forecast_df, branch):
    """
    Create plotly chart showing historical data + forecast for a branch.
    """
    import plotly.graph_objects as go

    # Historical data
    ts = prepare_time_series(monthly_df, branch)

    fig = go.Figure()

    # Historical line
    fig.add_trace(go.Scatter(
        x=ts['ds'],
        y=ts['y'],
        mode='lines+markers',
        name='Historical',
        line=dict(color='#8B4513', width=2),
        marker=dict(size=6),
    ))

    # Forecast
    if forecast_df is not None and len(forecast_df) > 0:
        branch_fc = forecast_df[forecast_df['Branch'] == branch]
        if len(branch_fc) > 0:
            fig.add_trace(go.Scatter(
                x=branch_fc['ds'],
                y=branch_fc['yhat'],
                mode='lines+markers',
                name='Forecast',
                line=dict(color='#3498db', width=2, dash='dash'),
                marker=dict(size=6),
            ))

            # Confidence interval
            fig.add_trace(go.Scatter(
                x=pd.concat([branch_fc['ds'], branch_fc['ds'][::-1]]),
                y=pd.concat([branch_fc['yhat_upper'], branch_fc['yhat_lower'][::-1]]),
                fill='toself',
                fillcolor='rgba(52, 152, 219, 0.15)',
                line=dict(color='rgba(255,255,255,0)'),
                name='Confidence Interval',
                showlegend=True,
            ))

    # Jan 2026 point (actual)
    df_2026 = monthly_df[(monthly_df['Year'] == 2026) & (monthly_df['Branch'] == branch)]
    if len(df_2026) > 0:
        jan_val = df_2026['January'].values[0]
        if jan_val > 0:
            fig.add_trace(go.Scatter(
                x=[pd.Timestamp(2026, 1, 1)],
                y=[jan_val],
                mode='markers',
                name='Jan 2026 (Actual)',
                marker=dict(size=12, color='#e74c3c', symbol='star'),
            ))

    fig.update_layout(
        title=f'Sales Forecast — {branch}',
        xaxis_title='Date',
        yaxis_title='Revenue',
        height=450,
        template='plotly_white',
    )

    return fig
