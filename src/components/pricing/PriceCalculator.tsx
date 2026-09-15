"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ShieldX, AlertTriangle } from "lucide-react";
import { calculatePrice } from "@/lib/pricing";
import { formatCurrency, brlToEur } from "@/lib/utils";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import { pricingConfig } from "@/lib/pricing/seasons";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Season, SeasonName } from "@/lib/supabase/types";

// Labels localisés pour les noms de saison Supabase
const SEASON_LABELS: Record<SeasonName, Record<Locale, string>> = {
  low:    { fr: "Basse saison",      en: "Low season",   pt: "Baixa temporada"       },
  mid:    { fr: "Moyenne saison",    en: "Mid season",   pt: "Média temporada"       },
  high:   { fr: "Haute saison",      en: "High season",  pt: "Alta temporada"        },
  peak:   { fr: "Très haute saison", en: "Peak season",  pt: "Alta temporada (pico)" },
  closed: { fr: "Fermeture",         en: "Closed",       pt: "Fechado"               },
};

interface PriceCalculatorProps {
  lang: Locale;
  dict: Dictionary["rates"];
  seasons: Season[];
  cleaningFee: number;
  blockedDates?: string[];
  externalCheckIn?: string | null;
  externalCheckOut?: string | null;
}

function toLocalStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function rangeHasBlocked(checkIn: string, checkOut: string, blocked: Set<string>): boolean {
  const current = parseLocal(checkIn);
  const end     = parseLocal(checkOut);
  while (current < end) {
    const key = toLocalStr(current);
    if (blocked.has(key)) return true;
    current.setDate(current.getDate() + 1);
  }
  return false;
}

export default function PriceCalculator({
  lang, dict, seasons, cleaningFee, blockedDates = [], externalCheckIn, externalCheckOut,
}: PriceCalculatorProps) {
  const { currency, eurRate } = useCurrency();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [checkIn,  setCheckIn]  = useState(toLocalStr(tomorrow));
  const [checkOut, setCheckOut] = useState(toLocalStr(dayAfter));

  useEffect(() => { if (externalCheckIn)  setCheckIn(externalCheckIn);  }, [externalCheckIn]);
  useEffect(() => { if (externalCheckOut) setCheckOut(externalCheckOut); }, [externalCheckOut]);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  const priceResult = useMemo(() => {
    if (!checkIn || !checkOut || seasons.length === 0) return null;
    const ci = parseLocal(checkIn);
    const co = parseLocal(checkOut);
    if (co <= ci) return null;
    return calculatePrice(ci, co, seasons, cleaningFee);
  }, [checkIn, checkOut, seasons, cleaningFee]);

  const nightsCount = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(0, Math.round(
      (parseLocal(checkOut).getTime() - parseLocal(checkIn).getTime()) / (1000 * 60 * 60 * 24)
    ));
  }, [checkIn, checkOut]);

  const minNights    = priceResult?.minNights ?? pricingConfig.seasons[0]?.minStay ?? 3;
  const isBlocked    = useMemo(() => {
    if (!checkIn || !checkOut || parseLocal(checkOut) <= parseLocal(checkIn)) return false;
    return rangeHasBlocked(checkIn, checkOut, blockedSet);
  }, [checkIn, checkOut, blockedSet]);
  const isSeasonClosed  = priceResult?.season.name === "closed";
  const minStayWarning  = nightsCount > 0 && nightsCount < minNights;

  const fmt = (brl: number) =>
    currency === "EUR"
      ? formatCurrency(brlToEur(brl, eurRate), "EUR", lang)
      : formatCurrency(brl, "BRL", lang);

  const fmtSecondary = (brl: number) =>
    currency === "EUR"
      ? formatCurrency(brl, "BRL", lang)
      : `${dict.indicativeEur} ${formatCurrency(brlToEur(brl, eurRate), "EUR", lang)}`;

  return (
    <div className="card-organic p-8 flex flex-col h-full">
      <h3 className="font-heading text-2xl font-bold text-charcoal-800 mb-6">
        {dict.calculatorTitle}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={toLocalStr(tomorrow)}
            className="w-full px-4 py-3 border border-sand-300 rounded-soft bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn}
            className="w-full px-4 py-3 border border-sand-300 rounded-soft bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400 transition-colors"
          />
        </div>
      </div>

      {/* Alertes */}
      {minStayWarning && !isBlocked && !isSeasonClosed && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-soft px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 font-medium">
            {lang === "fr" ? `Séjour minimum de ${minNights} nuits requis`
              : lang === "pt" ? `Estadia mínima de ${minNights} noites necessária`
              : `Minimum stay of ${minNights} nights required`}
          </p>
        </div>
      )}

      {isSeasonClosed && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">
            {lang === "fr" ? "La villa est fermée à cette période."
              : lang === "pt" ? "A villa está fechada neste período."
              : "The villa is closed during this period."}
          </p>
        </div>
      )}

      {isBlocked && !isSeasonClosed && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">
            {lang === "fr" ? "Cette période contient des dates déjà réservées."
              : lang === "pt" ? "Este período contém datas já reservadas."
              : "This period contains already booked dates."}
          </p>
        </div>
      )}

      {/* Récapitulatif de prix */}
      {priceResult && !isSeasonClosed && !isBlocked && !minStayWarning && (
        <div className="border-t border-sand-200 pt-6 space-y-3 flex-1">
          <div className="flex justify-between text-sm text-charcoal-700">
            <span>
              {SEASON_LABELS[priceResult.season.name][lang]} — {priceResult.nights} {dict.nights}
            </span>
            <span className="font-medium">
              {fmt(priceResult.pricePerNight * priceResult.nights)}
            </span>
          </div>

          <div className="flex justify-between text-sm text-charcoal-700">
            <span>{dict.cleaningFee}</span>
            <span className="font-medium">
              {fmt(priceResult.totalPrice - priceResult.pricePerNight * priceResult.nights)}
            </span>
          </div>

          <div className="flex justify-between text-lg font-bold text-charcoal-800 pt-3 border-t border-sand-200">
            <span>Total</span>
            <div className="text-right">
              <div>{fmt(priceResult.totalPrice)}</div>
              <div className="text-sm font-normal text-sand-500">
                {fmtSecondary(priceResult.totalPrice)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Politique d'annulation */}
      <div className="border-t border-sand-200 pt-4 mt-4">
        <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
          {lang === "fr" ? "Politique d'annulation"
            : lang === "pt" ? "Política de cancelamento"
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
      {checkIn && checkOut && !minStayWarning && !isBlocked && !isSeasonClosed && (
        <div className="mt-auto pt-6">
          <Link
            href={`/${lang}/reserver?checkIn=${checkIn}&checkOut=${checkOut}`}
            className="block w-full text-center bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold px-5 py-3 rounded-soft transition-colors shadow-natural hover:shadow-natural-lg"
          >
            {lang === "fr" ? "Réserver ces dates"
              : lang === "pt" ? "Reservar essas datas"
              : "Book these dates"}
          </Link>
        </div>
      )}
    </div>
  );
}
