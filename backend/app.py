"""
Flask backend for Stories Coffee Analytics Dashboard.

Endpoints:
  GET  /api/health    — Check if the backend is online
  POST /api/upload    — Upload CSV files and run the full pipeline
  GET  /api/data      — Return the pre-computed analysis (from default data)

The pipeline:
  1. data_cleaning.load_uploaded_data() → 4 DataFrames
  2. Analysis: chain_kpis, margin_leak_report, menu_matrix, modifier_attachment
  3. ML models: forecast_all_branches, cluster_branches
  4. Serialize everything into the AnalysisData JSON shape the React frontend expects
"""

import os
import sys
import json
import traceback
from io import BytesIO

from flask import Flask, request, jsonify
from flask_cors import CORS

# Add the project root to the path so we can import the analysis modules
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

import pandas as pd
import numpy as np

from data_cleaning import load_all_data, load_uploaded_data
from analysis.branch_analysis import (
    seasonality_analysis,
    top_bottom_branches,
    chain_kpis,
    category_mix_analysis,
)
from analysis.margin_leaks import (
    generate_margin_leak_report,
    find_zero_revenue_modifiers,
    free_modifiers_cost,
    veggie_sub_analysis,
    cheesecake_margin_analysis,
    amioun_pricing_analysis,
    find_negative_margin_products,
)
from analysis.menu_engineering import (
    build_menu_matrix,
    modifier_attachment_analysis,
)
from models.forecasting import (
    forecast_all_branches,
    compute_2026_projections,
)
from models.clustering import (
    build_branch_features,
    cluster_branches,
    cluster_recommendations,
)

app = Flask(__name__)
CORS(app)

# ─── Pre-compute results from default data ───────────────────────────────────

_cached_result = None


