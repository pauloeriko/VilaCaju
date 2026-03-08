"use client";

import React from "react";
import type { Locale } from "@/lib/i18n/config";
import { formatCurrency, brlToEur } from "@/lib/utils";
import { useCurrency } from "@/lib/currency/CurrencyContext";

interface CurrencyDisplayProps {
  amountBRL: number;
  showEUR?: boolean;
  lang: Locale;
  className?: string;
  eurLabel?: string;
}

export default function CurrencyDisplay({
  amountBRL,
  showEUR = true,
  lang,
  className,
  eurLabel,
}: CurrencyDisplayProps) {
  const { currency } = useCurrency();
  const eurAmount = brlToEur(amountBRL);
  const label = eurLabel || (lang === "fr" ? "soit ~" : lang === "pt" ? "~" : "~");

  // Si la devise active est EUR, on affiche EUR en principal et BRL en secondaire
  if (currency === "EUR") {
    return (
      <span className={className}>
        <span className="font-semibold">{formatCurrency(eurAmount, "EUR", lang)}</span>
        {showEUR && (
          <span className="text-sand-500 text-sm ml-2">
            ({label}{formatCurrency(amountBRL, "BRL", lang)})
          </span>
        )}
      </span>
    );
  }

  // Devise par défaut : BRL principal, EUR indicatif
  return (
    <span className={className}>
      <span className="font-semibold">{formatCurrency(amountBRL, "BRL", lang)}</span>
      {showEUR && (
        <span className="text-sand-500 text-sm ml-2">
          ({label}{formatCurrency(eurAmount, "EUR", lang)})
        </span>
      )}
    </span>
  );
}
