# Stories Coffee -- Strategic Intelligence Dashboard

**Live Dashboard:** https://ahmadandhassan.pythonanywhere.com/

A full-stack analytics platform that transforms raw POS data into actionable business intelligence. Built for Stories Coffee (25 branches, 300+ products, full-year 2025), but designed to work with any compatible POS export through its CSV upload pipeline.

---

## Table of Contents

- [Live Dashboard and Features](#live-dashboard-and-features)
- [AI-Powered Business Consultant](#ai-powered-business-consultant)
- [Upload Your Own Data](#upload-your-own-data)
- [Key Findings](#key-findings)
- [Methodology](#methodology)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Quick Start](#quick-start)
- [Docker](#docker)

---

## Live Dashboard and Features

The deployed application at **ahmadandhassan.pythonanywhere.com** is a single-page React application backed by a Flask API. It includes five pages:

| Page | What It Does |
|------|-------------|
| **Dashboard** | 8 KPIs, monthly revenue area chart, category donut, branch-by-month heatmap, top/bottom branch rankings |
| **Analysis** | Three-tab deep dive: Margin Leaks (62M report with root-cause analysis), Menu Engineering Matrix (409 products classified), Modifier Gold Mine (16.9M upsell opportunity with branch attach rates) |
| **Forecast** | GradientBoosting 2026 projections per branch with confidence intervals, plus KMeans branch clustering with radar charts and strategic recommendations |
| **Upload** | Drag-and-drop 4 CSV files from the POS system. The full pipeline re-runs server-side and every chart updates automatically with the new data |
| **AI Chat** | Natural language business consultant powered by LLaMA, with full analysis context injected into the system prompt |

Every visualization uses real, pipeline-computed data. When a user uploads new CSVs, the entire analysis (cleaning, margin leaks, menu matrix, forecasting, clustering) runs from scratch and the frontend reflects the new dataset.

---

## AI-Powered Business Consultant

The dashboard includes an AI chat feature powered by **Meta LLaMA** via the HuggingFace Inference API. The model receives a system prompt injected with the complete analysis context: KPIs, margin leak amounts, cluster assignments, forecast projections, and modifier statistics.

This means the AI gives **data-backed answers specific to the loaded dataset**, not generic advice.

**Example queries:**
- "What are the biggest margin leaks and how do I fix them?"
- "Which branches should I invest in for 2026?"
- "Why are modifiers given away for free?"
- "What is the projected revenue for next year?"

If the HuggingFace API is unavailable, the system falls back to a **rule-based engine** that pattern-matches common business questions against the computed analysis data, ensuring the chat always returns useful responses.

---

## Upload Your Own Data

The platform is not hardcoded to Stories Coffee. The Upload page accepts 4 CSV files matching the POS export format:

1. **Monthly Sales** (REP_S_00134) -- branch-level monthly revenue with YoY comparison
2. **Product Profitability** (rep_s_00014) -- every item sold with cost, price, profit, margin
3. **Sales by Groups** (rep_s_00191) -- product groups and categories
4. **Category Summary** (rep_s_00673) -- beverages vs food aggregates per branch

On upload, the backend runs the complete pipeline:
- Data cleaning (page header removal, branch normalization, TrueRevenue fix)
- Margin leak detection (negative margins, free modifiers, mispricing)
- Menu engineering matrix (star/puzzle/plowhorse/dog classification)
- Modifier attachment rate analysis
- GradientBoosting revenue forecasting
- KMeans branch clustering

The frontend detects whether default or uploaded data is active and displays a banner accordingly. All charts, KPIs, and recommendations update to reflect the uploaded dataset.

---

## Key Findings

Results from the Stories Coffee 2025 dataset:

| Finding | Value | Method |
|---------|-------|--------|
| Chain Revenue (2025) | 840,458,583 | Sum of TrueRevenue across all branches |
| Chain Profit | 598,228,696 | Sum of TotalProfit |
| Average Margin | 71.2% | Weighted profit / revenue |
| Total Margin Leaks | 62,013,109 | 5 leak detectors summed |
| Modifier Upsell Opportunity | 16,914,823 | Gap-to-best attach rate * avg modifier profit |
| 2026 Revenue Forecast | 1,056,960,141 | GradientBoosting per branch, summed |
| YoY Growth Projection | +26% | (Forecast 2026 - Actual 2025) / Actual 2025 |
| Products Analyzed | 13,089 rows | Unique non-aggregate product rows |
| Menu Matrix Items | 409 products | Chain-level aggregation, min 5 units |
| Branch Clusters | 4 segments | KMeans with Silhouette-optimized k |

### The 62M Margin Leak Report

Five categories of recoverable profit, each with root-cause analysis and fix:

| Leak | Annual Loss | Severity | Fix |
|------|------------|----------|-----|
| Negative Margin Products | 30.1M | Critical | 47 products sold below cost. Reprice or discontinue |
| Zero-Revenue Modifiers | 28.1M | Critical | Premium add-ons (oat milk, decaf) given away free. Charge 30-50% of cost |
| Cheesecake Underpricing | 2.1M | Warning | 34.4% margin vs 63% food average. Raise prices 15-20% |
| Veggie Sub Mispricing | 1.7M | Critical | Priced at 7/unit vs cost of 60/unit. POS data-entry error |
| Amioun TABLE POS Error | 49K | Info | TABLE service undercharging. Fix POS config |

---

## Methodology

### 1. Data Cleaning Pipeline (data_cleaning.py, 704 lines)

The raw POS exports are messy: repeated page headers throughout, hierarchical row structures (branch > service type > category > section > product), inconsistent branch naming, and a Total Price truncation bug.

**Approach:**
- **Quoted-field CSV parsing** using Python csv.reader to handle commas inside product names
- **Regex-based page header removal** to strip repeated date/column headers
- **State-machine hierarchical parser** that tracks current branch, service type, category, and section as context for each product row
- **Branch normalization** mapping 26 raw variants to 25 canonical names plus 1 "Unknown (Closed)" bucket
- **TrueRevenue derivation**: the POS truncates Total Price for large aggregates, so we compute TrueRevenue = TotalCost + TotalProfit, which is always correct
- **Parquet caching** for fast reloads on subsequent runs

Output: 4 clean DataFrames (48 monthly rows, 13,089 product rows, 12,199 group rows, 75 category rows).

### 2. Branch Performance Analysis (analysis/branch_analysis.py)

- **Chain-level KPIs**: revenue, profit, margin, branch count, product count, volume
- **BCG Performance Quadrant**: scatter plot of revenue vs YoY growth, with median-defined quadrants (Star/Cash Cow/Question Mark/Dog)
- **Seasonality analysis**: chain-wide monthly trend with peak/trough annotation, branch-by-month heatmap normalized by each branch's peak
- **Category mix**: beverage vs food revenue split per branch
- **Service type distribution**: TAKE AWAY / TABLE / Toters channel breakdown

### 3. Margin Leak Analysis (analysis/margin_leaks.py)

Five independent detectors, each with detection logic, dollar quantification, root cause, and recommendation:
- Negative margin filter (Qty > 0, TotalProfit < 0)
- Zero-revenue modifier filter (TotalPrice = 0, TotalCost > 0)
- Cheesecake margin gap vs food category average
- Veggie sub benchmarking against other subs
- Amioun TABLE-specific POS error detection

### 4. Menu Engineering (analysis/menu_engineering.py)

- Aggregate every product chain-wide (min 5 units, exclude modifiers and aggregates)
- Classify into 4 quadrants using median volume and median margin as thresholds
- Modifier attachment rate: ratio of modifier quantity to base beverage quantity per branch
- Upsell opportunity: gap-to-best calculation across all branches

### 5. Sales Forecasting (models/forecasting.py)

- **Model**: GradientBoostingRegressor (scikit-learn), 100 estimators, max depth 3, learning rate 0.1
- **Features**: cyclical month encoding (sin/cos), linear trend, raw month number
- **Training**: January 2025 through January 2026 for each branch independently
- **Confidence intervals**: +/- 1.5 * residual standard deviation, clipped at zero
- **2026 projection**: actual January 2026 + forecast February-December 2026

### 6. Branch Clustering (models/clustering.py)

- **Features**: 10-dimensional profile per branch (revenue, active months, seasonality CV, summer/winter ratio, growth %, beverage share, margin, quantity, service type count, revenue per month)
- **Normalization**: StandardScaler on 6 selected features
- **Algorithm**: KMeans, k=4, 10 initializations, fixed seed
- **Cluster naming**: automatic based on revenue/growth position relative to chain median (Flagship, Cash Cow, Growth Engine, Emerging)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion |
| Backend | Flask, Flask-CORS (Python API wrapping the analysis pipeline) |
| AI Model | Meta LLaMA via HuggingFace Inference API (with rule-based fallback) |
| ML Models | GradientBoostingRegressor (forecasting), KMeans (clustering) via scikit-learn |
| Analysis | Python, Pandas, NumPy |
| Deployment | PythonAnywhere (Flask serves both API and built React SPA) |
| Containerization | Docker (multi-stage: Node build then nginx serve) |

---

## Repository Structure

```
.
|-- backend/
|   |-- app.py                  # Flask API: /api/health, /api/upload, /api/data, /api/chat
|-- data_cleaning.py            # CSV parsing, branch normalization, TrueRevenue fix (704 lines)
|-- analysis/
|   |-- branch_analysis.py      # BCG quadrant, seasonality, category mix, service type
|   |-- margin_leaks.py         # The 62M Report: 5 leak detectors with root-cause analysis
|   |-- menu_engineering.py     # Menu matrix (409 items), modifier attach rates
|-- models/
|   |-- forecasting.py          # GradientBoosting per-branch 2026 forecast
|   |-- clustering.py           # KMeans 4-segment branch clustering
|-- src/                        # React frontend (TypeScript)
|   |-- pages/                  # Dashboard, Analysis, Forecast, Upload, Chat
|   |-- components/             # Reusable UI components (charts, cards, layout)
|   |-- context/DataContext.tsx  # Global state: default data vs uploaded data
|   |-- data/defaultData.ts     # Hardcoded Stories Coffee 2025 dataset
|   |-- data/types.ts           # TypeScript interfaces for all data shapes
|-- Stories_data/               # Raw POS CSV exports (input data)
|-- data/cleaned/               # Parquet cache of cleaned DataFrames
|-- Dockerfile                  # Multi-stage build (Node + nginx)
|-- requirements.txt            # Python dependencies (pinned)
|-- package.json                # Node dependencies
|-- Executive_Summary.pdf       # 2-page executive summary (CEO-ready)
```

---

## Quick Start

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/AhmadYateem/StoriesAnalysis.git
cd StoriesAnalysis

# 2. Install frontend dependencies and build
npm install
npm run build

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Set your HuggingFace token (for AI chat)
# Linux/Mac:
export HF_TOKEN=hf_your_token_here
# Windows PowerShell:
$env:HF_TOKEN = "hf_your_token_here"

# 5. Start the server
python backend/app.py

# 6. Open http://localhost:5000
```

The Flask server serves both the API endpoints and the built React SPA. No separate frontend server needed.

---

## Docker

```bash
# Build
docker build -t stories-dashboard .

# Run
docker run -p 8080:80 -e HF_TOKEN=hf_your_token_here stories-dashboard

# Open http://localhost:8080
```

The Dockerfile uses a multi-stage build: Node builds the React frontend, then the Python backend serves it alongside the API.

---

## Links

- **Live Dashboard:** https://ahmadandhassan.pythonanywhere.com/
- **Repository:** https://github.com/AhmadYateem/StoriesAnalysis
