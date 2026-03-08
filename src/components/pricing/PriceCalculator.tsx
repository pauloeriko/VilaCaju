"use client";

import React, { useState, useMemo, useEffect } from "react";
import { calculatePrice } from "@/lib/pricing/calculator";
import { formatCurrency, brlToEur } from "@/lib/utils";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

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

  return (
    <div className="card-organic p-8 3xl:p-8">
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
        <div className="border-t border-sand-200 pt-6 space-y-3">
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
        </div>
      )}
    </div>
  );
}
