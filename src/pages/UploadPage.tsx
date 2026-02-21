/**
 * UploadPage — CSV upload with drag-and-drop, validation, progress,
 * and backend / JS-fallback processing pipeline.
 *
 * Accepts the 4 Stories Coffee report CSVs:
 *   1. rep_s_00014_SMRY.csv  (Product Profitability)
 *   2. REP_S_00134_SMRY.csv  (Category Summary)
 *   3. rep_s_00191_SMRY-3.csv (Product Group)
 *   4. rep_s_00673_SMRY.csv  (Branch Monthly)
 */

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDataContext, useAnalysisData } from "@/context/DataContext";
import { uploadAndAnalyze, checkBackendHealth } from "@/lib/api";
import {
  Upload, FileText, CheckCircle2, AlertCircle, Loader2,
  Trash2, RefreshCw, ArrowRight, Server, MonitorSmartphone,
} from "lucide-react";

/** Expected file patterns (regex-matched against file names) */
const EXPECTED_FILES = [
  { pattern: /00014/i,   label: "Product Profitability", key: "product_profitability" },
  { pattern: /00134/i,   label: "Category Summary",      key: "category_summary" },
  { pattern: /00191/i,   label: "Product Group",          key: "product_group" },
  { pattern: /00673/i,   label: "Branch Monthly",         key: "branch_monthly" },
];

type FileEntry = {
  file: File;
  matched: string | null;     // which expected file it matches
  status: "pending" | "matched" | "error";
};

type ProcessingState = "idle" | "checking" | "uploading" | "processing" | "done" | "error";

