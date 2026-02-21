/**
 * ChatPage — AI assistant powered by LLaMA 4 Scout (17B-16E) via HuggingFace Inference API.
 * Features:
 *   - Conversation history persisted in local state
 *   - System prompt injected with analysis summary for contextual answers
 *   - Streaming-style display with typing animation
 *   - Rule-based fallback when HF API is unavailable
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalysisData } from "@/context/DataContext";
import { chatWithLlama } from "@/lib/api";
import {
  Send, Bot, User, Loader2, Sparkles, Lightbulb,
  RotateCcw,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

/** Build a system prompt packed with analysis data for the LLM */
function buildSystemPrompt(data: any): string {
  const kpiSummary = data.kpis.map((k: any) => `${k.label}: ${k.value}`).join(", ");
  const topBranches = data.topBranches.map((b: any) => `${b.name} (${b.revenue})`).join(", ");
  const leakSummary = data.leakCards.map((l: any) => `${l.title}: ${l.amount}`).join(", ");
  const clusterSummary = data.clusters.map((c: any) => `${c.name}: ${c.branches.join(", ")}`).join("; ");

  return `You are a McKinsey-grade coffee chain analytics consultant for Stories Coffee, a Lebanese chain with 25 branches.

KEY METRICS: ${kpiSummary}
TOP BRANCHES: ${topBranches}
MARGIN LEAKS (62M total): ${leakSummary}
The biggest leak is free modifiers (28.1M) — oat milk, almond milk, decaf shots given at zero price but have real COGS.
BRANCH CLUSTERS: ${clusterSummary}
2026 FORECAST: 1.06B (+26% YoY) via GradientBoosting model.

RULES:
- Give concise, data-backed answers with specific numbers from the analysis.
- Reference branch names, product names, and margin percentages.
- When asked about recommendations, be specific and dollar-quantified.
- Format responses with markdown when helpful.
- If you don't know something specific, say so rather than guessing.
- Keep responses focused and actionable — this is for a hackathon presentation.`;
}

/** Simple rule-based fallback when the API is unavailable */
function ruleFallback(question: string, data: any): string {
  const q = question.toLowerCase();
  if (q.includes("revenue") || q.includes("sales"))
    return `Total chain revenue for 2025 is **840.5M LBP**. Top branch is Ain El Mreisseh at 119.6M, followed by Zalka (108.0M) and Khaldeh (84.2M). The 2026 forecast projects **1.06B** (+26% YoY).`;
  if (q.includes("margin") || q.includes("leak") || q.includes("loss"))
    return `We identified **62M in margin leaks** across 5 categories:\n1. Negative margin products: 30.1M (47 items sold below cost)\n2. Free modifiers: 28.1M (oat milk, almond milk etc. at $0)\n3. Cheesecake underpricing: 2.1M (34.4% vs 63% target)\n4. Veggie Sub crisis: 1.7M (priced at 7 vs cost of 60)\n5. Amioun POS error: 49K\n\nThe free modifier problem exists because the POS was set up with $0 modifiers, staff aren't prompted to upcharge, and the chain may have used free upgrades as competitive positioning.`;
  if (q.includes("modifier") || q.includes("oat") || q.includes("almond"))
    return `**28.1M/year** in free modifiers. Top offenders:\n- ADD Oat Milk: 184K units, 7.4M cost absorbed\n- ADD Almond Milk: 156K units, 5.5M cost absorbed\n- ADD Decaf Shot: 143K units, 4.3M cost absorbed\n\nRecommendation: Charge 30-50% of cost for premium modifiers. Recovery potential: **8.4–14.1M/year**.`;
  if (q.includes("cluster") || q.includes("branch") || q.includes("segment"))
    return `KMeans clustering identified **4 segments**:\n1. **Cash Cows** (Ain El Mreisseh, Zalka, Khaldeh) — Avg 104M revenue\n2. **Established** (13 branches) — Avg 32M, focus on efficiency\n3. **Growth Engines** (Airport, Ramlet El Bayda, Aley + 5) — +100% growth\n4. **Event/Specialty** (Event Starco) — 76% margin, event-driven`;
  if (q.includes("forecast") || q.includes("2026") || q.includes("predict"))
    return `GradientBoosting model projects **1.06B** for 2026 (+26% YoY). Key drivers:\n- Airport branch ramping to full-year operation\n- Sin El Fil projected at 84.5M (+310%)\n- New branches (Aley, Mansourieh) reaching maturity`;
  if (q.includes("menu") || q.includes("star") || q.includes("dog"))
    return `Menu engineering classified **409 products**:\n- ⭐ Stars (124): High margin + high volume (Iced Latte, Mango Yoghurt Combo)\n- 🧩 Puzzles (81): High margin, low volume — need marketing\n- 🐎 Plowhorses (81): High volume, low margin — reprice\n- 🐕 Dogs (123): Low on both — consider removal`;
  return `I'm the Stories Coffee analytics assistant. I can answer questions about:\n- Revenue & profitability (840M/year)\n- Margin leaks (62M identified)\n- Free modifier analysis (28.1M in giveaways)\n- Menu engineering (409 products classified)\n- Branch clustering (4 strategic segments)\n- 2026 revenue forecast (1.06B)\n\nWhat would you like to know?`;
}

