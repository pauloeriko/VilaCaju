import React from "react";
import { CreditCard, Clock } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface PaymentSectionProps {
  lang: Locale;
  dict: Dictionary["rates"];
}

export default function PaymentSection({ lang: _lang, dict }: PaymentSectionProps) {
  return (
    <div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800 mb-8 text-center">
        {dict.paymentTitle}
      </h2>
      <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="rounded-softer border-2 border-ocean-200 bg-ocean-50/50 p-6 flex items-start gap-4">
          <CreditCard className="w-6 h-6 text-ocean-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-ocean-700 uppercase tracking-wider mb-1">
              {dict.paymentDeposit}
            </p>
            <p className="font-heading text-4xl font-bold text-charcoal-800">30%</p>
          </div>
        </div>
        <div className="rounded-softer border-2 border-sand-200 bg-sand-50 p-6 flex items-start gap-4">
          <Clock className="w-6 h-6 text-sand-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-sand-700 uppercase tracking-wider mb-1">
              {dict.paymentBalance}
            </p>
            <p className="font-heading text-4xl font-bold text-charcoal-800">J-45</p>
          </div>
        </div>
      </div>
    </div>
  );
}
