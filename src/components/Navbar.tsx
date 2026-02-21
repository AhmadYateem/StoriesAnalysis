import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Menu, X } from "lucide-react";

const navItems = [
  { label: "Overview", href: "#executive" },
  { label: "Seasonality", href: "#seasonality" },
  { label: "62M Report", href: "#margin-leaks" },
  { label: "Menu Matrix", href: "#menu-engineering" },
  { label: "Modifiers", href: "#modifiers" },
  { label: "Forecast", href: "#forecast" },
  { label: "Clusters", href: "#clusters" },
  { label: "Action Plan", href: "#action-plan" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      // Track active section
      const sections = navItems.map(i => i.href.slice(1));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "frosted-nav" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, type: "spring" }}
    >
      <div className="max-w-5xl mx-auto px-6 md:px-8 py-3.5 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="relative">
            <Coffee className="w-5 h-5 text-accent" strokeWidth={2.5} />
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className={`font-display font-bold text-lg tracking-tight transition-colors duration-300 ${scrolled ? "text-foreground" : "text-white"}`}>
            Stories
          </span>
        </a>
        <div className="hidden lg:flex items-center gap-0.5 bg-black/5 backdrop-blur-sm rounded-xl p-1" style={scrolled ? {} : { background: "rgba(255,255,255,0.08)" }}>
          {navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-1.5 rounded-lg text-[13px] font-semibold transition-all duration-300 ${
                  scrolled
                    ? isActive
                      ? "text-foreground bg-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/60"
                    : isActive
                      ? "text-white bg-white/15"
                      : "text-white/50 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`lg:hidden p-2 rounded-xl ${scrolled ? "text-foreground" : "text-white"}`}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden frosted-nav border-t border-border/30"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-foreground hover:bg-secondary transition-all"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
