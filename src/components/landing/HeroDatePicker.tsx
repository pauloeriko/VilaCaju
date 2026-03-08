"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface HeroDatePickerProps {
  lang: Locale;
  dict: Dictionary["hero"];
}

export default function HeroDatePicker({ lang, dict }: HeroDatePickerProps) {
  const router = useRouter();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultOut = new Date(tomorrow);
  defaultOut.setDate(defaultOut.getDate() + 7);

  const [checkIn, setCheckIn]   = useState(tomorrow.toISOString().split("T")[0]);
  const [checkOut, setCheckOut] = useState(defaultOut.toISOString().split("T")[0]);

  function handleSearch() {
    const params = new URLSearchParams({ checkIn, checkOut });
    router.push(`/${lang}/reserver?${params.toString()}`);
  }

  return (
    <div className="mt-10 w-full max-w-xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-softer p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Check-in */}
        <label className="flex-1 flex flex-col px-3 py-2 cursor-pointer group">
          <span className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">
            {dict.checkIn}
          </span>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-white/50 shrink-0" />
            <input
              type="date"
              value={checkIn}
              min={tomorrow.toISOString().split("T")[0]}
              onChange={(e) => {
                setCheckIn(e.target.value);
                // Réajuste checkout si nécessaire
                if (e.target.value >= checkOut) {
                  const next = new Date(e.target.value);
                  next.setDate(next.getDate() + 1);
                  setCheckOut(next.toISOString().split("T")[0]);
                }
              }}
              className="bg-transparent text-white text-sm font-medium w-full outline-none [color-scheme:dark] cursor-pointer"
            />
          </div>
        </label>

        {/* Séparateur vertical */}
        <div className="hidden sm:block w-px self-stretch bg-white/20" />

        {/* Check-out */}
        <label className="flex-1 flex flex-col px-3 py-2 cursor-pointer group">
          <span className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">
            {dict.checkOut}
          </span>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-white/50 shrink-0" />
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className="bg-transparent text-white text-sm font-medium w-full outline-none [color-scheme:dark] cursor-pointer"
            />
          </div>
        </label>

        {/* CTA */}
        <button
          onClick={handleSearch}
          className={cn(
            "bg-terracotta-500 hover:bg-terracotta-600 text-white",
            "font-semibold text-sm px-5 py-3 rounded-soft",
            "flex items-center justify-center gap-2 transition-colors",
            "whitespace-nowrap shrink-0"
          )}
        >
          {dict.seePrice}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
