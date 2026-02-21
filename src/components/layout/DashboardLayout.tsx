/**
 * DashboardLayout — wraps all pages with the sidebar + content area.
 *
 * The sidebar has a fixed width (240px expanded / 68px collapsed).
 * The main content area occupies the remaining space with a subtle
 * warm background and scroll behavior.
 */

import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";

/* Page transition animation variants */
const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -12 },
};

export default function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      {/* Main content area — left margin accounts for sidebar */}
      <main className="flex-1 ml-[240px] min-h-screen transition-all duration-300">
        <motion.div
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="min-h-screen"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
