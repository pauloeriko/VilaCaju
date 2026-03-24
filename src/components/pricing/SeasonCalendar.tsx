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
  fr: ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  pt: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"],
};

// Nouvelles saisons :
// Haute (8000R$) : 16 Déc – Fin Fév
// Moyenne (6200R$) : Juil + Août + 16 Oct – 15 Déc
// Basse (5400R$) : Juin + 1 Sep – 15 Oct
// Fermeture : 1 Mar – 31 Mai
const monthSeasons: (
  | "high"
  | "mid"
  | "low"
  | "closed"
  | "mixed"
)[] = [
  "high",    // Jan  : haute saison
  "high",    // Fév  : haute saison
  "closed",  // Mar  : fermeture
  "closed",  // Avr  : fermeture
  "closed",  // Mai  : fermeture
  "low",     // Jun  : basse saison
  "mid",     // Jul  : moyenne saison
  "mid",     // Aoû  : moyenne saison
  "low",     // Sep  : basse saison (Sep 1 – Oct 15)
  "mixed",   // Oct  : basse (1-15) + moyenne (16-31)
  "mid",     // Nov  : moyenne saison
  "mixed",   // Déc  : moyenne (1-15) + haute (16-31)
];

const seasonStyles: Record<string, string> = {
  high:   "bg-terracotta-400 text-white",
  mid:    "bg-sand-400 text-white",
  low:    "bg-ocean-400 text-white",
  closed: "bg-charcoal-800 text-white",
  mixed:  "bg-gradient-to-r from-ocean-300 via-sand-300 to-terracotta-300 text-charcoal-800",
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

      {/* Légende */}
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
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-charcoal-800" />
          <span className="text-charcoal-700/70">{closedLabel}</span>
        </div>
      </div>
    </div>
  );
}
