import React from "react";
import { CalendarDays } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { SeasonType } from "@/lib/pricing/types";
import { formatCurrency, brlToEur } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PeriodItem {
  dates: string;
}

interface PriceCardProps {
  title: string;
  seasonType: SeasonType;
  periods: PeriodItem[];
  pricePerNight: number;
  minStay: number;
  lang: Locale;
  perNightLabel: string;
  minStayLabel: string;
  nightsLabel: string;
}

const seasonStyles: Record<
  SeasonType,
  { card: string; badge: string; pill: string; icon: string; divider: string }
> = {
  peak: {
    card: "border-amber-400/70 bg-gradient-to-b from-amber-50 to-white",
    badge: "bg-amber-600 text-white",
    pill: "bg-amber-50 border border-amber-300 text-amber-900",
    icon: "text-amber-500",
    divider: "border-amber-200",
  },
  high: {
    card: "border-terracotta-400/60 bg-gradient-to-b from-terracotta-50 to-white",
    badge: "bg-terracotta-500 text-white",
    pill: "bg-terracotta-100 border border-terracotta-300 text-terracotta-800",
    icon: "text-terracotta-400",
    divider: "border-terracotta-200",
  },
  mid: {
    card: "border-sand-400/60 bg-gradient-to-b from-sand-100 to-white",
    badge: "bg-sand-500 text-white",
    pill: "bg-sand-100 border border-sand-300 text-sand-800",
    icon: "text-sand-400",
    divider: "border-sand-200",
  },
  low: {
    card: "border-ocean-400/60 bg-gradient-to-b from-ocean-50 to-white",
    badge: "bg-ocean-500 text-white",
    pill: "bg-ocean-50 border border-ocean-300 text-ocean-800",
    icon: "text-ocean-400",
    divider: "border-ocean-200",
  },
  closed: {
    card: "border-charcoal-400/50 bg-gradient-to-b from-charcoal-100/60 to-white",
    badge: "bg-charcoal-700 text-white",
    pill: "bg-charcoal-100 border border-charcoal-300 text-charcoal-600",
    icon: "text-charcoal-400",
    divider: "border-charcoal-300",
  },
};

const closedLabel: Record<Locale, string> = {
  fr: "Villa fermée",
  en: "Villa closed",
  pt: "Villa fechada",
};

export default function PriceCard({
  title,
  seasonType,
  periods,
  pricePerNight,
  lang,
  perNightLabel,
}: PriceCardProps) {
  const styles = seasonStyles[seasonType];
  const eurAmount = brlToEur(pricePerNight);

  return (
    <div
      className={cn(
        "rounded-softer border-2 p-6 transition-shadow hover:shadow-natural-lg flex flex-col",
        styles.card
      )}
    >
      {/* Badge saison */}
      <span
        className={cn(
          "inline-block self-start px-3 py-1 rounded-full text-xs font-semibold mb-5",
          styles.badge
        )}
      >
        {title}
      </span>

      {/* Prix — principal + conversion sur deux lignes */}
      <div className="mb-5">
        {seasonType !== "closed" ? (
          <>
            <div className="font-heading text-2xl font-bold text-charcoal-800 leading-tight">
              {formatCurrency(pricePerNight, "BRL", lang)}
              <span className="text-charcoal-700/50 text-sm font-normal ml-1">{perNightLabel}</span>
            </div>
            <div className="text-sm text-charcoal-500 mt-0.5">
              ≈ {formatCurrency(eurAmount, "EUR", lang)}
            </div>
          </>
        ) : (
          <span className="text-charcoal-700/40 text-2xl font-heading font-semibold">—</span>
        )}
      </div>

      {/* Séparateur */}
      <div className={cn("border-t mb-4", styles.divider)} />

      {/* Périodes — uniquement les dates, sans label */}
      <div className="flex flex-col gap-2">
        {seasonType !== "closed"
          ? periods.map((period, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5",
                  styles.pill
                )}
              >
                <CalendarDays className={cn("w-3.5 h-3.5 shrink-0", styles.icon)} />
                <span className="text-xs font-semibold leading-tight">{period.dates}</span>
              </div>
            ))
          : (
            <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2.5", styles.pill)}>
              <CalendarDays className={cn("w-3.5 h-3.5 shrink-0", styles.icon)} />
              <span className="text-xs font-semibold">{closedLabel[lang]}</span>
            </div>
          )}
      </div>
    </div>
  );
}
