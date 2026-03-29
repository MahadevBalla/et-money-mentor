// frontend/src/components/chat/message-bubble.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, UserRound, AlertCircle, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/chat";
import { TtsPlayer } from "./tts-player";

// ── Typing dots ────────────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-[5px] py-1 h-5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block w-1.5 h-1.5 rounded-full bg-muted-foreground/40"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.16,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Blinking cursor ────────────────────────────────────────────────────────────
function StreamingCursor() {
  return (
    <motion.span
      className="inline-block w-[2px] h-[1em] bg-primary align-middle ml-[2px] rounded-sm"
      animate={{ opacity: [1, 0, 1] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ── Copy button ────────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy response"
      className={cn(
        "flex items-center gap-1 px-1.5 py-0.5 rounded-md",
        "text-muted-foreground/50 hover:text-muted-foreground",
        "hover:bg-muted transition-all duration-150"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1 text-emerald-500 text-[10px] font-medium"
          >
            <Check className="h-3 w-3" />
            Copied
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Copy className="h-3 w-3" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ── AI Avatar ──────────────────────────────────────────────────────────────────
function AiAvatar({ isStreaming }: { isStreaming?: boolean }) {
  return (
    <div className="relative shrink-0 mt-0.5">
      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
        <BrainCircuit className="h-4 w-4 text-primary" />
      </div>
      {isStreaming && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary border border-background" />
        </span>
      )}
    </div>
  );
}

// ── User Avatar ────────────────────────────────────────────────────────────────
function UserAvatar() {
  return (
    <div className="shrink-0 h-8 w-8 rounded-xl bg-primary flex items-center justify-center mt-0.5">
      <UserRound className="h-4 w-4 text-primary-foreground" />
    </div>
  );
}

// ── Message content — paragraph + **bold** aware ──────────────────────────────
function MessageContent({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/);
  return (
    <div className="space-y-2">
      {paragraphs.map((para, pi) => (
        <p key={pi} className="leading-relaxed whitespace-pre-wrap break-words">
          {para.split(/\*\*(.*?)\*\*/g).map((chunk, ci) =>
            ci % 2 === 1 ? (
              <strong key={ci} className="font-semibold">{chunk}</strong>
            ) : (
              <span key={ci}>{chunk}</span>
            )
          )}
        </p>
      ))}
    </div>
  );
}

// ── Main bubble ────────────────────────────────────────────────────────────────
export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  const showDots   = !!message.isLoading && !message.isStreaming;
  const showCursor = !!message.isStreaming && !message.isLoading;
  const showTime   = !message.isLoading && !message.isStreaming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className={cn(
        "flex gap-3 w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      {isUser ? <UserAvatar /> : <AiAvatar isStreaming={showCursor} />}

      {/* Bubble + meta */}
      <div className={cn(
        "flex flex-col max-w-[78%]",
        isUser ? "items-end" : "items-start"
      )}>
        {/* Sender label */}
        <span className={cn(
          "text-[10px] font-semibold uppercase tracking-wider mb-1 px-1",
          isUser ? "text-primary/70" : "text-muted-foreground/50"
        )}>
          {isUser ? "You" : "Money Mentor"}
        </span>

        {/* Bubble */}
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm shadow-sm shadow-primary/20"
            : message.isError
            ? "bg-destructive/8 text-destructive border border-destructive/20 rounded-tl-sm"
            : "bg-muted/70 text-foreground rounded-tl-sm border border-border/50"
        )}>
          {showDots ? (
            <TypingDots />
          ) : message.isError ? (
            <span className="flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {message.content}
            </span>
          ) : (
            <>
              <MessageContent content={message.content} />
              {showCursor && <StreamingCursor />}
            </>
          )}
        </div>

        {/* Footer — timestamp + copy + TTS */}
        {showTime && (
          <div className={cn(
            "flex items-center gap-1 mt-1.5 px-1",
            isUser ? "flex-row-reverse" : "flex-row"
          )}>
            <span className="text-[10px] text-muted-foreground/50 select-none">
              {message.timestamp.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {!isUser && !!message.content && !message.isError && (
              <>
                <span className="text-muted-foreground/30 text-xs">·</span>
                <CopyButton text={message.content} />
                <TtsPlayer text={message.content} />
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}