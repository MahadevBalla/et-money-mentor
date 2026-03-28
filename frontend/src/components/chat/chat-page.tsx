// frontend/src/components/chat/chat-page.tsx
"use client";

import { useEffect, useCallback, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Bot, Trash2, Sparkles, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MessageList } from "./message-list";
import { SuggestionChips } from "./suggestion-chips";
import { ChatInputBar } from "./chat-input-bar";
import {
  sendChatMessage,
  getOrCreateChatSession,
  clearChatSession,
  makeUserMessage,
  makeLoadingMessage,
  type ChatMessage,
} from "@/lib/chat";
import { cn } from "@/lib/utils";

export function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ── Bootstrap session on mount ─────────────────────────────────────────────
  useEffect(() => {
    getOrCreateChatSession()
      .then((id) => {
        setSessionId(id);
        setSessionReady(true);
      })
      .catch(() => {
        toast.error("Could not start your chat session. Please refresh the page.");
      });
  }, []);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (text: string) => {
      if (!sessionId || isLoading || !text.trim()) return;

      const userMsg = makeUserMessage(text.trim());
      const loadingMsg = makeLoadingMessage();

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setIsLoading(true);

      try {
        const reply = await sendChatMessage(sessionId, text.trim());

        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingMsg.id
              ? { ...m, content: reply, isLoading: false }
              : m
          )
        );
      } catch (err: unknown) {
        // ApiException has .status, plain Error has .message
        const status = (err as any)?.status;
        const msg = err instanceof Error ? err.message : "unknown";

        if (status === 404 || msg === "SESSION_NOT_FOUND") {
          // Session expired — silently recover
          clearChatSession();
          toast.warning("Session expired — starting a fresh one.");
          try {
            const newId = await getOrCreateChatSession();
            setSessionId(newId);
            // Retry with new session
            const reply = await sendChatMessage(newId, text.trim());
            setMessages((prev) =>
              prev.map((m) =>
                m.id === loadingMsg.id
                  ? { ...m, content: reply, isLoading: false }
                  : m
              )
            );
          } catch {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === loadingMsg.id
                  ? {
                      ...m,
                      content: "Could not reconnect. Please refresh.",
                      isLoading: false,
                      isError: true,
                    }
                  : m
              )
            );
          }
        } else if (status === 401 || msg === "UNAUTHORIZED") {
          toast.error("Session expired — please sign in again.");
          setMessages((prev) => prev.filter((m) => m.id !== loadingMsg.id));
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === loadingMsg.id
                ? {
                    ...m,
                    content: "Something went wrong. Please try again.",
                    isLoading: false,
                    isError: true,
                  }
                : m
            )
          );
          toast.error("Failed to get a response. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, isLoading]
  );

  // ── Clear chat ─────────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    setMessages([]);
    clearChatSession();
    setSessionReady(false);
    getOrCreateChatSession()
      .then((id) => {
        setSessionId(id);
        setSessionReady(true);
        toast.success("Chat cleared — fresh session started.");
      })
      .catch(() => toast.error("Could not reset session."));
  }, []);

  return (
    <AppShell>
      {/*
        We override the AppShell's inner max-w-5xl/py-8 padding
        by using negative margin + full-height flex column.
        This is the only clean way since AppShell wraps all pages.
      */}
      <div className="-mx-4 sm:-mx-6 -my-8 flex flex-col h-[calc(100vh-4rem)]">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold leading-tight">
                Money Mentor
              </span>
              <span
                className={cn(
                  "text-[11px] leading-tight",
                  sessionReady
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {sessionReady ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-1"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" />
                    Ready
                  </motion.span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Connecting…
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Clear button — only shown when there are messages */}
          {messages.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleClear}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
              title="Clear chat and start fresh"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </motion.button>
          )}
        </div>

        {/* ── Message area ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden relative">
          {messages.length === 0 ? (
            <SuggestionChips
              onSelect={handleSend}
              disabled={!sessionReady || isLoading}
            />
          ) : (
            <MessageList messages={messages} />
          )}
        </div>

        {/* ── Input bar ───────────────────────────────────────────────────── */}
        <ChatInputBar
          onSend={handleSend}
          disabled={!sessionReady || isLoading}
        />
      </div>
    </AppShell>
  );
}