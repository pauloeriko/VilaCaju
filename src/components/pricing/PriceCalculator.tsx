"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { calculatePrice } from "@/lib/pricing/calculator";
import { formatCurrency, brlToEur } from "@/lib/utils";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import { cancellationPolicies, type CancellationPolicy } from "@/data/policies";
import { pricingConfig } from "@/lib/pricing/seasons";
import type { SeasonType } from "@/lib/pricing/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// ─── Politique d'annulation dominante ────────────────────────────────────────
const SEVERITY: Record<SeasonType, number> = { peak: 4, high: 3, mid: 2, low: 1, closed: 0 };

function getDominantPolicy(checkIn: string, checkOut: string): CancellationPolicy | null {
  if (!checkIn || !checkOut) return null;
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  if (co <= ci) return null;

  let dominant: SeasonType | null = null;
  const current = new Date(ci);

  while (current < co) {
    const month = current.getMonth() + 1;
    const day = current.getDate();
    for (const season of pricingConfig.seasons) {
      const { startMonth, startDay, endMonth, endDay, type } = season;
      let matches = false;
      if (startMonth <= endMonth) {
        matches =
          (month > startMonth || (month === startMonth && day >= startDay)) &&
          (month < endMonth   || (month === endMonth   && day <= endDay));
      } else {
        matches =
          month > startMonth || (month === startMonth && day >= startDay) ||
          month < endMonth   || (month === endMonth   && day <= endDay);
      }
      if (matches) {
        if (dominant === null || SEVERITY[type] > SEVERITY[dominant]) dominant = type;
        break;
      }
    }
    current.setDate(current.getDate() + 1);
  }

  if (!dominant || dominant === "closed") return null;
  return cancellationPolicies.find((p) => p.seasonType === dominant) ?? null;
}

const POLICY_ICON: Record<string, React.ReactNode> = {
  low:  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
  mid:  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
  high: <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
  peak: <ShieldX    className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
};

// ─────────────────────────────────────────────────────────────────────────────
interface PriceCalculatorProps {
  lang: Locale;
  dict: Dictionary["rates"];
  // Dates injectées depuis le calendrier de disponibilité
  externalCheckIn?: string | null;
  externalCheckOut?: string | null;
}

export default function PriceCalculator({
  lang,
  dict,
  externalCheckIn,
  externalCheckOut,
}: PriceCalculatorProps) {
  const { currency } = useCurrency();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(dayAfter.toISOString().split("T")[0]);

  // Mise à jour depuis le calendrier externe
  useEffect(() => {
    if (externalCheckIn) setCheckIn(externalCheckIn);
  }, [externalCheckIn]);

  useEffect(() => {
    if (externalCheckOut) setCheckOut(externalCheckOut);
  }, [externalCheckOut]);

  const breakdown = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (co <= ci) return null;
    return calculatePrice(ci, co, lang);
  }, [checkIn, checkOut, lang]);

  const applicablePolicy = useMemo(
    () => getDominantPolicy(checkIn, checkOut),
    [checkIn, checkOut]
  );

  return (
    <div className="card-organic p-8 flex flex-col h-full">
      <h3 className="font-heading text-2xl font-bold text-charcoal-800 mb-6">
        {dict.calculatorTitle}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={tomorrow.toISOString().split("T")[0]}
            className="w-full px-4 py-3 border border-sand-300 rounded-soft bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn}
            className="w-full px-4 py-3 border border-sand-300 rounded-soft bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400 transition-colors"
          />
        </div>
      </div>

      {breakdown && (
        <div className="border-t border-sand-200 pt-6 space-y-3 flex-1">
          {breakdown.hasClosedDays && (
            <p className="text-sm text-red-500 font-medium">
              {lang === "fr"
                ? "Attention : certains jours tombent pendant la fermeture annuelle."
                : lang === "pt"
                ? "Atenção: alguns dias coincidem com o fechamento anual."
                : "Warning: some days fall during the annual closure period."}
            </p>
          )}

          {breakdown.nightlyBreakdown.map((item, i) => {
            const subtotalLabel =
              currency === "EUR"
                ? formatCurrency(brlToEur(item.subtotal), "EUR", lang)
                : formatCurrency(item.subtotal, "BRL", lang);
            return (
              <div key={i} className="flex justify-between text-sm text-charcoal-700">
                <span>
                  {item.label} &mdash; {item.nights} {dict.nights}
                </span>
                <span className="font-medium">{subtotalLabel}</span>
              </div>
            );
          })}

          <div className="flex justify-between text-sm text-charcoal-700/70">
            <span>{dict.cleaningFee}</span>
            <span>
              {currency === "EUR"
                ? formatCurrency(brlToEur(breakdown.cleaningFee), "EUR", lang)
                : formatCurrency(breakdown.cleaningFee, "BRL", lang)}
            </span>
          </div>

          <div className="flex justify-between text-lg font-bold text-charcoal-800 pt-3 border-t border-sand-200">
            <span>Total</span>
            <div className="text-right">
              <div>
                {currency === "EUR"
                  ? formatCurrency(breakdown.totalEUR, "EUR", lang)
                  : formatCurrency(breakdown.total, "BRL", lang)}
              </div>
              <div className="text-sm font-normal text-sand-500">
                {currency === "EUR"
                  ? formatCurrency(breakdown.total, "BRL", lang)
                  : `${dict.indicativeEur} ${formatCurrency(breakdown.totalEUR, "EUR", lang)}`}
              </div>
            </div>
          </div>

          {/* Politique d'annulation applicable */}
          {applicablePolicy && (
            <div className="border-t border-sand-200 pt-4 mt-2">
              <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                {lang === "fr"
                  ? "Politique d'annulation applicable"
                  : lang === "pt"
                  ? "Política de cancelamento aplicável"
                  : "Applicable cancellation policy"}
              </p>
              <div className="space-y-1.5">
                {applicablePolicy.rules.map((rule, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    {POLICY_ICON[applicablePolicy.seasonType]}
                    <span className="text-xs text-charcoal-700/80">
                      {rule.label[lang]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA réservation — ancré en bas de la carte */}
      {checkIn && checkOut && (
        <div className="mt-auto pt-6">
          <Link
            href={`/${lang}/reserver?checkIn=${checkIn}&checkOut=${checkOut}`}
            className="block w-full text-center bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold px-5 py-3 rounded-soft transition-colors shadow-natural hover:shadow-natural-lg"
          >
            {lang === "fr"
              ? "Réserver ces dates"
              : lang === "pt"
              ? "Reservar essas datas"
              : "Book these dates"}
          </Link>
        </div>
      )}
    </div>
  );
}
