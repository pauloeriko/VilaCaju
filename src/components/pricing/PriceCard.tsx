import React from "react";
import { CalendarDays, Moon } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { SeasonType } from "@/lib/pricing/types";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import { cn } from "@/lib/utils";

interface PeriodItem {
  dates: string;
  // Libellé optionnel affiché sous les dates (ex: "Carnaval", "Réveillon")
  label?: string;
}

interface PriceCardProps {
  title: string;
  seasonType: SeasonType;
  // Chaque période avec ses dates et un libellé optionnel
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
  minStay,
  lang,
  perNightLabel,
  minStayLabel,
  nightsLabel,
}: PriceCardProps) {
  const styles = seasonStyles[seasonType];

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

      {/* Prix + séjour minimum — même structure pour toutes les saisons */}
      <div className="mb-5">
        <div className="flex items-baseline gap-1 mb-1">
          {seasonType !== "closed" ? (
            <>
              <CurrencyDisplay amountBRL={pricePerNight} lang={lang} />
              <span className="text-charcoal-700/50 text-sm">{perNightLabel}</span>
            </>
          ) : (
            // Placeholder aligné sur la hauteur du prix pour la carte fermée
            <span className="text-charcoal-700/40 text-2xl font-heading font-semibold">—</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-charcoal-700/50 text-xs">
          <Moon className="w-3 h-3" />
          <span>
            {seasonType !== "closed"
              ? `${minStayLabel} : ${minStay} ${nightsLabel}`
              : closedLabel[lang]}
          </span>
        </div>
      </div>

      {/* Séparateur */}
      <div className={cn("border-t mb-4", styles.divider)} />

      {/* Périodes sous forme de pills */}
      <div className="flex flex-col gap-2">
        {periods.map((period, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2 rounded-lg px-3 py-2.5",
              styles.pill
            )}
          >
            <CalendarDays className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", styles.icon)} />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold leading-tight">{period.dates}</span>
              {period.label !== undefined && period.label !== "" && (
                <span className="text-xs opacity-60 leading-tight mt-0.5">{period.label}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
