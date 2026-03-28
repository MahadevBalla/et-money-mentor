// frontend/src/components/dashboard/dashboard-page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import {
  HeartPulse, Flame, Receipt, CalendarHeart,
  Users2, ScanLine, ArrowRight, Sparkles,
  TrendingUp, Wallet, ChevronRight,
} from "lucide-react";
import { StaggerItem, StaggerList } from "../ui/stagger-list";
import { getPortfolio, isProfileEmpty } from "@/lib/portfolio";
import type { PortfolioResponse, UserProfile } from "@/lib/portfolio";
import { cn } from "@/lib/utils";

const TOOLS = [
  { href: "/health-score", icon: HeartPulse, label: "Health Score",   description: "Get a 0–100 score across 6 financial dimensions",        color: "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300" },
  { href: "/fire",         icon: Flame,      label: "FIRE Planner",   description: "Calculate your FI date and the exact SIP to get there",   color: "bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300" },
  { href: "/tax",          icon: Receipt,    label: "Tax Wizard",     description: "Old vs New regime with missing deduction detection",       color: "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"   },
  { href: "/portfolio",    icon: ScanLine,   label: "MF X-Ray",       description: "Upload your CAMS statement for XIRR and overlap analysis", color: "bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300"   },
  { href: "/life-events",  icon: CalendarHeart, label: "Life Events", description: "Bonus, inheritance, marriage, baby — get a tailored plan", color: "bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300"   },
  { href: "/couple-planner", icon: Users2,   label: "Couple Planner", description: "Joint HRA, NPS, SIP split and tax co-ordination",         color: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"},
];

// ─── Portfolio Pulse Banner ───────────────────────────────────────────────────

function PortfolioPulseBanner({ portfolio }: { portfolio: PortfolioResponse | null }) {
  // Case 1: Not yet loaded — render nothing (avoids layout shift)
  if (portfolio === null) return null;

  const profile = portfolio.profile as Partial<UserProfile>;
  const empty   = isProfileEmpty(portfolio);

  // Case 2: No profile set up yet → CTA
  if (empty) {
    return (
      <div className="flex items-center justify-between gap-4 bg-primary/5 border border-primary/20 rounded-xl px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Set up your portfolio once — all tools auto-fill</p>
            <p className="text-xs text-muted-foreground mt-0.5">Save age, income, assets, debts and insurance in one place</p>
          </div>
        </div>
        <Link href="/profile" className="flex-shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
            Setup <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </Link>
      </div>
    );
  }

  // Case 3: Profile exists → show live stats
  const totalAssets = profile.assets
    ? Object.values(profile.assets).reduce((s, v) => s + v, 0)
    : 0;
  const income   = profile.monthly_gross_income ?? 0;
  const expenses = profile.monthly_expenses ?? 0;
  const surplus  = income - expenses;
  const city     = profile.city ?? "";

  const stats = [
    {
      icon: Wallet,
      label: "Monthly Surplus",
      value: surplus > 0 ? `₹${surplus.toLocaleString("en-IN")}` : "—",
      sub: income > 0 ? `${((surplus / income) * 100).toFixed(0)}% of income` : "",
      color: "text-green-600 dark:text-green-400",
      href: "/health-score",
    },
    {
      icon: TrendingUp,
      label: "Total Investments",
      value: totalAssets > 0
        ? totalAssets >= 1e7 ? `₹${(totalAssets / 1e7).toFixed(1)}Cr` : `₹${(totalAssets / 1e5).toFixed(1)}L`
        : "—",
      sub: "across all asset classes",
      color: "text-blue-600 dark:text-blue-400",
      href: "/fire",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">
            Portfolio Pulse{city ? ` · ${city}` : ""}
          </span>
        </div>
        <Link href="/profile" className="text-xs text-primary hover:underline">
          Edit profile
        </Link>
      </div>
      <div className="grid grid-cols-2 divide-x divide-border">
        {stats.map(({ icon: Icon, label, value, sub, color, href }) => (
          <Link key={label} href={href}
            className="flex items-center gap-3 px-5 py-4 hover:bg-muted/40 transition-colors group">
            <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted", color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={cn("text-base font-bold", color)}>{value}</p>
              {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);

  useEffect(() => {
    getPortfolio()
      .then(setPortfolio)
      .catch(() => setPortfolio({ user_id: "", profile: {}, fire: {}, health: {}, tax: {}, mf: {}, couple: {}, life_event: {} }));
  }, []);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your AI-powered financial command centre. Pick a tool to get started.
          </p>
        </div>

        {/* ── Portfolio Pulse ── */}
        <PortfolioPulseBanner portfolio={portfolio} />

        {/* ── Tool Grid ── */}
        <StaggerList>
          <StaggerItem>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.href} href={tool.href}
                    className="group bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tool.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h2 className="mt-4 text-sm font-semibold">{tool.label}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{tool.description}</p>
                  </Link>
                );
              })}
            </div>
          </StaggerItem>
        </StaggerList>
      </div>
    </AppShell>
  );
}