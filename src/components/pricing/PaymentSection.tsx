import React from "react";
import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { paymentConditions } from "@/data/policies";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface PaymentSectionProps {
  lang: Locale;
  dict: Dictionary["rates"];
}

const seasonLabels: Record<string, Record<Locale, string>> = {
  low:  { fr: "Basse saison",        en: "Low season",    pt: "Baixa temporada"    },
  mid:  { fr: "Moyenne saison",      en: "Mid season",    pt: "Média temporada"    },
  high: { fr: "Haute saison",        en: "High season",   pt: "Alta temporada"     },
  peak: { fr: "Très Haute saison",   en: "Peak season",   pt: "Altíssima temporada"},
};

const seasonBadge: Record<string, string> = {
  low:  "bg-ocean-100 text-ocean-700",
  mid:  "bg-sand-100 text-sand-700",
  high: "bg-terracotta-100 text-terracotta-700",
  peak: "bg-charcoal-100 text-charcoal-700",
};

export default function PaymentSection({ lang, dict }: PaymentSectionProps) {
  return (
    <div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800 mb-8 text-center">
        {dict.paymentTitle}
      </h2>
      <div className="overflow-x-auto rounded-softer border border-sand-200 shadow-natural">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-sand-100 border-b border-sand-200">
              <th className="text-left py-3 px-5 font-semibold text-charcoal-700">Saison</th>
              <th className="text-center py-3 px-5 font-semibold text-charcoal-700">{dict.paymentDeposit}</th>
              <th className="text-center py-3 px-5 font-semibold text-charcoal-700">{dict.paymentBalance}</th>
            </tr>
          </thead>
          <tbody>
            {paymentConditions.map((cond, i) => (
              <tr key={cond.seasonType} className={cn("border-b border-sand-100", i % 2 === 0 ? "bg-white" : "bg-sand-50/50")}>
                <td className="py-3 px-5">
                  <span className={cn("inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold", seasonBadge[cond.seasonType])}>
                    {seasonLabels[cond.seasonType]?.[lang] ?? cond.seasonType}
                  </span>
                </td>
                <td className="py-3 px-5 text-center">
                  <span className="font-semibold text-charcoal-800">{cond.depositPercent}%</span>
                </td>
                <td className="py-3 px-5 text-center text-charcoal-700/70">
                  {cond.fullPaymentAtBooking ? (
                    <span className="inline-flex items-center gap-1.5 text-charcoal-500 text-xs">
                      <CreditCard className="w-3.5 h-3.5" />
                      {dict.paymentFull}
                    </span>
                  ) : (
                    <span>J-{cond.balanceDaysBeforeCheckin}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
