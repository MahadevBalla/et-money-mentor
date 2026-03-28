// frontend/src/components/chat/chat-input-bar.tsx
"use client";

import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_CHARS = 4000;

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInputBar({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 148)}px`;
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const remaining = MAX_CHARS - text.length;
  const nearLimit = remaining < 300;
  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm px-4 pt-3 pb-4">
      {/* Input row */}
      <div
        className={cn(
          "flex items-end gap-2 rounded-2xl border bg-card px-4 py-3",
          "transition-colors duration-150",
          "focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20",
          disabled ? "opacity-60 cursor-not-allowed" : "border-border"
        )}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={
            disabled
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
          {/* Character counter — only near limit */}
          {nearLimit && (
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

          {/* Send button */}
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
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hint row */}
      <p className="text-[11px] text-muted-foreground/60 text-center mt-2 select-none">
        <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
          Enter
        </kbd>
        {" "}to send ·{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
          Shift + Enter
        </kbd>
        {" "}for new line
      </p>
    </div>
  );
}