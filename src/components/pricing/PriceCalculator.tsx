"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ShieldX, AlertTriangle } from "lucide-react";
import { calculatePrice } from "@/lib/pricing/calculator";
import { formatCurrency, brlToEur } from "@/lib/utils";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import { pricingConfig } from "@/lib/pricing/seasons";
import { rangeContainsUnavailable } from "@/lib/pricing/availability";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const MIN_NIGHTS = 3;

// ─────────────────────────────────────────────────────────────────────────────
interface PriceCalculatorProps {
  lang: Locale;
  dict: Dictionary["rates"];
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

  const nightsCount = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    return Math.max(0, Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const minStayWarning = nightsCount > 0 && nightsCount < MIN_NIGHTS;

  // Validation : la plage ne doit pas chevaucher des dates occupées / fermeture
  const rangeError = useMemo(() => {
    if (!checkIn || !checkOut) return false;
    const ci = new Date(checkIn);
    const co = new Date(checkOut);
    if (co <= ci) return false;
    return rangeContainsUnavailable(checkIn, checkOut);
  }, [checkIn, checkOut]);

  const minStayLabel =
    lang === "fr"
      ? `Séjour minimum de ${MIN_NIGHTS} nuits requis`
      : lang === "pt"
      ? `Estadia mínima de ${MIN_NIGHTS} noites necessária`
      : `Minimum stay of ${MIN_NIGHTS} nights required`;

  const rangeErrorLabel =
    lang === "fr"
      ? "Cette période contient des dates déjà réservées ou en fermeture annuelle."
      : lang === "pt"
      ? "Este período contém datas já reservadas ou em fechamento anual."
      : "This period contains already booked or closed dates.";

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

      {/* Alerte séjour minimum */}
      {minStayWarning && !rangeError && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-soft px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 font-medium">{minStayLabel}</p>
        </div>
      )}

      {/* Alerte dates non disponibles */}
      {rangeError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{rangeErrorLabel}</p>
        </div>
      )}

      {breakdown && !minStayWarning && !rangeError && (
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
        </div>
      )}

      {/* Politique d'annulation */}
      <div className="border-t border-sand-200 pt-4 mt-4">
        <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
          {lang === "fr"
            ? "Politique d'annulation"
            : lang === "pt"
            ? "Política de cancelamento"
            : "Cancellation policy"}
        </p>
        <div className="flex items-start gap-1.5">
          <ShieldX className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
          <span className="text-xs text-charcoal-700/80">
            {lang === "fr"
              ? "Les séjours sont fermes et définitifs — aucun remboursement en cas d'annulation."
              : lang === "pt"
              ? "As reservas são firmes e definitivas — sem reembolso em caso de cancelamento."
              : "Bookings are firm and final — no refund in case of cancellation."}
          </span>
        </div>
      </div>

      {/* CTA réservation */}
      {checkIn && checkOut && !minStayWarning && !rangeError && (
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
