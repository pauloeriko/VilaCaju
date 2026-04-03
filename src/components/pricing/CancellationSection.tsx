"use client";

import React from "react";
import { ShieldX, AlertCircle } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface CancellationSectionProps {
  lang: Locale;
  dict: Dictionary["rates"];
}

const content: Record<Locale, { firm: string; noRefund: string; insurance: string }> = {
  fr: {
    firm: "Les séjours réservés sont fermes et définitifs.",
    noRefund: "En cas d'annulation, les montants versés ne pourront donner lieu à remboursement.",
    insurance: "Nous vous recommandons vivement de souscrire une assurance voyage couvrant les imprévus.",
  },
  en: {
    firm: "All bookings are firm and final.",
    noRefund: "In case of cancellation, amounts paid cannot be refunded.",
    insurance: "We strongly recommend purchasing travel insurance to cover unforeseen events.",
  },
  pt: {
    firm: "As reservas efetuadas são firmes e definitivas.",
    noRefund: "Em caso de cancelamento, os montantes pagos não poderão ser reembolsados.",
    insurance: "Recomendamos vivamente a contratação de um seguro viagem que cubra imprevistos.",
  },
};

export default function CancellationSection({ lang, dict }: CancellationSectionProps) {
  const t = content[lang];
  return (
    <div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800 mb-8 text-center">
        {dict.cancellationTitle}
      </h2>
      <div className="max-w-2xl mx-auto">
        <div className="rounded-softer border-2 border-terracotta-200 bg-terracotta-50/50 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <ShieldX className="w-5 h-5 text-terracotta-500 shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-sm text-charcoal-700/80 leading-relaxed">
              <p className="font-semibold text-charcoal-800">{t.firm}</p>
              <p>{t.noRefund}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 border-t border-terracotta-200 pt-4">
            <AlertCircle className="w-5 h-5 text-sand-500 shrink-0 mt-0.5" />
            <p className="text-sm text-charcoal-700/80 leading-relaxed italic">{t.insurance}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
