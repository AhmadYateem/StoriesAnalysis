# Stories Coffee — Strategic Intelligence Dashboard

## 🚀 [Live Demo → ahmadandhassan.pythonanywhere.com](https://ahmadandhassan.pythonanywhere.com/)

> A McKinsey-grade analytics platform built for Stories Coffee: 25 branches, 300+ products, full-year 2025 POS data — interactive dashboard with AI-powered insights.

---

## 🎯 The Headline

We identified **62M in margin leaks**, quantified a **16.9M modifier upsell opportunity**, and project **1.06B (+26% YoY)** for 2026. Every finding is explorable in an **interactive dashboard** with **CSV upload for reproducibility** and a **LLaMA 3.1 AI consultant** that answers business questions using real analysis data.

### ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Interactive Dashboard** | KPIs, revenue trends, heatmaps, category breakdowns — all real data |
| **The 62M Margin Leak Report** | 5 categories of profit leaks with root-cause analysis and dollar-quantified fixes |
| **Menu Engineering Matrix** | 409 products classified (Stars/Puzzles/Plowhorses/Dogs) with actionable strategy |
| **Modifier Gold Mine** | 16.9M upsell opportunity with branch-level attach rates |
| **ML Forecasting** | GradientBoosting model projects 2026 revenue per branch |
| **Branch Clustering** | KMeans segments 25 branches into 4 strategic groups |
| **CSV Upload** | Upload new POS exports → full pipeline re-runs → dashboard updates automatically |
| **🦙 LLaMA 3.1 AI Chat** | Ask business questions in natural language — powered by HuggingFace Inference API |

---

## 🦙 LLaMA AI Consultant

The dashboard includes an **AI chat feature** powered by **Meta's LLaMA 3.1 8B Instruct** via the HuggingFace Inference API. The model receives a system prompt injected with the full analysis context (KPIs, margin leaks, clusters, forecasts), so it gives **data-backed answers specific to Stories Coffee**.

Examples:
- *"What are the biggest margin leaks?"* → Returns the 5 leak categories with exact amounts
- *"Why are modifiers given for free?"* → Explains POS config + competitive positioning + training gaps
- *"Which branches should we invest in?"* → References cluster analysis and growth projections

If the HuggingFace API is unavailable, the system falls back to a **rule-based engine** that still returns accurate, data-driven responses.

---

## 📊 Key Findings

| Finding | Value |
|---------|-------|
| Chain Revenue (2025) | 840,458,583 |
| Chain Profit | 598,228,696 |
| Average Margin | 71.2% |
| Total Margin Leaks | 62,013,109 |
| Modifier Upsell Opportunity | 16,914,823 |
| 2026 Revenue Forecast | 1,056,960,141 |
| Products Analyzed | 13,089 |
| Menu Matrix Items | 409 |
| Branch Clusters | 4 segments |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Recharts + Framer Motion |
| **Backend** | Flask + Flask-CORS (Python API wrapping the analysis pipeline) |
| **AI Model** | LLaMA 3.1 8B Instruct via HuggingFace Inference API (pretrained, open-source) |
| **ML Models** | GradientBoostingRegressor (forecasting) + KMeans (clustering) via scikit-learn |
| **Analysis** | Python + Pandas + NumPy |
| **Deployment** | PythonAnywhere (Flask serves both API + built React SPA) |
| **Containerization** | Docker (multi-stage: Node build → Python + nginx) |

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install frontend dependencies
npm install

# 2. Build the React frontend
npm run build

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Set your HuggingFace token
# Linux/Mac:
export HF_TOKEN=hf_your_token_here
# Windows PowerShell:
$env:HF_TOKEN = "hf_your_token_here"

# 5. Start the server (serves both API + frontend)
python backend/app.py

# 6. Open http://localhost:5000
```

---

## 📁 Architecture

```
              ┌────────────────────────────────────────┐
              │   React SPA Dashboard (dist/)          │
              │   Dashboard │ Analysis │ Forecast       │
              │   Upload │ AI Chat (🦙 LLaMA 3.1)      │
              └───────────────────┬────────────────────┘
                                  │ /api/*
              ┌───────────────────▼────────────────────┐
              │        Flask Backend                    │
              │  /api/health  /api/upload  /api/chat    │
              │  data_cleaning → analysis/ → models/    │
              │  HuggingFace API proxy (HF_TOKEN)       │
              └────────────────────────────────────────┘
```

### Dashboard Pages
1. **Dashboard** — 8 KPIs, monthly revenue area chart, category donut, branch heatmap, rankings
2. **Analysis** — Margin leaks (62M report with root-cause), menu matrix scatter, modifier goldmine
3. **Forecast** — GradientBoosting 2026 projections + KMeans branch clustering radar
4. **Upload** — Drag & drop 4 CSV files → full pipeline re-runs → all charts update
5. **AI Chat** — LLaMA 3.1 consultant with full analysis context injected

### Analysis Pipeline (Python)
- `data_cleaning.py` — CSV parsing, branch normalization, TrueRevenue fix (704 lines)
- `analysis/branch_analysis.py` — BCG quadrant, seasonality, category mix
- `analysis/margin_leaks.py` — The 62M Report (5 leak categories with root-cause analysis)
- `analysis/menu_engineering.py` — Menu matrix (409 items), modifier attach rates
- `models/forecasting.py` — GradientBoosting per-branch 2026 forecast
- `models/clustering.py` — KMeans 4-segment branch clustering

---

## 🔗 Links

- **Live Dashboard:** [ahmadandhassan.pythonanywhere.com](https://ahmadandhassan.pythonanywhere.com/)
- **Repository:** [github.com/AhmadYateem/StoriesAnalysis](https://github.com/AhmadYateem/StoriesAnalysis)