def _run_pipeline(data: dict) -> dict:
    """
    Execute the full analysis pipeline on 4 DataFrames and return
    a JSON-serializable dict matching the React AnalysisData interface.
    """
    monthly    = data["monthly_sales"]
    products   = data["product_profitability"]
    categories = data["category_summary"]

    # ── Chain KPIs ──
    kpis_raw = chain_kpis(monthly, categories, products)

    # ── Top / bottom branches ──
    top_df, bottom_df = top_bottom_branches(monthly, n=5)

    # ── Seasonality (chain-monthly series) ──
    _, _, chain_monthly = seasonality_analysis(monthly)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_revenue = []
    for i, m in enumerate(months):
        val = float(chain_monthly.iloc[i]) / 1_000_000 if i < len(chain_monthly) else 0
        monthly_revenue.append({"month": m, "revenue": round(val, 1)})

    # ── Branch × Month heatmap ──
    heatmap_branches = []
    branch_monthly = {}
    for _, row in monthly.iterrows():
        branch = str(row["Branch"])
        if branch in heatmap_branches:
            continue
        heatmap_branches.append(branch)
        vals = []
        for m in months[:12]:
            col = {"Jan": "January", "Feb": "February", "Mar": "March",
                   "Apr": "April", "May": "May", "Jun": "June",
                   "Jul": "July", "Aug": "August", "Sep": "September",
                   "Oct": "October", "Nov": "November", "Dec": "December"}.get(m, m)
            vals.append(int(row.get(col, 0)))
        branch_monthly[branch] = vals
    # Only keep top 13 by total revenue
    sorted_branches = sorted(heatmap_branches, key=lambda b: sum(branch_monthly.get(b, [])), reverse=True)[:13]
    heatmap_branches = sorted_branches
    branch_monthly = {b: branch_monthly[b] for b in sorted_branches}

    # ── Margin leaks ──
    leak_df, total_leaks = generate_margin_leak_report(products)
    neg_df = find_negative_margin_products(products)
    zero_mod = find_zero_revenue_modifiers(products)
    mod_summary, total_absorbed = free_modifiers_cost(products)
    veggie_df, veggie_stats = veggie_sub_analysis(products)
    cheese_df, cheese_stats = cheesecake_margin_analysis(products)
    amioun_df, amioun_loss = amioun_pricing_analysis(products)

    waterfall_data = []
    leak_cards = []
    for _, row in leak_df.iterrows():
        waterfall_data.append({
            "name": str(row["Leak"]),
            "value": round(-abs(float(row["Annual_Loss"])) / 1_000_000, 1),
            "color": "hsl(0 80% 55%)" if abs(float(row["Annual_Loss"])) > 5_000_000 else "hsl(25 80% 42%)",
        })

    # Build leak cards (simplified — the full narrative is in defaultData)
    neg_total = float(neg_df["Loss_Amount"].sum()) if "Loss_Amount" in neg_df.columns else float(neg_df["TotalProfit"].sum())
    leak_cards = [
        {
            "icon": "TrendingDown", "title": "Negative Margin Products",
            "amount": f"{abs(neg_total)/1e6:.1f}M", "amountRaw": abs(neg_total),
            "detail": f"{len(neg_df)} products sold below cost.", "severity": "critical",
            "rootCause": f"{neg_df['Product'].nunique()} distinct products have COGS exceeding selling price.",
            "recommendation": "Reprice or discontinue. Run weekly automated margin check.",
        },
        {
            "icon": "Gift", "title": "Free Modifiers Bleeding Cash",
            "amount": f"{total_absorbed/1e6:.1f}M", "amountRaw": total_absorbed,
            "detail": f"Premium add-ons at zero price absorbing {total_absorbed/1e6:.1f}M/year.",
            "severity": "critical",
            "rootCause": "POS default config + competitive positioning + staff training gap.",
            "recommendation": "Implement tiered modifier pricing. Recovery potential: 30-50% of absorbed cost.",
        },
        {
            "icon": "CakeSlice", "title": "Cheesecake Underpricing",
            "amount": f"{cheese_stats.get('additional_profit_potential', 0)/1e6:.1f}M",
            "amountRaw": cheese_stats.get("additional_profit_potential", 0),
            "detail": f"{cheese_stats.get('cheese_margin', 0):.1f}% margin vs food avg.",
            "severity": "warning",
            "rootCause": "Priced on competitor benchmarks, not internal cost structure.",
            "recommendation": "Raise prices 15-20%.",
        },
        {
            "icon": "Leaf", "title": "Veggie Sub Crisis",
            "amount": f"{abs(veggie_stats.get('total_loss', 0))/1e6:.1f}M",
            "amountRaw": abs(veggie_stats.get("total_loss", 0)),
            "detail": f"{veggie_stats.get('total_qty', 0):,.0f} units sold below cost.",
            "severity": "critical",
            "rootCause": "POS data-entry error (price set to 7 instead of 70+).",
            "recommendation": "Fix POS pricing immediately.",
        },
        {
            "icon": "Monitor", "title": "Amioun POS Error",
            "amount": f"{abs(amioun_loss)/1e3:.0f}K",
            "amountRaw": abs(amioun_loss),
            "detail": "TABLE service undercharging at Amioun.",
            "severity": "info",
            "rootCause": "POS profile misconfigured.",
            "recommendation": "Audit and correct TABLE pricing.",
        },
    ]

    # Free modifier breakdown
    free_modifiers = []
    if not mod_summary.empty:
        top_mods = mod_summary.nlargest(10, "Total_Cost")
        for _, row in top_mods.iterrows():
            qty = int(row["Total_Qty"])
            cost = float(row["Total_Cost"])
            suggested = 10  # default suggested charge
            free_modifiers.append({
                "product": str(row["Product"]),
                "quantity": qty,
                "absorbedCost": round(cost),
                "suggestedCharge": suggested,
                "recoverable": round(qty * suggested * 0.3),
            })

    # ── Menu engineering ──
    matrix_df, med_qty, med_margin = build_menu_matrix(products)
    menu_products = []
    for _, row in matrix_df.head(25).iterrows():
        menu_products.append({
            "name": str(row["Product"])[:30],
            "volume": int(row["Total_Qty"]),
            "margin": round(float(row["Margin_Pct"]), 1),
            "quadrant": str(row["Quadrant"]).lower(),
        })

    quadrant_counts = matrix_df["Quadrant"].value_counts()
    quadrants = [
        {
            "name": f"Stars ({quadrant_counts.get('Star', 0)})",
            "icon": "Star", "desc": "Promote Aggressively", "color": "text-success",
            "items": matrix_df[matrix_df["Quadrant"] == "Star"].nlargest(4, "Total_Profit")["Product"].tolist(),
        },
        {
            "name": f"Puzzles ({quadrant_counts.get('Puzzle', 0)})",
            "icon": "Puzzle", "desc": "Market More", "color": "text-blue-500",
            "items": matrix_df[matrix_df["Quadrant"] == "Puzzle"].nlargest(3, "Margin_Pct")["Product"].tolist(),
        },
        {
            "name": f"Plowhorses ({quadrant_counts.get('Plowhorse', 0)})",
            "icon": "Beef", "desc": "Reprice or Optimize", "color": "text-accent",
            "items": matrix_df[matrix_df["Quadrant"] == "Plowhorse"].nlargest(3, "Total_Qty")["Product"].tolist(),
        },
        {
            "name": f"Dogs ({quadrant_counts.get('Dog', 0)})",
            "icon": "Dog", "desc": "Consider Removing", "color": "text-destructive",
            "items": matrix_df[matrix_df["Quadrant"] == "Dog"].nsmallest(3, "Margin_Pct")["Product"].tolist(),
        },
    ]

    # ── Modifier attach rates ──
    mod_stats, top_rate, opportunity = modifier_attachment_analysis(products)
    modifier_attach_rates = []
    for _, row in mod_stats.nlargest(11, "Attach_Rate_Pct").iterrows():
        modifier_attach_rates.append({
            "branch": str(row.get("Branch_Short", row.get("Branch", ""))),
            "rate": round(float(row["Attach_Rate_Pct"]), 1),
        })

    modifier_playbook = [
        {"step": 1, "text": "Train baristas on suggestive selling"},
        {"step": 2, "text": "Add modifier prompts in POS at checkout"},
        {"step": 3, "text": "\"Customize Your Drink\" boards at registers"},
        {"step": 4, "text": "Monthly barista competitions for attach rate"},
        {"step": 5, "text": "Stop giving free modifiers — charge per add-on"},
    ]

    # ── Forecasting ──
    forecasts = forecast_all_branches(monthly)
    projections = compute_2026_projections(monthly, forecasts)
    total_2026 = float(projections["Projected_2026_Total"].sum()) if not projections.empty else 0

    forecast_data = []
    chain_forecast = forecasts.groupby("Month").agg({"yhat": "sum", "yhat_lower": "sum", "yhat_upper": "sum"}).reindex(range(1, 13), fill_value=0)
    for i, m in enumerate(months):
        actual_val = monthly_revenue[i]["revenue"] if i < len(monthly_revenue) else 0
        fc = float(chain_forecast.loc[i + 1, "yhat"]) / 1e6 if (i + 1) in chain_forecast.index else 0
        lo = float(chain_forecast.loc[i + 1, "yhat_lower"]) / 1e6 if (i + 1) in chain_forecast.index else 0
        hi = float(chain_forecast.loc[i + 1, "yhat_upper"]) / 1e6 if (i + 1) in chain_forecast.index else 0
        forecast_data.append({
            "month": m,
            "actual": actual_val,
            "forecast": round(fc, 1),
            "low": round(lo, 1),
            "high": round(hi, 1),
        })

    top_forecasts = []
    if not projections.empty:
        for _, row in projections.nlargest(5, "Projected_2026_Total").iterrows():
            growth = float(row.get("YoY_Growth_Pct", 0))
            top_forecasts.append({
                "branch": str(row["Branch"]),
                "projected": f"{float(row['Projected_2026_Total'])/1e6:.1f}M",
                "growth": f"{'+' if growth >= 0 else ''}{growth:.0f}%",
            })

    # ── Clustering ──
    features = build_branch_features(monthly, categories, products)
    clustered, _, _ = cluster_branches(features)
    recs = cluster_recommendations(clustered)

    radar_data = []
    # Build radar from cluster means
    feature_cols = ["Total_Revenue", "Growth_Pct", "Profit_Margin_Pct",
                    "Beverage_Share_Pct", "Seasonality_CV", "Revenue_Per_Month"]
    axis_labels = ["Revenue", "Growth", "Margin", "Bev Mix", "Seasonality", "Efficiency"]
    cluster_names = sorted(clustered["Cluster"].unique())

    for i, axis in enumerate(axis_labels):
        point = {"axis": axis}
        for cn in cluster_names:
            subset = clustered[clustered["Cluster"] == cn]
            if len(subset) > 0 and i < len(feature_cols):
                col = feature_cols[i]
                val = float(subset[col].mean())
                # Normalize to 0-100
                full_range = float(clustered[col].max() - clustered[col].min())
                if full_range > 0:
                    normalized = (val - float(clustered[col].min())) / full_range * 100
                else:
                    normalized = 50
                point[cn.replace(" ", "_").lower()] = round(normalized)
        radar_data.append(point)

    icon_map = {"Cash Cows": "Coins", "Established": "BarChart3", "Growth Engines": "Rocket", "Event/Specialty": "PartyPopper"}
    color_map = {"Cash Cows": "hsl(32 95% 52%)", "Established": "hsl(210 80% 55%)",
                 "Growth Engines": "hsl(152 65% 42%)", "Event/Specialty": "hsl(270 60% 55%)"}
    css_color_map = {"Cash Cows": "text-accent", "Established": "text-blue-500",
                     "Growth Engines": "text-success", "Event/Specialty": "text-purple-500"}
    bg_map = {"Cash Cows": "bg-accent/8", "Established": "bg-blue-500/8",
              "Growth Engines": "bg-success/8", "Event/Specialty": "bg-purple-500/8"}

    clusters = []
    for name, info in recs.items():
        clusters.append({
            "name": name,
            "icon": icon_map.get(name, "Layers"),
            "color": color_map.get(name, "hsl(0 0% 50%)"),
            "cssColor": css_color_map.get(name, "text-gray-500"),
            "bg": bg_map.get(name, "bg-gray-500/8"),
            "branches": info.get("branches", []),
            "metrics": f"Avg Revenue: {info.get('avg_revenue', 0)/1e6:.0f}M | Margin: {info.get('avg_margin', 0):.1f}%",
            "strategy": info.get("strategy", ""),
        })

    # ── Category split ──
    _, bev_share = category_mix_analysis(categories)
    cat_agg = categories[~categories["IsAggregate"]].groupby("Category").agg({
        "TrueRevenue": "sum", "TotalProfit": "sum", "TotalCost": "sum"
    }).reset_index()
    category_split = []
    for _, row in cat_agg.iterrows():
        rev = float(row["TrueRevenue"])
        profit = float(row["TotalProfit"])
        margin = (profit / rev * 100) if rev > 0 else 0
        color = "hsl(32 95% 52%)" if "bev" in str(row["Category"]).lower() else "hsl(25 80% 28%)"
        category_split.append({
            "name": str(row["Category"]),
            "revenue": round(rev),
            "profit": round(profit),
            "margin": round(margin, 1),
            "color": color,
        })

    # ── Build KPI list ──
    kpi_list = [
        {"icon": "DollarSign", "label": "Total Revenue", "value": round(kpis_raw["total_revenue"]),
         "subtext": "Full Year 2025", "format": "currency"},
        {"icon": "TrendingUp", "label": "Total Profit", "value": round(kpis_raw["total_profit"]),
         "subtext": f"{kpis_raw['avg_margin']:.1f}% margin", "format": "currency"},
        {"icon": "BarChart3", "label": "Avg Profit Margin", "value": round(kpis_raw["avg_margin"], 1),
         "subtext": "Chain-wide weighted", "format": "percent"},
        {"icon": "Store", "label": "Active Branches", "value": kpis_raw["n_branches"],
         "subtext": "Across Lebanon", "format": "number"},
        {"icon": "ShoppingCart", "label": "Total Items Sold", "value": kpis_raw["total_qty"],
         "subtext": "2025 volume", "format": "number"},
        {"icon": "Coffee", "label": "Unique Products", "value": kpis_raw["n_products"],
         "subtext": "Beverages + Food", "format": "number"},
        {"icon": "Rocket", "label": "2026 Forecast", "value": round(total_2026),
         "subtext": f"+{((total_2026 / kpis_raw['total_revenue']) - 1) * 100:.0f}% YoY growth" if kpis_raw["total_revenue"] > 0 else "",
         "format": "currency"},
        {"icon": "AlertTriangle", "label": "Margin Leaks Found", "value": round(total_leaks),
         "subtext": "Recoverable profit", "format": "currency", "isAlert": True},
    ]

    # ── Top/bottom branches ──
    top_branches = [
        {"rank": i + 1, "name": str(row["Branch"]),
         "revenue": f"{float(row['Total_By_Year'])/1e6:.1f}M"}
        for i, (_, row) in enumerate(top_df.iterrows())
    ]
    bottom_branches = [
        {"rank": kpis_raw["n_branches"] - len(bottom_df) + i + 1,
         "name": str(row["Branch"]),
         "revenue": f"{float(row['Total_By_Year'])/1e6:.1f}M"}
        for i, (_, row) in enumerate(bottom_df.iterrows())
    ]

    # ── Action plan ──
    action_plan = [
        {"phase": "Immediate", "timeframe": "This Week", "icon": "AlertCircle",
         "accentColor": "bg-destructive", "iconColor": "text-destructive", "dotBg": "bg-destructive/10",
         "items": [
             {"text": "Fix Veggie Sub pricing", "impact": f"{abs(veggie_stats.get('total_loss', 0))/1e6:.1f}M"},
             {"text": "Audit Amioun POS configuration", "impact": f"{abs(amioun_loss)/1e3:.0f}K"},
         ]},
        {"phase": "Short-Term", "timeframe": "This Month", "icon": "Clock",
         "accentColor": "bg-accent", "iconColor": "text-accent", "dotBg": "bg-accent/10",
         "items": [
             {"text": "Implement tiered modifier pricing", "impact": f"{total_absorbed * 0.5/1e6:.1f}M"},
             {"text": "Reprice cheesecake products", "impact": f"{cheese_stats.get('additional_profit_potential', 0)/1e6:.1f}M"},
         ]},
        {"phase": "Medium-Term", "timeframe": "This Quarter", "icon": "TrendingUp",
         "accentColor": "bg-success", "iconColor": "text-success", "dotBg": "bg-success/10",
         "items": [
             {"text": "Launch modifier suggestive selling training", "impact": f"{opportunity/1e6:.1f}M"},
             {"text": "Kill or reprice negative-margin products", "impact": f"{abs(neg_total)/1e6:.1f}M"},
         ]},
        {"phase": "Strategic", "timeframe": "Next 6 Months", "icon": "Compass",
         "accentColor": "bg-blue-500", "iconColor": "text-blue-500", "dotBg": "bg-blue-500/10",
         "items": [
             {"text": "Invest in growth-engine branches"},
             {"text": "Develop Ramadan programming strategy"},
             {"text": "Set up automated monthly analytics"},
         ]},
    ]

    return {
        "datasetName": "Uploaded Data",
        "kpis": kpi_list,
        "topBranches": top_branches,
        "bottomBranches": bottom_branches,
        "monthlyRevenue": monthly_revenue,
        "branchMonthly": branch_monthly,
        "heatmapBranches": heatmap_branches,
        "waterfallData": waterfall_data,
        "leakCards": leak_cards,
        "freeModifiers": free_modifiers,
        "menuProducts": menu_products,
        "quadrants": quadrants,
        "modifierAttachRates": modifier_attach_rates,
        "modifierPlaybook": modifier_playbook,
        "forecastData": forecast_data,
        "topForecasts": top_forecasts,
        "radarData": radar_data,
        "clusters": clusters,
        "actionPlan": action_plan,
        "categorySplit": category_split,
    }


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    """Health check for the frontend to detect backend availability."""
    return jsonify({"status": "ok", "version": "1.0.0"})


