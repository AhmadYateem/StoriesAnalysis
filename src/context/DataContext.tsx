/**
 * DataContext — single source of truth for all analysis data.
 *
 * By default the app loads the hardcoded Stories Coffee 2025 dataset.
 * When a user uploads new CSVs (via the Upload page), the backend or
 * the JS fallback parser replaces this data and every chart re-renders
 * automatically.
 */

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { AnalysisData } from "@/data/types";
import DEFAULT_DATA from "@/data/defaultData";

/* ── State shape ── */
interface DataState {
  data: AnalysisData;
  isLoading: boolean;
  error: string | null;
  source: "default" | "uploaded" | "processing";
}

/* ── Possible actions ── */
type DataAction =
  | { type: "SET_LOADING" }
  | { type: "SET_DATA"; payload: AnalysisData }
  | { type: "SET_ERROR"; payload: string }
  | { type: "RESET" };

/* ── Reducer ── */
function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: true, error: null, source: "processing" };
    case "SET_DATA":
      return { data: action.payload, isLoading: false, error: null, source: "uploaded" };
    case "SET_ERROR":
      return { ...state, isLoading: false, error: action.payload, source: state.source === "processing" ? "default" : state.source };
    case "RESET":
      return { data: DEFAULT_DATA, isLoading: false, error: null, source: "default" };
    default:
      return state;
  }
}

/* ── Context value ── */
interface DataContextValue {
  state: DataState;
  dispatch: React.Dispatch<DataAction>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

/* ── Provider ── */
export function DataProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, {
    data: DEFAULT_DATA,
    isLoading: false,
    error: null,
    source: "default",
  });

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
}

/* ── Hook for consuming data ── */
export function useAnalysisData(): AnalysisData {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useAnalysisData must be used within <DataProvider>");
  return ctx.state.data;
}

/* ── Hook for full state + dispatch (upload page needs this) ── */
export function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useDataContext must be used within <DataProvider>");
  return ctx;
}
