import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ExecutiveSnapshot from "@/components/ExecutiveSnapshot";
import SeasonalityTrends from "@/components/SeasonalityTrends";
import MarginLeakReport from "@/components/MarginLeakReport";
import MenuEngineering from "@/components/MenuEngineering";
import ModifierGoldMine from "@/components/ModifierGoldMine";
import ForecastSection from "@/components/ForecastSection";
import BranchClustering from "@/components/BranchClustering";
import DashboardPreview from "@/components/DashboardPreview";
import Methodology from "@/components/Methodology";
import ActionPlan from "@/components/ActionPlan";
import SiteFooter from "@/components/SiteFooter";
import ChatWidget from "@/components/ChatWidget";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <ExecutiveSnapshot />
      <SeasonalityTrends />
      <MarginLeakReport />
      <MenuEngineering />
      <ModifierGoldMine />
      <ForecastSection />
      <BranchClustering />
      <DashboardPreview />
      <Methodology />
      <ActionPlan />
      <SiteFooter />
      <ChatWidget />
    </div>
  );
}
