# Claude Session Tracker — Stories Coffee Hackathon

## Mission
Transform raw POS data from Stories Coffee (25 branches, 300+ products, full-year 2025 + Jan 2026) into a McKinsey-grade consulting deliverable that wins 1st place (20/20).

## Narrative
*"We found 62M in margin leaks, identified hidden modifier upsell opportunities worth 16.9M, and built a live dashboard the team can use every month — no code needed."*

---

## Phase Tracker

### Phase 1: Data Cleaning Pipeline ✅ COMPLETE
- [x] `data_cleaning.py` — robust parser for all 4 CSV files (704 lines)
- [x] Handle page headers, hierarchical structure, branch normalization
- [x] Fix Total Price truncation bug (TrueRevenue = Cost + Profit)
- [x] csv_split() for proper quoted-field parsing
- [x] Output 4 clean DataFrames to `data/cleaned/` (parquet cache)
- [x] Validation: 48 monthly, 13089 products, 12199 groups, 75 category rows

### Phase 2: EDA & Branch Analysis ✅ COMPLETE
- [x] Branch Performance Quadrant (BCG 2×2)
- [x] Seasonality analysis (monthly trends, Ramadan dip, summer peak)
- [x] Category mix analysis (Beverages vs Food)
- [x] Service type distribution (TAKE AWAY vs TABLE vs Toters)
- [x] Chain-level KPIs: Revenue=840M, Profit=598M, Margin=71.2%

### Phase 3: Margin Leak Analysis ✅ COMPLETE
- [x] "The 62M Report" — dollar-quantified profit leaks across 5 categories
- [x] Veggie Sub mispricing (1.7M), Amioun POS error (49K)
- [x] Free modifiers cost analysis (28.1M in zero-revenue items)
- [x] Cheesecake underpricing (2.1M gap to target margin)
- [x] Negative margin products (30.1M across 47 items)

### Phase 4: Menu Engineering ✅ COMPLETE
- [x] Menu matrix: 409 products classified (Stars/Plowhorses/Puzzles/Dogs)
- [x] Modifier attachment analysis: top rate 60.4%, opportunity 16.9M
- [x] Top/bottom product rankings by profit contribution

### Phase 5: ML Models ✅ COMPLETE
- [x] GradientBoosting forecasting: 2026 projection = 1.06B (+26% YoY)
- [x] KMeans branch clustering: 4 strategic segments identified
- [x] Cluster radar charts and strategic recommendations

### Phase 6: React Website ✅ COMPLETE
- [x] 12-section interactive website (React + TypeScript + Vite + Tailwind)
- [x] Executive Overview, Seasonality, Margin Leaks, Menu Engineering
- [x] Modifier Gold Mine, Forecasting, Branch Clustering
- [x] Methodology, Action Plan, Dashboard Preview
- [x] All data populated from real analysis pipeline
- [x] Recharts visualizations, Framer Motion animations, coffee-themed design

### Phase 7: Packaging & Deployment ✅ COMPLETE
- [x] package.json with all dependencies
- [x] Dockerfile (multi-stage: node build + nginx serve)
- [x] Professional README.md
- [x] .dockerignore
---

## Key Findings

| Finding | Value | Source |
|---------|-------|--------|
| Chain Revenue (2025) | 840,458,583 | category_summary |
| Chain Profit | 598,228,696 | category_summary |
| Average Margin | 71.2% | category_summary |
| Total Margin Leaks | 62,013,109 | margin_leaks analysis |
| Modifier Upsell Opportunity | 16,914,823 | modifier analysis |
| 2026 Revenue Forecast | 1,056,960,141 | GradientBoosting model |
| Products Analyzed | 13,089 | product_profitability |
| Menu Matrix Items | 409 | menu_engineering |
| Branch Clusters | 4 segments | KMeans clustering |

## Architecture Decisions
- **Streamlit** for dashboard (best free deployment + native CSV upload)
- **Parquet** for intermediates (fast load, type-safe)
- **"Margin Leak"** as hero narrative (most actionable, dollar-quantified)
- **Groq API** for chatbot (free tier, fast inference, with rule-based fallback)
- **csv_split()** using Python's csv module for proper quoted-field parsing
- **GradientBoosting** over ARIMA/Prophet (works with limited time series data per branch)
- **KMeans** for clustering (interpretable, Silhouette-optimized k selection)
