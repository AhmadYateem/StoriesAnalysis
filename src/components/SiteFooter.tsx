import { Coffee, Github, BarChart3, Mail } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="animated-gradient-bg py-20 border-t border-white/5 relative overflow-hidden noise-overlay">
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-8 text-center">
        <div className="relative inline-block mb-4">
          <Coffee className="w-8 h-8 text-accent" strokeWidth={2} />
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl" />
        </div>
        <h3 className="text-2xl font-display font-bold mb-2 text-white">Stories Coffee</h3>
        <p className="text-base text-white/35 mb-1.5 font-medium">Strategic Intelligence Platform</p>
        <p className="text-sm text-white/20 mb-10">Real data · Real insights · Real impact</p>
        <div className="flex justify-center gap-3 mb-10">
          {[
            { icon: Github, label: "GitHub", href: "https://github.com/AhmadYateem/coffee-insights-hub" },
            { icon: BarChart3, label: "Dashboard", href: "#executive" },
            { icon: Mail, label: "Contact", href: "mailto:team@storiescoffee.com" },
          ].map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 text-sm text-white/35 hover:text-white transition-all duration-300 px-4 py-2 rounded-xl border border-white/8 hover:border-white/20 hover:bg-white/5"
            >
              <Icon className="w-4 h-4" />
              {label}
            </a>
          ))}
        </div>
        <p className="text-xs text-white/15 font-medium">
          Built with precision by the Stories Coffee Analytics Team · 2026
        </p>
      </div>
    </footer>
  );
}
