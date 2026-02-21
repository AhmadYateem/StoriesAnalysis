/**
 * App — Root component with sidebar SPA routing.
 * Wraps the entire tree in DataProvider for global analysis data.
 */
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "@/context/DataContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import DashboardPage from "@/pages/DashboardPage";
import AnalysisPage from "@/pages/AnalysisPage";
import ForecastPage from "@/pages/ForecastPage";
import UploadPage from "@/pages/UploadPage";
import ChatPage from "@/pages/ChatPage";
import NotFound from "@/pages/NotFound";

const App = () => (
  <DataProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="analysis" element={<AnalysisPage />} />
            <Route path="forecast" element={<ForecastPage />} />
            <Route path="upload" element={<UploadPage />} />
            <Route path="chat" element={<ChatPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </DataProvider>
);

export default App;
