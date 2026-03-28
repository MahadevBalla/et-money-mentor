// frontend/src/lib/chat.ts
// ── Uses api.ts + authService.authenticatedRequest — same pattern as all other lib files ──
import { api } from "./api";
import { authService } from "./auth";

// ── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  isError?: boolean;
}

// ── Helper: get auth headers fresh each call ─────────────────────────────────
// CRITICAL: must call this lazily inside each function, NOT at module level.
// authService reads localStorage in its constructor, but Next.js may evaluate
// the module before localStorage is available if called at import time.
function getHeaders(): Record<string, string> {
  const token = authService.getAccessToken();
  if (!token) throw new Error("UNAUTHORIZED");
  return { Authorization: `Bearer ${token}` };
}

// ── Session management ───────────────────────────────────────────────────────

async function createChatSession(): Promise<string> {
  const data = await authService.authenticatedRequest(() =>
    api.post<{ session_id: string }>("/api/session", undefined, getHeaders())
  );
  return data.session_id;
}

export async function getOrCreateChatSession(): Promise<string> {
  if (typeof window === "undefined") throw new Error("SSR not supported");
  const stored = localStorage.getItem("chat_session_id");
  if (stored) return stored;
  const id = await createChatSession();
  localStorage.setItem("chat_session_id", id);
  return id;
}

export function clearChatSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("chat_session_id");
  }
}

// ── POST /api/chat ───────────────────────────────────────────────────────────

export async function sendChatMessage(
  sessionId: string,
  message: string
): Promise<string> {
  const data = await authService.authenticatedRequest(() =>
    api.post<{ reply: string }>(
      "/api/chat",
      { session_id: sessionId, message: message.trim() },
      getHeaders()
    )
  );
  return data.reply;
}

// ── Message factories ────────────────────────────────────────────────────────

export function makeUserMessage(content: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "user",
    content,
    timestamp: new Date(),
  };
}

export function makeLoadingMessage(): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: "",
    timestamp: new Date(),
    isLoading: true,
  };
}