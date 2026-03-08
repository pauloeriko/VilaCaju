"use client";

import React from "react";
import { useCurrency, type Currency } from "@/lib/currency/CurrencyContext";
import { cn } from "@/lib/utils";

interface CurrencySwitcherProps {
  scrolled: boolean;
}

const options: Currency[] = ["BRL", "EUR"];

export default function CurrencySwitcher({ scrolled }: CurrencySwitcherProps) {
  const { currency, setCurrency } = useCurrency();

  return (
    <div className="flex items-center gap-0.5 rounded-soft border px-1 py-0.5 transition-colors"
      style={{ borderColor: scrolled ? "rgb(var(--color-sand-300))" : "rgba(255,255,255,0.3)" }}
    >
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => setCurrency(opt)}
          className={cn(
            "px-2 py-0.5 text-xs font-semibold rounded transition-all",
            opt === currency
              ? scrolled
                ? "bg-terracotta-500 text-white"
                : "bg-white/20 text-white"
              : scrolled
              ? "text-charcoal-600 hover:text-terracotta-500"
              : "text-white/60 hover:text-white"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
