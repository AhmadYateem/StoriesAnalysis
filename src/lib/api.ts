/**
 * API helpers for backend communication and LLaMA chat via server proxy.
 * The HuggingFace API key is stored server-side — the frontend never sees it.
 */

/* ── Backend base URL ── */
const API_BASE = import.meta.env.VITE_API_URL || "";

/* ── Upload CSVs to the backend for processing ── */
export async function uploadAndAnalyze(files: File[]): Promise<any> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(API_BASE + "/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Upload failed: " + errorText);
  }

  return response.json();
}

/* ── Check if backend is reachable ── */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(API_BASE + "/api/health", { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Chat with LLaMA 3.1 via the Flask backend proxy.
 * The backend holds the HuggingFace API key and forwards requests.
 */
export async function chatWithLlama(
  systemPrompt: string,
  conversationHistory: { role: string; content: string }[],
  userMessage: string
): Promise<string> {
  const response = await fetch(API_BASE + "/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_prompt: systemPrompt,
      history: conversationHistory,
      message: userMessage,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Chat API error: " + errorText);
  }

  const data = await response.json();
  return data.response || "I could not generate a response.";
}
