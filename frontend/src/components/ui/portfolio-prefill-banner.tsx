// frontend/src/components/ui/portfolio-prefill-banner.tsx
"use client";

import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  /** Show the banner only if this is true */
  show: boolean;
  className?: string;
}

/**
 * Dismissible banner shown at the top of a tool wizard when fields
 * have been pre-filled from the user's saved portfolio profile.
 */
export function PortfolioPrefillBanner({ show, className }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  return (
    <div className={cn(
      "flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl",
      "bg-primary/5 border border-primary/20 text-sm",
      className
    )}>
      <div className="flex items-center gap-2 min-w-0">
        <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        <p className="text-xs text-foreground/80">
          <span className="font-semibold text-primary">Pre-filled from your portfolio</span>
          {" — "}review and adjust as needed.{" "}
          <Link href="/profile" className="underline underline-offset-2 hover:text-primary transition-colors">
            Edit profile
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}