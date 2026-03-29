// frontend/src/components/chat/voice-recorder.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, Globe, Check } from "lucide-react";
import { toast } from "sonner";
import {
  startRecording,
  speechToText,
  LANG_CYCLE,
  LANGUAGE_META,
  type RecordingSession,
  type SupportedLanguage,
} from "@/lib/voice";
import { cn } from "@/lib/utils";

// ── Waveform — 5 bars driven by live mic amplitude ────────────────────────────
function WaveformBars({ amplitude }: { amplitude: number }) {
  const weights = [0.45, 0.75, 1.0, 0.75, 0.45];
  return (
    <div className="flex items-center gap-[3px] h-5 shrink-0">
      {weights.map((w, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-destructive"
          style={{ height: "100%", originY: "50%" }}
          animate={{ scaleY: Math.max(0.15, amplitude * w * 3) }}
          transition={{ duration: 0.08, ease: "linear" }}
        />
      ))}
    </div>
  );
}

// ── Language picker dropdown ──────────────────────────────────────────────────
function LanguageMenu({
  language,
  onSelect,
  onClose,
}: {
  language: SupportedLanguage;
  onSelect: (lang: SupportedLanguage) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "absolute bottom-full mb-2 right-0 z-50",
        "w-48 rounded-2xl border border-border",
        "bg-card shadow-2xl shadow-black/25",
        "overflow-hidden"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border bg-muted/40">
        <Globe className="h-3 w-3 text-muted-foreground shrink-0" />
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Voice Language
        </p>
      </div>

      {/* Language options */}
      <div className="py-1">
        {LANG_CYCLE.map((lang) => {
          const meta = LANGUAGE_META[lang];
          const isActive = lang === language;

          return (
            <button
              key={lang}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(lang);
                onClose();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 text-left",
                "transition-colors duration-100",
                isActive
                  ? "bg-primary/8 hover:bg-primary/12"
                  : "hover:bg-muted/60"
              )}
            >
              {/* Language code badge */}
              <span
                className={cn(
                  "flex-shrink-0 w-7 h-5 rounded-md flex items-center justify-center",
                  "text-[9px] font-bold font-mono tracking-wide",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground border border-border"
                )}
              >
                {meta.label}
              </span>

              {/* Name + hint */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs font-medium leading-tight truncate",
                    isActive ? "text-primary" : "text-foreground"
                  )}
                >
                  {meta.name}
                </p>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {meta.hint}
                </p>
              </div>

              {/* Active checkmark */}
              {isActive && (
                <Check className="h-3 w-3 text-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="px-3.5 py-2 border-t border-border bg-muted/20">
        <p className="text-[10px] text-muted-foreground/70 leading-snug">
          Speak in your chosen language — AI replies in English
        </p>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export function VoiceRecorder({
  onTranscript,
  disabled,
  language,
  onLanguageChange,
}: Props) {
  const [recState, setRecState] = useState<"idle" | "recording" | "transcribing">("idle");
  const [amplitude, setAmplitude] = useState(0);
  const [langOpen, setLangOpen] = useState(false);

  const sessionRef  = useRef<RecordingSession | null>(null);
  const ampTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef     = useRef<HTMLDivElement>(null);

  // ── Click-outside closes the menu ────────────────────────────────────────
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

  // ── Amplitude polling ─────────────────────────────────────────────────────
  const tickAmplitude = useCallback(() => {
    if (!sessionRef.current) return;
    setAmplitude(sessionRef.current.getAmplitude());
    ampTimerRef.current = setTimeout(tickAmplitude, 80);
  }, []);

  const stopAmplitudePoll = useCallback(() => {
    if (ampTimerRef.current) {
      clearTimeout(ampTimerRef.current);
      ampTimerRef.current = null;
    }
    setAmplitude(0);
  }, []);

  // ── Start recording ───────────────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    if (disabled || recState !== "idle") return;
    setLangOpen(false); // close menu if open

    try {
      const session = await startRecording(
        async (blob) => {
          stopAmplitudePoll();
          setRecState("transcribing");
          try {
            const transcript = await speechToText(blob, language);
            if (transcript.trim()) {
              onTranscript(transcript.trim());
            } else {
              toast.warning("Couldn't hear anything clearly. Please try again.");
            }
          } catch (err) {
            const msg = (err as Error).message;
            if (msg === "VOICE_NOT_CONFIGURED") {
              toast.error("Voice service not set up. Please type instead.");
            } else if (msg === "AUDIO_TOO_LARGE") {
              toast.error("Recording too long. Please keep it under 2 minutes.");
            } else {
              toast.error("Transcription failed. Please type your message.");
            }
          } finally {
            setRecState("idle");
            sessionRef.current = null;
          }
        },
        (err) => {
          stopAmplitudePoll();
          setRecState("idle");
          sessionRef.current = null;
          if (err.message === "MIC_PERMISSION_DENIED") {
            toast.error("Microphone blocked. Allow access in browser settings.");
          } else {
            toast.error("Could not start recording. Please try again.");
          }
        }
      );

      sessionRef.current = session;
      setRecState("recording");
      tickAmplitude();
    } catch {
      // error already surfaced via onError above
    }
  }, [disabled, recState, language, onTranscript, tickAmplitude, stopAmplitudePoll]);

  // ── Stop recording ────────────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    stopAmplitudePoll();
    sessionRef.current?.stop();
  }, [stopAmplitudePoll]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopAmplitudePoll();
      sessionRef.current?.stop();
    };
  }, [stopAmplitudePoll]);

  const isRecording    = recState === "recording";
  const isTranscribing = recState === "transcribing";
  const currentMeta    = LANGUAGE_META[language];

  return (
    <div className="flex items-center gap-1.5 shrink-0 self-end pb-0.5">

      {/* Language pill + dropdown — only when idle */}
      <AnimatePresence>
        {recState === "idle" && !disabled && (
          <motion.div
            key="lang-wrapper"
            ref={menuRef}
            className="relative"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* Pill trigger */}
            <button
              onClick={(e) => { e.stopPropagation(); setLangOpen((o) => !o); }}
              title={`Voice language: ${currentMeta.hint}. Click to change.`}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full whitespace-nowrap",
                "bg-muted border text-[10px] font-mono",
                "transition-colors duration-150",
                langOpen
                  ? "border-primary/60 text-primary bg-primary/5"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              )}
            >
              <Globe className="h-2.5 w-2.5 shrink-0" />
              <span>{currentMeta.label}</span>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {langOpen && (
                <LanguageMenu
                  language={language}
                  onSelect={onLanguageChange}
                  onClose={() => setLangOpen(false)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live waveform bars — visible only while recording */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            key="waveform"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.15 }}
          >
            <WaveformBars amplitude={amplitude} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic button */}
      <motion.button
        onClick={isRecording ? handleStop : handleStart}
        disabled={disabled || isTranscribing}
        whileTap={{ scale: 0.88 }}
        className={cn(
          "relative h-8 w-8 rounded-xl flex items-center justify-center",
          "transition-colors duration-150 focus-visible:outline-none",
          isRecording
            ? "bg-destructive text-white"
            : isTranscribing
            ? "bg-muted text-muted-foreground cursor-wait"
            : disabled
            ? "bg-muted text-muted-foreground opacity-40 cursor-not-allowed"
            : "bg-muted text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
        title={
          isRecording    ? "Tap to stop recording"
          : isTranscribing ? "Transcribing your voice…"
          : `Tap to speak in ${currentMeta.hint}`
        }
      >
        {/* Pulsing ring while recording */}
        {isRecording && (
          <motion.span
            className="absolute inset-0 rounded-xl border-2 border-destructive pointer-events-none"
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {isTranscribing ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-3.5 w-3.5" />
        ) : (
          <Mic className="h-3.5 w-3.5" />
        )}
      </motion.button>
    </div>
  );
}