@app.route("/api/data", methods=["GET"])
def get_default_data():
    """Return pre-computed analysis results from default data."""
    global _cached_result
    try:
        if _cached_result is None:
            data = load_all_data()
            _cached_result = _run_pipeline(data)
        return jsonify(_cached_result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/upload", methods=["POST"])
def upload_and_analyze():
    """
    Accept uploaded CSV files, run the full pipeline, return AnalysisData JSON.
    Expects multipart/form-data with field name 'files' containing 4 CSVs.
    """
    try:
        uploaded_files = request.files.getlist("files")
        if len(uploaded_files) < 1:
            return jsonify({"error": "No files uploaded"}), 400

        # Build a dict of filename → file-like objects for load_uploaded_data
        files_dict = {}
        for f in uploaded_files:
            files_dict[f.filename] = BytesIO(f.read())

        # Run the cleaning pipeline
        data = load_uploaded_data(files_dict)

        # Run the full analysis
        result = _run_pipeline(data)
        result["datasetName"] = "Uploaded Data"

        return jsonify(result)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ─── AI Chat via HuggingFace Inference API ───────────────────────────────────
# Using Qwen2.5-7B-Instruct — no license gate, strong instruction following
HF_MODEL = "meta-llama/Llama-4-Scout-17B-16E-Instruct"
HF_API_URL = "https://router.huggingface.co/hf-inference/v1/chat/completions"

@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Proxy chat requests to HuggingFace Inference API.
    The API key stays server-side — never exposed to the client.
    """
    # Read token dynamically so WSGI env var changes take effect without restart
    hf_token = os.environ.get("HF_TOKEN", "").strip()
    if not hf_token or hf_token == "PASTE_YOUR_HF_TOKEN_HERE":
        return jsonify({"error": "HuggingFace token not configured on server. Set HF_TOKEN in WSGI file."}), 503

    try:
        body = request.get_json()
        system_prompt = body.get("system_prompt", "")
        history = body.get("history", [])
        user_message = body.get("message", "")

        messages = [
            {"role": "system", "content": system_prompt},
            *history,
            {"role": "user", "content": user_message},
        ]

        import requests as http_requests
        hf_response = http_requests.post(
            HF_API_URL,
            headers={
                "Authorization": f"Bearer {hf_token}",
                "Content-Type": "application/json",
            },
            json={
                "model": HF_MODEL,
                "messages": messages,
                "max_tokens": 800,
                "temperature": 0.7,
            },
            timeout=45,
        )

        if hf_response.status_code != 200:
            error_detail = hf_response.text[:500]  # truncate long errors
            print(f"[HF API Error] {hf_response.status_code}: {error_detail}")
            return jsonify({"error": f"HF API {hf_response.status_code}: {error_detail}"}), 502

        data = hf_response.json()
        reply = data.get("choices", [{}])[0].get("message", {}).get("content", "No response generated.")
        return jsonify({"response": reply})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ─── Serve React static files (for PythonAnywhere / single-server deployment) ─

STATIC_DIR = os.path.join(PROJECT_ROOT, "..", "dist")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    """Serve React SPA — static files first, then index.html for client routes."""
    from flask import send_from_directory
    full_path = os.path.join(STATIC_DIR, path)
    if path and os.path.isfile(full_path):
        return send_from_directory(STATIC_DIR, path)
    # SPA fallback: serve index.html for all non-file routes
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.isfile(index_path):
        return send_from_directory(STATIC_DIR, "index.html")
    return jsonify({"error": "Frontend not built. Run: npm run build"}), 404


# ─── Entry point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "0") == "1"
    print(f"🚀 Stories Coffee Backend starting on port {port}")
    print(f"   Static dir: {STATIC_DIR}")
    print(f"   HF Token: {'configured' if HF_TOKEN else 'NOT SET — chat will fail'}")
    app.run(host="0.0.0.0", port=port, debug=debug)
