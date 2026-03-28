// frontend/src/components/profile/portfolio-wizard/step-assets.tsx
"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfile, AssetAllocation } from "@/lib/portfolio";

interface Props {
  form: UserProfile;
  onChange: (patch: Partial<UserProfile>) => void;
}

const ASSET_FIELDS: { key: keyof AssetAllocation; label: string; hint: string; emoji: string }[] = [
  { key: "equity",      label: "Equity",            hint: "Stocks, MF, ETFs",             emoji: "📈" },
  { key: "debt",        label: "Debt",               hint: "FDs, bonds, debt MF",          emoji: "🏦" },
  { key: "ppf_epf",     label: "PPF / EPF",          hint: "Provident fund balance",       emoji: "🛡" },
  { key: "gold",        label: "Gold",               hint: "Physical + Sovereign Gold Bond",emoji: "🪙" },
  { key: "real_estate", label: "Real Estate",        hint: "Market value (excl. primary home)", emoji: "🏠" },
  { key: "cash",        label: "Cash / Savings A/C", hint: "Liquid cash, savings account", emoji: "💵" },
  { key: "other",       label: "Other",              hint: "Crypto, angel, startup equity",emoji: "📦" },
];

export function StepAssets({ form, onChange }: Props) {
  const assets = form.assets;
  const total  = Object.values(assets).reduce((s, v) => s + v, 0);

  function patchAsset(key: keyof AssetAllocation, val: string) {
    onChange({ assets: { ...assets, [key]: Number(val) || 0 } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Investments & Assets</h3>
        <p className="text-xs text-muted-foreground">
          Enter current market value. Enter ₹0 for assets you don&apos;t have.
          {total > 0 && (
            <span className="ml-1 font-medium text-foreground">
              Total: ₹{total.toLocaleString("en-IN")}
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ASSET_FIELDS.map(({ key, label, hint, emoji }) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs font-medium">
              {emoji} {label}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
              <Input
                type="number" placeholder="0" className="pl-7"
                value={assets[key] === 0 ? "" : assets[key]}
                onChange={(e) => patchAsset(key, e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      {/* Mini allocation bar */}
      {total > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Portfolio Allocation</p>
          <div className="flex h-2 rounded-full overflow-hidden gap-px">
            {ASSET_FIELDS.map(({ key }, i) => {
              const colors = ["bg-indigo-500","bg-green-500","bg-amber-500","bg-yellow-400","bg-pink-500","bg-cyan-500","bg-slate-400"];
              const pct = total > 0 ? (assets[key] / total) * 100 : 0;
              return pct > 0 ? (
                <div key={key} className={`${colors[i]} transition-all duration-500`} style={{ width: `${pct}%` }} title={`${key}: ${pct.toFixed(0)}%`} />
              ) : null;
            })}
          </div>
          <div className="flex flex-wrap gap-2">
            {ASSET_FIELDS.map(({ key, label, emoji }, i) => {
              const colors = ["text-indigo-600","text-green-600","text-amber-600","text-yellow-600","text-pink-600","text-cyan-600","text-slate-500"];
              const pct = total > 0 ? (assets[key] / total) * 100 : 0;
              return pct > 0 ? (
                <span key={key} className={`text-xs ${colors[i]}`}>{emoji} {label} {pct.toFixed(0)}%</span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}