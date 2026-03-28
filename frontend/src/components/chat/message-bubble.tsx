// frontend/src/components/chat/message-bubble.tsx
"use client";

import { motion } from "framer-motion";
import { Bot, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chat";

// ── Typing dots — shown before first token arrives ────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-0.5 h-5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-2 h-2 rounded-full bg-muted-foreground/50"
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Blinking cursor — shown while tokens are streaming in ─────────────────────
// Uses --primary from globals.css (teal oklch token) — no hardcoded colour
function StreamingCursor() {
  return (
    <motion.span
      className="inline-block w-[2px] h-[1em] bg-primary align-middle ml-[2px] rounded-sm"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ── Timestamp ──────────────────────────────────────────────────────────────────
function Timestamp({ date }: { date: Date }) {
  return (
    <span className="text-[10px] text-muted-foreground/60 mt-1 px-1 select-none">
      {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

// ── Main bubble ────────────────────────────────────────────────────────────────
export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  // isLoading=true + isStreaming=false  → dots (waiting for first token)
  // isLoading=false + isStreaming=true  → content + blinking cursor
  // isLoading=false + isStreaming=false → final content, show timestamp
  const showDots   = !!message.isLoading && !message.isStreaming;
  const showCursor = !!message.isStreaming && !message.isLoading;
  const showTime   = !message.isLoading && !message.isStreaming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={cn(
        "flex gap-2.5 w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-0.5",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5" />
        ) : (
          <Bot className="h-3.5 w-3.5" />
        )}
      </div>

      {/* Bubble + timestamp */}
      <div
        className={cn(
          "flex flex-col max-w-[78%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : message.isError
              ? "bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          {showDots ? (
            <TypingDots />
          ) : message.isError ? (
            <span className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {message.content}
            </span>
          ) : (
            <p className="whitespace-pre-wrap break-words">
              {message.content}
              {showCursor && <StreamingCursor />}
            </p>
          )}
        </div>

        {showTime && <Timestamp date={message.timestamp} />}
      </div>
    </motion.div>
  );
}