/* Suggested questions */
const SUGGESTIONS = [
  "What are the biggest margin leaks?",
  "Why are modifiers given for free?",
  "Which branches should we invest in?",
  "Show me the 2026 revenue forecast",
  "What products should we remove from the menu?",
];

/* ────────────────────── Main component ────────────────────── */
export default function ChatPage() {
  const data = useAnalysisData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Auto-scroll to bottom on new messages */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  /* Send message */
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      let response: string;
      if (useFallback) {
        response = ruleFallback(text, data);
      } else {
        const systemPrompt = buildSystemPrompt(data);
        const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
        response = await chatWithLlama(systemPrompt, history, text);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: Date.now() }]);
    } catch (err: any) {
      // If HF fails, switch to fallback and retry
      setUseFallback(true);
      const fallbackResponse = ruleFallback(text, data);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: fallbackResponse + "\n\n*— Rule-based response (LLaMA API unavailable)*", timestamp: Date.now() },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, data, useFallback]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setInput("");
  }, []);

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="p-6 pb-0 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-foreground">
                AI Consultant
              </h1>
              <p className="text-muted-foreground text-sm mt-1 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {useFallback ? "Rule-based mode (LLaMA unavailable)" : "LLaMA 4 Scout · 17B-16E via HuggingFace"}
              </p>
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 lg:px-8 space-y-4 min-h-0">
        {/* Welcome state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center h-full text-center space-y-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Bot className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Ask me about Stories Coffee</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                I have the full analysis loaded — revenue data, margin leaks, menu engineering, forecasts, and clustering.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-lg">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-3 py-1.5 bg-white border border-border/60 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-accent/40 transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat messages */}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.timestamp}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-accent text-white rounded-br-md"
                    : "bg-white border border-border/40 text-foreground rounded-bl-md"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-neutral max-w-none whitespace-pre-wrap">{msg.content}</div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-accent" />
            </div>
            <div className="bg-white border border-border/40 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span className="text-xs text-muted-foreground">Thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-4 lg:px-8 border-t border-border/40 bg-white/80 backdrop-blur-sm">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-center gap-2 max-w-3xl mx-auto"
        >
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about revenue, margin leaks, modifiers, forecasts..."
              className="w-full px-4 py-3 pr-12 bg-gray-50 border border-border/60 rounded-xl text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all duration-200"
              disabled={isLoading}
            />
            <Lightbulb className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
          </div>
          <motion.button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-xl bg-accent text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-accent/90 transition-all duration-200"
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
      </div>
    </div>
  );
}
