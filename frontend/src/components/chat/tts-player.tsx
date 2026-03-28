// frontend/src/components/chat/tts-player.tsx
"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { textToSpeech, type SupportedLanguage } from "@/lib/voice";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  voice?: string;
  language?: SupportedLanguage;
}

export function TtsPlayer({
  text,
  voice = "meera",
  language = "en-IN",
}: Props) {
  const [ttsState, setTtsState] = useState<"idle" | "loading" | "playing">(
    "idle"
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  // Release blob URL when component unmounts to prevent memory leaks
  useEffect(() => () => cleanup(), [cleanup]);

  const handleToggle = useCallback(async () => {
    // ── Stop if already playing ──────────────────────────────────────────
    if (ttsState === "playing") {
      cleanup();
      setTtsState("idle");
      return;
    }

    // ── Fetch TTS audio ──────────────────────────────────────────────────
    setTtsState("loading");
    try {
      const url = await textToSpeech(text, voice, language);
      blobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setTtsState("idle");
        cleanup();
      };

      audio.onerror = () => {
        setTtsState("idle");
        cleanup();
        toast.error("Could not play audio.");
      };

      await audio.play();
      setTtsState("playing");
    } catch (err) {
      setTtsState("idle");
      const msg = (err as Error).message;
      if (msg === "VOICE_NOT_CONFIGURED") {
        toast.error("Voice playback not available.");
      } else {
        toast.error("Could not play response. Please try again.");
      }
    }
  }, [ttsState, text, voice, language, cleanup]);

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.85 }}
      disabled={ttsState === "loading"}
      className={cn(
        "h-6 w-6 rounded-lg flex items-center justify-center",
        "transition-colors duration-150 focus-visible:outline-none",
        ttsState === "playing"
          ? "bg-primary/15 text-primary"
          : ttsState === "loading"
          ? "text-muted-foreground/40 cursor-wait"
          : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted"
      )}
      title={ttsState === "playing" ? "Stop audio" : "Play response aloud"}
    >
      {ttsState === "loading" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : ttsState === "playing" ? (
        // Pulsing speaker icon while audio plays — uses --primary token
        <motion.div
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        >
          <Volume2 className="h-3 w-3" />
        </motion.div>
      ) : (
        <Volume2 className="h-3 w-3" />
      )}
    </motion.button>
  );
}