// frontend/src/components/chat/chat-input-bar.tsx
"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_CHARS = 4000;

interface Props {
  onSend: (text: string) => void;
  onStop?: () => void;       // called when Stop button / Enter during stream
  isStreaming?: boolean;     // true = currently receiving tokens
  disabled?: boolean;        // true = session not ready yet
}

export function ChatInputBar({ onSend, onStop, isStreaming, disabled }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea up to 148px
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 148)}px`;
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Enter during stream = Stop
      if (isStreaming) {
        onStop?.();
      } else {
        handleSend();
      }
    }
  };

  const remaining = MAX_CHARS - text.length;
  const nearLimit = remaining < 300;
  const canSend = text.trim().length > 0 && !disabled && !isStreaming;

  return (
    <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm px-4 pt-3 pb-4">
      {/* Input wrapper — glows primary while streaming */}
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-card px-4 py-3",
          "transition-colors duration-150",
          isStreaming
            ? "border-primary/40 ring-1 ring-primary/10"
            : "focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20 border-border",
          disabled && !isStreaming && "opacity-60 cursor-not-allowed"
        )}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          disabled={disabled && !isStreaming}
          rows={1}
          placeholder={
            isStreaming
              ? "Responding… press Stop or wait"
              : disabled
              ? "Connecting to your session..."
              : "Ask about your FIRE plan, tax savings, or anything financial…"
          }
          className={cn(
            "flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none",
            "placeholder:text-muted-foreground max-h-36 min-h-[1.5rem]",
            "disabled:cursor-not-allowed"
          )}
        />

        <div className="flex items-center gap-2 shrink-0 self-end pb-0.5">
          {nearLimit && !isStreaming && (
            <span
              className={cn(
                "text-xs tabular-nums",
                remaining < 100
                  ? "text-destructive font-medium"
                  : "text-muted-foreground"
              )}
            >
              {remaining}
            </span>
          )}

          {/* Button: Stop (red square) during stream, Send (primary arrow) otherwise */}
          {isStreaming ? (
            <button
              onClick={onStop}
              className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center",
                "bg-destructive/10 text-destructive",
                "hover:bg-destructive/20 transition-all active:scale-90"
              )}
              title="Stop generation (Enter)"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center",
                "transition-all duration-150 active:scale-90",
                canSend
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              title="Send message (Enter)"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contextual hint row */}
      <p className="text-[11px] text-muted-foreground/60 text-center mt-2 select-none">
        {isStreaming ? (
          <>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
              Enter
            </kbd>
            {" "}or click{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
              Stop
            </kbd>
            {" "}to cancel generation
          </>
        ) : (
          <>
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
              Enter
            </kbd>
            {" "}to send ·{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
              Shift + Enter
            </kbd>
            {" "}for new line
          </>
        )}
      </p>
    </div>
  );
}