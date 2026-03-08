"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

interface SeasonCalendarProps {
  lang: Locale;
  highLabel: string;
  midLabel: string;
  lowLabel: string;
  closedLabel: string;
}

const months: Record<Locale, string[]> = {
  fr: ["Jan", "F\u00e9v", "Mar", "Avr", "Mai", "Jun", "Jul", "Ao\u00fb", "Sep", "Oct", "Nov", "D\u00e9c"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  pt: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
};

// Simplified month-level color mapping
const monthSeasons: (
  | "high"
  | "mid"
  | "low"
  | "closed"
  | "mixed"
)[] = [
  "mixed",   // Jan: high(1-10) + mid(11-31)
  "mixed",   // Feb: mid(1-9) + high(10-25) + low(26-28)
  "low",     // Mar
  "low",     // Apr
  "low",     // May
  "mid",     // Jun
  "high",    // Jul
  "low",     // Aug
  "low",     // Sep
  "low",     // Oct
  "low",     // Nov
  "mixed",   // Dec: closed(1-19) + high(20-31)
];

const seasonStyles: Record<string, string> = {
  high: "bg-terracotta-400 text-white",
  mid: "bg-sand-400 text-white",
  low: "bg-ocean-400 text-white",
  closed: "bg-charcoal-700 text-white",
  mixed:
    "bg-gradient-to-r from-terracotta-300 via-sand-300 to-ocean-300 text-charcoal-800",
};

export default function SeasonCalendar({
  lang,
  highLabel,
  midLabel,
  lowLabel,
  closedLabel,
}: SeasonCalendarProps) {
  return (
    <div>
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 mb-6">
        {months[lang].map((month, index) => (
          <div
            key={month}
            className={cn(
              "rounded-soft p-3 text-center text-sm font-medium transition-transform hover:scale-105",
              seasonStyles[monthSeasons[index]]
            )}
          >
            {month}
          </div>
        ))}
      </div>

      {/* Legend — sans fermeture annuelle */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-terracotta-400" />
          <span className="text-charcoal-700/70">{highLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-sand-400" />
          <span className="text-charcoal-700/70">{midLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-ocean-400" />
          <span className="text-charcoal-700/70">{lowLabel}</span>
        </div>
      </div>
    </div>
  );
}
