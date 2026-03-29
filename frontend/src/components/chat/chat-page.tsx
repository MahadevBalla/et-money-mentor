// frontend/src/components/chat/chat-page.tsx
"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Trash2, BrainCircuit, Loader2, StopCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MessageList } from "./message-list";
import { SuggestionChips } from "./suggestion-chips";
import { ChatInputBar } from "./chat-input-bar";
import {
  streamChatMessage,
  getOrCreateChatSession,
  clearChatSession,
  makeUserMessage,
  makeAssistantStreamingMessage,
  type ChatMessage,
} from "@/lib/chat";
import { cn } from "@/lib/utils";

export function ChatPage() {
  const [messages, setMessages]         = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId]       = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [isStreaming, setIsStreaming]   = useState(false);

  const abortRef       = useRef<AbortController | null>(null);
  const streamingIdRef = useRef<string | null>(null);

  // ── Bootstrap session ──────────────────────────────────────────────────────
  useEffect(() => {
    getOrCreateChatSession()
      .then((id) => { setSessionId(id); setSessionReady(true); })
      .catch(() => toast.error("Could not start your chat session. Please refresh."));
  }, []);

  // ── Stop stream ────────────────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    abortRef.current?.abort();
    setMessages((prev) =>
      prev.map((m) =>
        m.id === streamingIdRef.current
          ? { ...m, isStreaming: false, isLoading: false }
          : m
      )
    );
    setIsStreaming(false);
    abortRef.current = null;
    streamingIdRef.current = null;
  }, []);

  // ── Send message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(
    (text: string) => {
      if (!sessionId || isStreaming || !text.trim()) return;

      const userMsg      = makeUserMessage(text.trim());
      const assistantMsg = makeAssistantStreamingMessage();
      streamingIdRef.current = assistantMsg.id;

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const abort = streamChatMessage(sessionId, text.trim(), {
        onToken: (token) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id !== assistantMsg.id ? m : {
                ...m,
                content: m.content + token,
                isLoading: false,
                isStreaming: true,
              }
            )
          );
        },
        onDone: () => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, isStreaming: false, isLoading: false }
                : m
            )
          );
          setIsStreaming(false);
          abortRef.current = null;
          streamingIdRef.current = null;
        },
        onError: (err) => {
          const msg = err.message;
          if (msg === "SESSION_NOT_FOUND") {
            clearChatSession();
            toast.warning("Session expired — starting fresh.");
            setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id));
            getOrCreateChatSession().then((id) => {
              setSessionId(id);
              toast.info("New session ready. Please resend your message.");
            });
          } else if (msg === "UNAUTHORIZED") {
            toast.error("Signed out — please sign in again.");
            setMessages((prev) => prev.filter((m) => m.id !== assistantMsg.id));
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsg.id
                  ? {
                      ...m,
                      content: "Something went wrong. Please try again.",
                      isLoading: false,
                      isStreaming: false,
                      isError: true,
                    }
                  : m
              )
            );
            toast.error("Stream interrupted. Please try again.");
          }
          setIsStreaming(false);
          abortRef.current = null;
          streamingIdRef.current = null;
        },
      });

      abortRef.current = abort;
    },
    [sessionId, isStreaming]
  );

  // ── Clear chat ─────────────────────────────────────────────────────────────
  const handleClear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    clearChatSession();
    setSessionReady(false);
    setIsStreaming(false);
    getOrCreateChatSession()
      .then((id) => {
        setSessionId(id);
        setSessionReady(true);
        toast.success("Chat cleared — fresh session started.");
      })
      .catch(() => toast.error("Could not reset session."));
  }, []);

  return (
    <AppShell noPadding>
      {/*
        KEY LAYOUT:
        - Outer div is a flex column filling 100% height
        - Middle scroll area: flex-1 overflow-y-auto
        - Input bar: shrink-0 at the bottom (sticky by being last in the flex col)
      */}
      <div className="fixed inset-x-0 bottom-0 top-16 lg:top-0 lg:left-60 flex flex-col overflow-hidden bg-background">

        {/* ── Scrollable message area ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* 
            max-w-5xl = 1024px — wide enough to use the space, 
            px-8 adds breathing room on the sides
          */}
          <div className="w-full max-w-5xl mx-auto px-8 pt-4 pb-6 h-full flex flex-col">
            {messages.length === 0 ? (
              <SuggestionChips
                onSelect={handleSend}
                disabled={!sessionReady || isStreaming}
              />
            ) : (
              <MessageList messages={messages} />
            )}
          </div>
        </div>

        {/* ── Input bar — shrink-0 keeps it pinned at the bottom ──────────── */}
        <div className="shrink-0 sticky bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur-xl">
          {/* Gradient fade above to soften the last message */}
          <div className="relative">
            <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            {/* Constrain input to same max-width as content */}
            <div className="w-full max-w-5xl mx-auto px-6 py-3">
              <div className="rounded-2xl shadow-lg ring-1 ring-border/50 bg-card overflow-hidden">
                <ChatInputBar
                  onSend={handleSend}
                  onStop={handleStop}
                  isStreaming={isStreaming}
                  disabled={!sessionReady}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppShell>
  );
}