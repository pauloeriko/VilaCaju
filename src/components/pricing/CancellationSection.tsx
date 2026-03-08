"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";
import { cancellationPolicies } from "@/data/policies";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface CancellationSectionProps {
  lang: Locale;
  dict: Dictionary["rates"];
}

const seasonColors = {
  low:    { card: "border-ocean-200 bg-ocean-50/50",    badge: "bg-ocean-100 text-ocean-700" },
  mid:    { card: "border-sand-200 bg-sand-50",         badge: "bg-sand-100 text-sand-700" },
  high:   { card: "border-terracotta-200 bg-terracotta-50/50", badge: "bg-terracotta-100 text-terracotta-700" },
  peak:   { card: "border-charcoal-200 bg-charcoal-50", badge: "bg-charcoal-100 text-charcoal-700" },
  closed: { card: "", badge: "" },
};

function RefundIcon({ percent }: { percent: number }) {
  if (percent === 100) return <ShieldCheck className="w-4 h-4 text-ocean-500 shrink-0" />;
  if (percent > 0)     return <ShieldAlert className="w-4 h-4 text-sand-500 shrink-0" />;
  return <ShieldX className="w-4 h-4 text-terracotta-400 shrink-0" />;
}

export default function CancellationSection({ lang, dict }: CancellationSectionProps) {
  return (
    <div>
      <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800 mb-8 text-center">
        {dict.cancellationTitle}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cancellationPolicies.map((policy) => {
          const colors = seasonColors[policy.seasonType];
          return (
            <div key={policy.seasonType} className={cn("rounded-softer border-2 p-5", colors.card)}>
              <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4", colors.badge)}>
                {policy.title[lang]}
              </span>
              <ul className="space-y-2.5">
                {policy.rules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <RefundIcon percent={rule.refundPercent} />
                    <span className="text-sm text-charcoal-700/80 leading-snug">{rule.label[lang]}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
