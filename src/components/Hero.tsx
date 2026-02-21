import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";
import { ArrowDown, Coffee, Zap } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [started, text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && started && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="inline-block w-[3px] h-[1em] bg-white/80 ml-0.5 align-middle"
        />
      )}
    </span>
  );
}

function HeroCounter({ value, label, delay, prefix = "" }: { value: number; label: string; delay: number; prefix?: string }) {
  const count = useCountUp(value, 2500, 0, true);

  const formatNumber = (n: number) => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
    return n.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay, type: "spring", stiffness: 80 }}
      className="text-center group"
    >
      <div className="mega-number text-5xl md:text-6xl lg:text-7xl text-gradient-hero mb-3">
        {prefix}{formatNumber(count)}
      </div>
      <div className="text-sm md:text-base text-white/40 font-medium tracking-wide uppercase">{label}</div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroBg} alt="" className="w-full h-full object-cover scale-110" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
      </div>

      {/* Decorative orbs */}
      <div className="orb-glow orb-gold w-96 h-96 -top-48 -right-48" />
      <div className="orb-glow orb-amber w-64 h-64 bottom-20 -left-32" />

      {/* Grain overlay */}
      <div className="absolute inset-0 noise-overlay" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 md:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
          className="mb-8 flex items-center justify-center gap-3"
        >
          <div className="relative">
            <Coffee className="w-10 h-10 text-accent" strokeWidth={2} />
            <div className="absolute inset-0 bg-accent/30 rounded-full blur-xl" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
          className="mega-number text-6xl md:text-8xl lg:text-[7rem] text-gradient-hero mb-6 leading-[0.95]"
        >
          Stories Coffee
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="section-divider mb-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base md:text-lg text-white/35 font-medium tracking-[0.25em] uppercase mb-14"
        >
          Strategic Intelligence Platform
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="max-w-2xl mx-auto mb-20"
        >
          <p className="text-base md:text-lg text-white/60 font-light leading-relaxed">
            <TypewriterText
              text="We found 62M in margin leaks, identified hidden modifier upsell opportunities worth 16.9M, and built a live dashboard the team can use every month."
              delay={1400}
            />
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 max-w-4xl mx-auto mb-20">
          <HeroCounter value={840_000_000} label="Revenue Analyzed" delay={0.5} />
          <HeroCounter value={62_000_000} label="Margin Leaks Found" delay={0.7} />
          <HeroCounter value={1_060_000_000} label="2026 Forecast" delay={0.9} />
        </div>

        <motion.a
          href="#executive"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white font-semibold text-base hover:bg-white/20 hover:border-white/30 transition-all duration-500 group"
        >
          <Zap className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
          Explore the Analysis
          <motion.span
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown className="w-5 h-5" />
          </motion.span>
        </motion.a>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ opacity: [0.2, 0.7, 0.2] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-7 h-12 rounded-full border-2 border-white/15 flex justify-center pt-3">
          <motion.div
            className="w-1.5 h-2.5 bg-white/40 rounded-full"
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
