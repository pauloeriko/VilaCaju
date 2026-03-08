"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import { formatCurrency, brlToEur } from "@/lib/utils";

interface PricingSectionProps {
  lang: Locale;
  dict: { pricing: Dictionary["pricing"]; rates: Dictionary["rates"] };
}

const seasons = [
  { key: "lowSeason" as const,  price: 4400,  colorBg: "bg-ocean-50",      colorBorder: "border-ocean-300",      colorText: "text-ocean-700"      },
  { key: "midSeason" as const,  price: 3000,  colorBg: "bg-sand-100",       colorBorder: "border-sand-300",       colorText: "text-sand-700"       },
  { key: "highSeason" as const, price: 5200,  colorBg: "bg-terracotta-50",  colorBorder: "border-terracotta-300", colorText: "text-terracotta-700" },
  { key: "peakSeason" as const, price: 8000,  colorBg: "bg-amber-50",       colorBorder: "border-amber-300",      colorText: "text-amber-700"      },
];

export default function PricingSection({ lang, dict }: PricingSectionProps) {
  const { currency } = useCurrency();

  return (
    <SectionWrapper className="bg-sand-50">
      <div className="text-center mb-10">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-3">
          {dict.pricing.title}
        </h2>
        <p className="text-charcoal-700/60 text-base max-w-xl mx-auto">
          {lang === "fr"
            ? "Tarifs par nuit, frais de ménage inclus"
            : lang === "pt"
            ? "Tarifas por noite, taxa de limpeza incluída"
            : "Per night rates, cleaning fee included"}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {seasons.map(({ key, price, colorBg, colorBorder, colorText }) => {
          // Devise principale selon le choix utilisateur
          const primaryLabel =
            currency === "EUR"
              ? formatCurrency(brlToEur(price), "EUR", lang)
              : formatCurrency(price, "BRL", lang);
          const secondaryLabel =
            currency === "EUR"
              ? formatCurrency(price, "BRL", lang)
              : `~${formatCurrency(brlToEur(price), "EUR", lang)}`;

          return (
            <div key={key} className={`rounded-softer border-2 ${colorBorder} ${colorBg} p-5 text-center`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${colorText}`}>
                {dict.rates[key]}
              </p>
              <p className="font-heading text-2xl font-bold text-charcoal-800">
                {primaryLabel}
              </p>
              <p className="text-charcoal-700/40 text-xs mt-1">
                {secondaryLabel}
              </p>
              <p className={`text-xs mt-1 ${colorText} opacity-70`}>{dict.pricing.perNight}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link
          href={`/${lang}/tarifs`}
          className="inline-flex items-center gap-2 text-terracotta-600 hover:text-terracotta-700 font-semibold text-sm transition-colors"
        >
          {dict.pricing.seeAllRates}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </SectionWrapper>
  );
}
