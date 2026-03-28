// frontend/src/components/ui/terminal-demo.tsx
"use client";
import { useEffect, useState } from "react";

type LineConfig = {
    text: string;
    color: string;
    prefix?: string;
    prefixColor?: string;
    badge?: string;
    badgeColor?: string;
};

const LINES: LineConfig[] = [
    {
        text: "Uploading CAMS statement...",
        color: "text-slate-300",
        prefix: "›",
        prefixColor: "text-slate-500",
        badge: "PROCESSING",
        badgeColor: "text-amber-400/80 border-amber-400/30",
    },
    {
        text: "Detected 22% overlap across 3 funds",
        color: "text-amber-300",
        prefix: "⚠",
        prefixColor: "text-amber-400",
        badge: "WARNING",
        badgeColor: "text-amber-400/80 border-amber-400/30",
    },
    {
        text: "Old regime saves ₹47,200 this year",
        color: "text-emerald-300",
        prefix: "✓",
        prefixColor: "text-emerald-400",
        badge: "SAVED",
        badgeColor: "text-emerald-400/80 border-emerald-400/30",
    },
    {
        text: "FIRE age: 48 — You're on track",
        color: "text-teal-300",
        prefix: "✦",
        prefixColor: "text-teal-400",
        badge: "ON TRACK",
        badgeColor: "text-teal-400/80 border-teal-400/30",
    },
];

export function TerminalDemo() {
    const [displayed, setDisplayed] = useState<LineConfig[]>([]);
    const [currentLine, setCurrentLine] = useState(0);
    const [currentChar, setCurrentChar] = useState(0);

    // Derived — no extra setState call, no lint warning
    const done = displayed.length >= LINES.length;

    useEffect(() => {
        if (currentLine >= LINES.length) return;
        const line = LINES[currentLine];
        if (currentChar < line.text.length) {
            const delay = 35 + Math.random() * 45;
            const t = setTimeout(() => setCurrentChar((c) => c + 1), delay);
            return () => clearTimeout(t);
        } else {
            const t = setTimeout(() => {
                setDisplayed((prev) => [...prev, line]);
                setCurrentLine((l) => l + 1);
                setCurrentChar(0);
            }, 320);
            return () => clearTimeout(t);
        }
    }, [currentLine, currentChar]);

    const partial =
        currentLine < LINES.length ? LINES[currentLine].text.slice(0, currentChar) : "";
    const currentCfg = currentLine < LINES.length ? LINES[currentLine] : null;

    return (
        <div className="relative w-full max-w-lg mx-auto">
            {/* Outer glow */}
            <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 blur-xl pointer-events-none" />

            {/* Terminal window */}
            <div
                className="relative rounded-2xl overflow-hidden border border-white/[0.07]"
                style={{
                    background:
                        "linear-gradient(145deg, #080d14 0%, #0a0f1a 60%, #070c13 100%)",
                    boxShadow:
                        "0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.6), 0 0 40px rgba(16,185,129,0.06)",
                }}
            >
                {/* Scanline overlay */}
                <div
                    className="absolute inset-0 pointer-events-none z-10 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 3px)",
                    }}
                />

                {/* Title bar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <span className="size-2.5 rounded-full bg-red-500/50 ring-1 ring-red-500/20" />
                            <span className="size-2.5 rounded-full bg-amber-500/50 ring-1 ring-amber-500/20" />
                            <span className="size-2.5 rounded-full bg-emerald-500/50 ring-1 ring-emerald-500/20" />
                        </div>
                        <span className="text-[11px] text-white/20 font-mono ml-2 tracking-widest uppercase">
                            mentor.sh
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span
                            className={`size-1.5 rounded-full transition-colors duration-500 ${done ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}
                        />
                        <span className="text-[10px] font-mono text-white/20 tracking-wider">
                            {done ? "READY" : "RUNNING"}
                        </span>
                    </div>
                </div>

                {/* Terminal body */}
                <div className="p-5 font-mono text-[13px] min-h-[11rem] space-y-2.5">
                    {/* Prompt line always shown first */}
                    <p className="text-white/20 text-[11px] tracking-wider mb-3">
                        $ analyze --portfolio --tax --fire
                    </p>

                    {/* Completed lines */}
                    {displayed.map((line, i) => (
                        <div key={i} className="flex items-center gap-3 group">
                            <span className={`shrink-0 text-[15px] ${line.prefixColor}`}>
                                {line.prefix}
                            </span>
                            <span className={`${line.color} flex-1 leading-relaxed`}>
                                {line.text}
                            </span>
                            {line.badge && (
                                <span
                                    className={`hidden sm:inline-block shrink-0 text-[9px] font-bold tracking-[0.15em] px-2 py-0.5 rounded border ${line.badgeColor}`}
                                >
                                    {line.badge}
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Currently typing line */}
                    {currentCfg && (
                        <div className="flex items-center gap-3">
                            <span className={`shrink-0 text-[15px] ${currentCfg.prefixColor} opacity-60`}>
                                {currentCfg.prefix}
                            </span>
                            <span className={`${currentCfg.color}`}>
                                {partial}
                                <span
                                    className="inline-block w-[7px] h-[13px] ml-0.5 align-middle rounded-[1px]"
                                    style={{
                                        background: "currentColor",
                                        animation: "termBlink 0.9s step-end infinite",
                                        opacity: 0.9,
                                    }}
                                />
                            </span>
                        </div>
                    )}
                </div>

                {/* Bottom status bar */}
                <div className="flex items-center gap-4 px-5 py-2.5 border-t border-white/[0.04]">
                    <span className="text-[10px] font-mono text-white/15 tracking-wider">
                        {displayed.length}/{LINES.length} checks
                    </span>
                    <div className="flex-1 h-px bg-white/[0.04]" />
                    <div className="flex gap-1">
                        {LINES.map((_, i) => (
                            <span
                                key={i}
                                className="size-1 rounded-full transition-all duration-500"
                                style={{
                                    background:
                                        i < displayed.length
                                            ? "rgba(52,211,153,0.7)"
                                            : i === displayed.length
                                                ? "rgba(251,191,36,0.7)"
                                                : "rgba(255,255,255,0.1)",
                                    boxShadow:
                                        i < displayed.length
                                            ? "0 0 4px rgba(52,211,153,0.5)"
                                            : "none",
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes termBlink {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 0; }
        }
      `}</style>
        </div>
    );
}
