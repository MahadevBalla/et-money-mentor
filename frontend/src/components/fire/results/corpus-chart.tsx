// frontend/src/components/fire/results/corpus-chart.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { YearlyProjection } from "@/lib/fire-types";

interface Props {
  projections: YearlyProjection[];
  targetAge: number;
  fiAge: number | null;
}

function formatCrore(n: number): string {
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(0)}L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function CorpusChart({ projections, targetAge, fiAge }: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (!projections || projections.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-muted/30 rounded-xl border border-border">
        <p className="text-sm text-muted-foreground">
          No projection data available
        </p>
      </div>
    );
  }

  // Chart dimensions
  const W = 600;
  const H = 280;
  const PAD = { top: 20, right: 24, bottom: 48, left: 64 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxCorpus = Math.max(...projections.map((p) => p.corpus));
  const minAge = projections[0].age;
  const maxAge = projections[projections.length - 1].age;

  function xPos(age: number) {
    return PAD.left + ((age - minAge) / Math.max(maxAge - minAge, 1)) * chartW;
  }
  function yPos(value: number) {
    return PAD.top + chartH - (value / maxCorpus) * chartH;
  }

  // Build SVG path strings
  const corpusPath = projections
    .map((p, i) =>
      `${i === 0 ? "M" : "L"}${xPos(p.age).toFixed(1)},${yPos(p.corpus).toFixed(1)}`
    )
    .join(" ");

  const investedPath = projections
    .map((p, i) =>
      `${i === 0 ? "M" : "L"}${xPos(p.age).toFixed(1)},${yPos(p.invested).toFixed(1)}`
    )
    .join(" ");

  // Area fill under corpus line
  const areaPath =
    corpusPath +
    ` L${xPos(maxAge).toFixed(1)},${(PAD.top + chartH).toFixed(1)}` +
    ` L${xPos(minAge).toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`;

  // Y-axis ticks (5 ticks)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    value: maxCorpus * f,
    y: yPos(maxCorpus * f),
  }));

  // X-axis ticks (every 5 years)
  const xTicks: number[] = [];
  for (let a = Math.ceil(minAge / 5) * 5; a <= maxAge; a += 5) {
    xTicks.push(a);
  }

  // Hover point
  const hoveredPoint = hovered !== null ? projections[hovered] : null;

  // FIRE age vertical line
  const fireAgeX = fiAge !== null ? xPos(fiAge) : null;
  const targetAgeX = xPos(targetAge);

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-6 bg-[hsl(var(--primary))] rounded" />
          <span>Projected Corpus</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-6 bg-muted-foreground/40 rounded border-t-2 border-dashed border-muted-foreground/40" />
          <span>Amount Invested</span>
        </div>
        {fiAge !== null && (
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-0.5 bg-green-500" />
            <span className="text-green-600">FI Achieved</span>
          </div>
        )}
      </div>

      {/* SVG chart */}
      <div className="relative overflow-hidden rounded-xl border border-border bg-card">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          style={{ height: "280px" }}
          onMouseLeave={() => setHovered(null)}
        >
          <defs>
            <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map(({ y }, i) => (
            <line
              key={i}
              x1={PAD.left}
              y1={y}
              x2={W - PAD.right}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {yTicks.map(({ value, y }, i) => (
            <text
              key={i}
              x={PAD.left - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="10"
              fill="hsl(var(--muted-foreground))"
            >
              {formatCrore(value)}
            </text>
          ))}

          {/* X-axis labels */}
          {xTicks.map((age) => (
            <text
              key={age}
              x={xPos(age)}
              y={H - PAD.bottom + 16}
              textAnchor="middle"
              fontSize="10"
              fill="hsl(var(--muted-foreground))"
            >
              {age}
            </text>
          ))}

          {/* X-axis "Age" label */}
          <text
            x={W / 2}
            y={H - 4}
            textAnchor="middle"
            fontSize="10"
            fill="hsl(var(--muted-foreground))"
          >
            Age
          </text>

          {/* Target FIRE age vertical line */}
          <line
            x1={targetAgeX}
            y1={PAD.top}
            x2={targetAgeX}
            y2={PAD.top + chartH}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <text
            x={targetAgeX + 3}
            y={PAD.top + 12}
            fontSize="9"
            fill="hsl(var(--muted-foreground))"
          >
            Target {targetAge}
          </text>

          {/* FI achieved vertical line */}
          {fireAgeX !== null && (
            <>
              <line
                x1={fireAgeX}
                y1={PAD.top}
                x2={fireAgeX}
                y2={PAD.top + chartH}
                stroke="#16a34a"
                strokeWidth="1.5"
                strokeDasharray="5 3"
              />
              <text
                x={fireAgeX + 3}
                y={PAD.top + 24}
                fontSize="9"
                fill="#16a34a"
              >
                FI at {fiAge?.toFixed(1)}
              </text>
            </>
          )}

          {/* Area fill under corpus */}
          <path d={areaPath} fill="url(#corpusGrad)" />

          {/* Invested line (dashed gray) */}
          <path
            d={investedPath}
            fill="none"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="1.5"
            strokeDasharray="5 4"
            opacity="0.5"
          />

          {/* Corpus line */}
          <path
            d={corpusPath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Invisible hover hit areas */}
          {projections.map((p, i) => (
            <rect
              key={i}
              x={xPos(p.age) - chartW / projections.length / 2}
              y={PAD.top}
              width={chartW / projections.length}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setHovered(i)}
              style={{ cursor: "crosshair" }}
            />
          ))}

          {/* Hover dot + tooltip */}
          {hoveredPoint && (
            <>
              <circle
                cx={xPos(hoveredPoint.age)}
                cy={yPos(hoveredPoint.corpus)}
                r="5"
                fill="hsl(var(--primary))"
              />
              <circle
                cx={xPos(hoveredPoint.age)}
                cy={yPos(hoveredPoint.invested)}
                r="4"
                fill="hsl(var(--muted-foreground))"
                opacity="0.6"
              />
              {/* Tooltip box */}
              {(() => {
                const tx = xPos(hoveredPoint.age);
                const boxW = 140;
                const boxX =
                  tx + boxW + PAD.right > W ? tx - boxW - 8 : tx + 10;
                return (
                  <g>
                    <rect
                      x={boxX}
                      y={PAD.top + 4}
                      width={boxW}
                      height={68}
                      rx="6"
                      fill="hsl(var(--card))"
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                    />
                    <text
                      x={boxX + 10}
                      y={PAD.top + 20}
                      fontSize="11"
                      fontWeight="600"
                      fill="hsl(var(--foreground))"
                    >
                      Age {hoveredPoint.age} · {hoveredPoint.year}
                    </text>
                    <text
                      x={boxX + 10}
                      y={PAD.top + 36}
                      fontSize="10"
                      fill="hsl(var(--primary))"
                    >
                      Corpus: {formatCrore(hoveredPoint.corpus)}
                    </text>
                    <text
                      x={boxX + 10}
                      y={PAD.top + 50}
                      fontSize="10"
                      fill="hsl(var(--muted-foreground))"
                    >
                      Invested: {formatCrore(hoveredPoint.invested)}
                    </text>
                    <text
                      x={boxX + 10}
                      y={PAD.top + 64}
                      fontSize="10"
                      fill="hsl(var(--muted-foreground))"
                    >
                      SIP: {formatCrore(hoveredPoint.sip)}/mo
                    </text>
                  </g>
                );
              })()}
            </>
          )}
        </svg>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Hover over the chart to see year-by-year corpus and SIP values
      </p>
    </div>
  );
}