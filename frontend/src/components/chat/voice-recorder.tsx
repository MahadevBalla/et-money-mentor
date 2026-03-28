// frontend/src/components/chat/voice-recorder.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  startRecording,
  speechToText,
  LANG_CYCLE,
  LANGUAGE_LABELS,
  type RecordingSession,
  type SupportedLanguage,
} from "@/lib/voice";
import { cn } from "@/lib/utils";

// ── Waveform — 5 bars driven by live mic amplitude ────────────────────────────
// Heights are weighted so the centre bar is tallest (natural speech shape)
// Uses --destructive token from globals.css while recording
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

interface Props {
  onTranscript: (text: string) => void; // fired with final transcript
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
  const [recState, setRecState] = useState<
    "idle" | "recording" | "transcribing"
  >("idle");
  const [amplitude, setAmplitude] = useState(0);

  const sessionRef = useRef<RecordingSession | null>(null);
  const ampTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Poll amplitude every 80ms while recording for smooth waveform
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

  const handleStart = useCallback(async () => {
    if (disabled || recState !== "idle") return;

    try {
      const session = await startRecording(
        // ── onComplete: recording blob ready — send to STT ──────────────
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
        // ── onError: mic permission or recorder error ───────────────────
        (err) => {
          stopAmplitudePoll();
          setRecState("idle");
          sessionRef.current = null;

          if (err.message === "MIC_PERMISSION_DENIED") {
            toast.error(
              "Microphone blocked. Allow access in browser settings and try again."
            );
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

  const handleStop = useCallback(() => {
    stopAmplitudePoll();
    sessionRef.current?.stop();
    // state → "transcribing" is set inside onComplete callback above
  }, [stopAmplitudePoll]);

  // Cleanup on unmount — release mic if page navigates away mid-recording
  useEffect(() => {
    return () => {
      stopAmplitudePoll();
      sessionRef.current?.stop();
    };
  }, [stopAmplitudePoll]);

  // Cycle through supported languages on pill click
  const handleLangCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = LANG_CYCLE.indexOf(language);
    onLanguageChange(LANG_CYCLE[(idx + 1) % LANG_CYCLE.length]);
  };

  const isRecording = recState === "recording";
  const isTranscribing = recState === "transcribing";

  return (
    <div className="flex items-center gap-1.5 shrink-0 self-end pb-0.5">

      {/* Language pill — visible when idle and not disabled */}
      <AnimatePresence>
        {recState === "idle" && !disabled && (
          <motion.button
            key="lang-pill"
            initial={{ opacity: 0, width: 0, marginRight: 0 }}
            animate={{ opacity: 1, width: "auto", marginRight: 0 }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleLangCycle}
            title={`Recording language: ${language}. Click to cycle.`}
            className={cn(
              "px-2 py-0.5 rounded-full overflow-hidden whitespace-nowrap",
              "bg-muted border border-border",
              "text-[10px] font-mono text-muted-foreground",
              "hover:text-foreground hover:border-primary/40 transition-colors"
            )}
          >
            {LANGUAGE_LABELS[language]}
          </motion.button>
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
          isRecording
            ? "Tap to stop recording"
            : isTranscribing
            ? "Transcribing your voice…"
            : "Tap to speak"
        }
      >
        {/* Pulsing ring — only while recording */}
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