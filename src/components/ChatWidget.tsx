import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: number;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    role: "assistant",
    content: "Hi! I'm the Stories Coffee AI assistant. Ask me anything about the analysis — margin leaks, branch performance, menu engineering, or forecasts.",
    timestamp: new Date(),
  },
];

const QUICK_PROMPTS = [
  "What are the biggest margin leaks?",
  "Which branch performs best?",
  "Tell me about the 2026 forecast",
  "How can modifiers boost profit?",
];

// Rule-based fallback responses (will be replaced by LLM integration)
function generateResponse(input: string): string {
  const lower = input.toLowerCase();

  if (lower.includes("margin") || lower.includes("leak") || lower.includes("62m") || lower.includes("loss")) {
    return "We identified 62M in annual profit leaks across 5 categories:\n\n• **Negative margin products**: 30.1M (1,197 items sold below cost)\n• **Free modifiers**: 28.1M in absorbed costs\n• **Cheesecake underpricing**: 2.1M gap to target margin\n• **Veggie Sub mispricing**: 1.7M (sold at 7/unit vs 60/unit cost)\n• **Amioun POS error**: 49K systematic undercharging\n\nAll fixable with zero additional investment.";
  }

  if (lower.includes("branch") || lower.includes("best") || lower.includes("top") || lower.includes("perform")) {
    return "**Top 5 branches by revenue:**\n\n1. Ain El Mreisseh — 119.6M\n2. Zalka — 108.0M\n3. Khaldeh — 84.2M\n4. Ramlet El Bayda — 56.1M\n5. Saida — 55.0M\n\nOur ML clustering grouped 25 branches into 4 segments: Cash Cows (3), Established (13), Growth Engines (8), and Event/Specialty (1).";
  }

  if (lower.includes("forecast") || lower.includes("2026") || lower.includes("predict") || lower.includes("growth")) {
    return "Our GradientBoosting model projects **2026 revenue at 1.06B** (+26% YoY). Key drivers:\n\n• New branches ramping up (Airport, Ramlet El Bayda)\n• Summer peak months driving highest volumes\n• Sin El Fil projected +310% growth\n\nThe model uses per-branch seasonal features with ±1.5σ confidence intervals.";
  }

  if (lower.includes("modifier") || lower.includes("upsell") || lower.includes("gold mine") || lower.includes("attach")) {
    return "Modifiers are a **16.9M untapped opportunity**:\n\n• Current best: Verdun at 60.4% attach rate\n• Worst: Zalka at 24.8%\n• Modifier margins: 70-95%\n• Top margins: Yirgacheffe upgrade (95%), Drizzle toppings (90%)\n\nStrategy: POS prompts, barista training, and charging 5-10K per add-on.";
  }

  if (lower.includes("menu") || lower.includes("star") || lower.includes("dog") || lower.includes("product")) {
    return "We classified **409 products** into 4 quadrants:\n\n⭐ **Stars (124)**: High volume + high margin — Iced Latte, Water, Cinnamon Roll\n🧩 **Puzzles (81)**: Low volume + high margin — Iced White Mocha (87%!)\n🐄 **Plowhorses (81)**: High volume + low margin — Black Coffee, Lazy Cake\n🐕 **Dogs (123)**: Low volume + low margin — consider removing\n\nFocus: promote Stars, market Puzzles, reprice Plowhorses, cut Dogs.";
  }

  if (lower.includes("season") || lower.includes("ramadan") || lower.includes("summer") || lower.includes("month")) {
    return "Strong seasonality patterns found:\n\n• **Peak**: August (109.4M) — summer drive\n• **Trough**: June (18.4M) — Ramadan effect, 83% drop\n• **Peak/Trough ratio**: 5.9×\n• **Recovery**: July bounces back to 89.6M\n\nRecommendation: build a Ramadan programming strategy and staff up for Jul-Aug.";
  }

  return "That's a great question! I can help with:\n\n• **Margin leaks** — the 62M opportunity\n• **Branch performance** — rankings & clusters\n• **Menu engineering** — product classification\n• **Modifiers** — the 16.9M upsell opportunity\n• **Forecasting** — 2026 projections\n• **Seasonality** — monthly patterns\n\nTry asking about any of these topics!";
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate API delay then respond
    setTimeout(() => {
      const response = generateResponse(text);
      const assistantMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, hsl(32 95% 52%), hsl(25 80% 35%))",
          boxShadow: "0 4px 16px rgba(200,120,40,0.35), 0 2px 6px rgba(0,0,0,0.15)",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 200 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Notification dot when closed */}
      {!isOpen && (
        <motion.div
          className="fixed bottom-[72px] right-6 z-50 w-5 h-5 bg-destructive rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 3, type: "spring" }}
          style={{ boxShadow: "0 2px 6px rgba(220,40,40,0.3)" }}
        >
          <span className="text-[10px] text-white font-bold">AI</span>
        </motion.div>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] rounded-2xl overflow-hidden"
            style={{
              boxShadow: "0 24px 64px rgba(0,0,0,0.15), 0 8px 24px rgba(0,0,0,0.1)",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center gap-3"
              style={{ background: "linear-gradient(135deg, hsl(24 70% 18%), hsl(20 65% 12%))" }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">Stories AI Assistant</div>
                <div className="text-[11px] text-white/40 font-medium">Ask about the analysis</div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-[11px] text-white/40 font-medium">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="h-[340px] overflow-y-auto bg-white p-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.role === "assistant" ? "bg-accent/10" : "bg-foreground/8"
                  }`}>
                    {msg.role === "assistant" ? (
                      <Bot className="w-3.5 h-3.5 text-accent" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-foreground/60" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                      msg.role === "assistant"
                        ? "bg-secondary/80 text-foreground rounded-tl-md"
                        : "bg-foreground text-white rounded-tr-md"
                    }`}
                  >
                    {msg.content.split("\n").map((line, i) => (
                      <span key={i}>
                        {line.replace(/\*\*(.*?)\*\*/g, "").includes("**") ? line : line.split(/\*\*(.*?)\*\*/).map((part, j) =>
                          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                        )}
                        {i < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="bg-secondary/80 px-4 py-3 rounded-2xl rounded-tl-md">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-muted-foreground/30 rounded-full"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 2 && (
              <div className="bg-white border-t border-border/30 px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => sendMessage(prompt)}
                      className="text-[11px] font-semibold text-accent bg-accent/8 hover:bg-accent/15 px-2.5 py-1.5 rounded-lg transition-all duration-200"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="bg-white border-t border-border/30 px-4 py-3 flex items-center gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the analysis..."
                className="flex-1 bg-secondary/60 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-accent/20 transition-all border border-transparent focus:border-accent/20"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30"
                style={{
                  background: input.trim() && !isTyping ? "linear-gradient(135deg, hsl(32 95% 52%), hsl(25 80% 35%))" : "hsl(30 15% 92%)",
                  color: input.trim() && !isTyping ? "white" : "hsl(20 12% 60%)",
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