/* ────────────────────── Main component ────────────────────── */
export default function UploadPage() {
  const { dispatch } = useDataContext();
  const data = useAnalysisData();

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [processing, setProcessing] = useState<ProcessingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  /* ── File matching logic ── */
  const matchFiles = useCallback((incoming: File[]): FileEntry[] => {
    return incoming.map((file) => {
      const match = EXPECTED_FILES.find((ef) => ef.pattern.test(file.name));
      return {
        file,
        matched: match ? match.label : null,
        status: match ? "matched" as const : "error" as const,
      };
    });
  }, []);

  /* ── Drag & drop handlers ── */
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragActive(true); }, []);
  const onDragLeave = useCallback(() => setDragActive(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith(".csv"));
    if (droppedFiles.length > 0) setFiles(matchFiles(droppedFiles));
  }, [matchFiles]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter((f) => f.name.endsWith(".csv"));
    if (selected.length > 0) setFiles(matchFiles(selected));
    e.target.value = "";  // allow re-selecting same files
  }, [matchFiles]);

  /* ── Processing pipeline ── */
  const runAnalysis = useCallback(async () => {
    setError(null);
    setProcessing("checking");

    // Check backend health
    const isOnline = await checkBackendHealth();
    setBackendOnline(isOnline);

    if (isOnline) {
      // Backend path: upload → receive full AnalysisData
      setProcessing("uploading");
      try {
        const formData = new FormData();
        files.forEach((fe) => formData.append("files", fe.file));
        setProcessing("processing");
        const result = await uploadAndAnalyze(formData);
        dispatch({ type: "SET_DATA", payload: result });
        setProcessing("done");
      } catch (err: any) {
        setError(err.message || "Backend analysis failed");
        setProcessing("error");
      }
    } else {
      // JS fallback: parse CSV client-side (placeholder — full parser would go here)
      setProcessing("processing");
      try {
        // For hackathon demo: show that we detected backend is offline
        // In production, PapaParse + JS analysis pipeline would run here
        await new Promise((r) => setTimeout(r, 1500));
        setError("Backend offline — client-side analysis not yet available. Deploy the Flask backend for full processing.");
        setProcessing("error");
      } catch (err: any) {
        setError(err.message);
        setProcessing("error");
      }
    }
  }, [files, dispatch]);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setProcessing("idle");
    setError(null);
    setBackendOnline(null);
  }, []);

  const resetToDefault = useCallback(() => {
    dispatch({ type: "RESET" });
    clearFiles();
  }, [dispatch, clearFiles]);

  const matchedCount = files.filter((f) => f.status === "matched").length;
  const allMatched = matchedCount === 4;

  return (
    <div className="p-6 lg:p-8 max-w-[900px] mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
          Upload Data
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Drop your CSV files to re-run the full analysis pipeline on new data
        </p>
      </motion.div>

      {/* Current dataset badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 bg-secondary/40 rounded-xl px-4 py-2.5 w-fit"
      >
        <FileText className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">
          Active dataset: <span className="text-foreground">{data.datasetName}</span>
        </span>
        {data.datasetName !== "Stories Coffee · Full Year 2025" && (
          <button onClick={resetToDefault} className="text-xs text-accent font-semibold hover:underline flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Reset to default
          </button>
        )}
      </motion.div>

      {/* Drop zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 group ${
          dragActive
            ? "border-accent bg-accent/5 scale-[1.01]"
            : "border-border/60 bg-white hover:border-accent/50 hover:bg-accent/[0.02]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          multiple
          className="hidden"
          onChange={onFileSelect}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            dragActive ? "bg-accent/10" : "bg-gray-100 group-hover:bg-accent/10"
          }`}>
            <Upload className={`w-6 h-6 transition-colors duration-300 ${
              dragActive ? "text-accent" : "text-muted-foreground group-hover:text-accent"
            }`} />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">
              Drop 4 CSV files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Product Profitability, Category Summary, Product Group, Branch Monthly
            </p>
          </div>
        </div>
      </motion.div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                Files ({matchedCount}/4 matched)
              </h3>
              <button onClick={clearFiles} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>

            {files.map((fe, i) => (
              <motion.div
                key={fe.file.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
                  fe.status === "matched" ? "bg-emerald-50/50 border-emerald-200" : "bg-red-50/50 border-red-200"
                }`}
              >
                {fe.status === "matched" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate block">{fe.file.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {fe.matched || "Unrecognised file — expected format: rep_s_XXXX_SMRY.csv"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {(fe.file.size / 1024).toFixed(0)} KB
                </span>
              </motion.div>
            ))}

            {/* Run button */}
            <motion.button
              disabled={!allMatched || processing === "uploading" || processing === "processing"}
              onClick={runAnalysis}
              className={`w-full mt-3 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                allMatched
                  ? "bg-accent text-white hover:bg-accent/90 shadow-lg shadow-accent/20"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
              whileTap={allMatched ? { scale: 0.98 } : {}}
            >
              {processing === "uploading" || processing === "processing" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {processing === "checking" && "Checking backend..."}
              {processing === "uploading" && "Uploading files..."}
              {processing === "processing" && "Running analysis pipeline..."}
              {processing === "idle" && "Run Analysis"}
              {processing === "done" && "Analysis Complete — View Dashboard"}
              {processing === "error" && "Retry Analysis"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status messages */}
      <AnimatePresence>
        {processing === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-700">Analysis complete!</p>
              <p className="text-xs text-emerald-600 mt-0.5">All charts and KPIs have been updated with the new data.</p>
            </div>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Error</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backend status indicator */}
      {backendOnline !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          {backendOnline ? (
            <>
              <Server className="w-3.5 h-3.5 text-emerald-500" />
              <span>Backend connected — full analysis available</span>
            </>
          ) : (
            <>
              <MonitorSmartphone className="w-3.5 h-3.5 text-amber-500" />
              <span>Backend offline — deploy Flask API for full pipeline</span>
            </>
          )}
        </motion.div>
      )}

      {/* Architecture info card */}
      <div className="bg-gray-50 rounded-2xl border border-border/40 p-5 mt-8">
        <h3 className="text-sm font-bold text-foreground mb-3">How It Works</h3>
        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 rounded-md bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0">1</span>
            <p>Upload the 4 POS report CSVs exported from Stories Coffee&apos;s system.</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 rounded-md bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0">2</span>
            <p>The backend runs <code>data_cleaning.py</code> → parses hierarchical CSVs, fixes truncation bugs, normalises branch names.</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 rounded-md bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0">3</span>
            <p>Analysis pipeline runs: margin leaks, menu engineering, modifier analysis, GradientBoosting forecasting, KMeans clustering.</p>
          </div>
          <div className="flex gap-3 items-start">
            <span className="w-6 h-6 rounded-md bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0">4</span>
            <p>Results flow back to the dashboard — every chart, KPI, and table updates automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
