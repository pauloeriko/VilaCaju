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

// Nouvelles saisons : plus de "très haute saison"
const seasons = [
  { key: "lowSeason" as const,  price: 5400,  colorBg: "bg-ocean-50",      colorBorder: "border-ocean-300",      colorText: "text-ocean-700"      },
  { key: "midSeason" as const,  price: 6200,  colorBg: "bg-sand-100",       colorBorder: "border-sand-300",       colorText: "text-sand-700"       },
  { key: "highSeason" as const, price: 8000,  colorBg: "bg-terracotta-50",  colorBorder: "border-terracotta-300", colorText: "text-terracotta-700" },
];

export default function PricingSection({ lang, dict }: PricingSectionProps) {
  const { currency } = useCurrency();

  return (
    <SectionWrapper className="bg-sand-50 pt-14 md:pt-16">
      {/* Titre — aligné sur les autres sections (text-4xl md:text-5xl) */}
      <div className="text-center mb-14">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-800 mb-4">
          {dict.pricing.title}
        </h2>
        <p className="text-charcoal-700/60 text-lg max-w-2xl mx-auto">
          {lang === "fr"
            ? "Tarifs par nuit, frais de ménage inclus"
            : lang === "pt"
            ? "Tarifas por noite, taxa de limpeza incluída"
            : "Per night rates, cleaning fee included"}
        </p>
      </div>

      {/* Grille des cartes — max-w-4xl pour des cartes plus larges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
        {seasons.map(({ key, price, colorBg, colorBorder, colorText }) => {
          const primaryLabel =
            currency === "EUR"
              ? formatCurrency(brlToEur(price), "EUR", lang)
              : formatCurrency(price, "BRL", lang);
          const secondaryLabel =
            currency === "EUR"
              ? formatCurrency(price, "BRL", lang)
              : `~${formatCurrency(brlToEur(price), "EUR", lang)}`;

          return (
            <div key={key} className={`rounded-softer border-2 ${colorBorder} ${colorBg} p-8 md:p-10 text-center`}>
              <p className={`text-sm font-semibold uppercase tracking-wider mb-4 ${colorText}`}>
                {dict.rates[key]}
              </p>
              <p className="font-heading text-4xl md:text-5xl font-bold text-charcoal-800">
                {primaryLabel}
              </p>
              <p className="text-charcoal-700/40 text-sm mt-2">{secondaryLabel}</p>
              <p className={`text-sm mt-2 ${colorText} opacity-70`}>{dict.pricing.perNight}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center">
        <Link
          href={`/${lang}/tarifs`}
          className="inline-flex items-center gap-2 text-terracotta-600 hover:text-terracotta-700 font-semibold text-base transition-colors"
        >
          {dict.pricing.seeAllRates}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </SectionWrapper>
  );
}
