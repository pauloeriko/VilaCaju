"use client";

import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { pricingConfig } from "@/lib/pricing/seasons";
import type { SeasonType } from "@/lib/pricing/types";
import type { Locale } from "@/lib/i18n/config";

// ─── Réservations simulées (à remplacer par une API Supabase) ───────────────
const BOOKED_DATES = new Set<string>([
  "2026-03-10", "2026-03-11", "2026-03-12", "2026-03-13", "2026-03-14",
  "2026-03-15", "2026-03-16", "2026-03-17",
  "2026-04-05", "2026-04-06", "2026-04-07", "2026-04-08", "2026-04-09",
  "2026-04-10", "2026-04-11", "2026-04-12", "2026-04-13",
  "2026-07-10", "2026-07-11", "2026-07-12", "2026-07-13", "2026-07-14",
  "2026-07-15", "2026-07-16", "2026-07-17", "2026-07-18", "2026-07-19",
  "2026-07-20", "2026-07-21", "2026-07-22",
]);

// ─── Helpers ────────────────────────────────────────────────────────────────
function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getSeasonForDay(month: number, day: number): SeasonType | null {
  for (const season of pricingConfig.seasons) {
    const { startMonth, startDay, endMonth, endDay } = season;
    if (startMonth <= endMonth) {
      if (
        (month > startMonth || (month === startMonth && day >= startDay)) &&
        (month < endMonth   || (month === endMonth   && day <= endDay))
      ) return season.type;
    } else {
      if (
        month > startMonth  || (month === startMonth && day >= startDay) ||
        month < endMonth    || (month === endMonth   && day <= endDay)
      ) return season.type;
    }
  }
  return null;
}

// ─── Localisation ────────────────────────────────────────────────────────────
const MONTH_NAMES: Record<Locale, string[]> = {
  fr: ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
  en: ["January","February","March","April","May","June","July","August","September","October","November","December"],
  pt: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"],
};

const DAY_NAMES: Record<Locale, string[]> = {
  fr: ["Lu","Ma","Me","Je","Ve","Sa","Di"],
  en: ["Mo","Tu","We","Th","Fr","Sa","Su"],
  pt: ["Se","Te","Qu","Qu","Se","Sá","Do"],
};

const LABELS: Record<Locale, {
  booked: string; title: string;
  selectCheckIn: string; selectCheckOut: string; clear: string; selected: string;
}> = {
  fr: {
    booked: "Occupé", title: "Calendrier de disponibilité",
    selectCheckIn: "Sélectionnez une date d'arrivée",
    selectCheckOut: "Sélectionnez une date de départ",
    clear: "Réinitialiser", selected: "Sélectionné",
  },
  en: {
    booked: "Occupied", title: "Availability calendar",
    selectCheckIn: "Select check-in date",
    selectCheckOut: "Select check-out date",
    clear: "Clear", selected: "Selected",
  },
  pt: {
    booked: "Ocupado", title: "Calendário de disponibilidade",
    selectCheckIn: "Selecione a data de chegada",
    selectCheckOut: "Selecione a data de saída",
    clear: "Limpar", selected: "Selecionado",
  },
};

// ─── Composant MonthGrid ─────────────────────────────────────────────────────
interface MonthGridProps {
  year: number;
  month: number;
  lang: Locale;
  checkIn: string | null;
  checkOut: string | null;
  hoverDate: string | null;
  onDayClick: (key: string) => void;
  onDayHover: (key: string | null) => void;
}

function MonthGrid({
  year, month, lang, checkIn, checkOut, hoverDate, onDayClick, onDayHover,
}: MonthGridProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rangeEnd = checkOut ?? hoverDate;

  function isInRange(key: string): boolean {
    if (!checkIn || !rangeEnd) return false;
    const [s, e] = checkIn < rangeEnd ? [checkIn, rangeEnd] : [rangeEnd, checkIn];
    return key > s && key < e;
  }

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDow; i++) {
    cells.push(<div key={`e-${i}`} />);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    dateObj.setHours(0, 0, 0, 0);
    const key = toKey(year, month, d);
    const season = getSeasonForDay(month, d);
    const isPast = dateObj < today;
    const isClosed = season === "closed";
    const isBooked = BOOKED_DATES.has(key);
    const isUnavailable = isClosed || isBooked || isPast;
    const isCheckIn = key === checkIn;
    const isCheckOut = key === checkOut;
    const inRange = isInRange(key);

    // Calcul du className par branche exclusive pour éviter les conflits Tailwind
    const baseClass = "relative flex items-center justify-center rounded-lg text-sm font-medium h-12 w-full select-none transition-colors";
    let stateClass: string;
    if (isCheckIn || isCheckOut) {
      stateClass = "bg-terracotta-500 text-white font-bold cursor-pointer";
    } else if (inRange) {
      stateClass = "bg-terracotta-100 text-terracotta-800 cursor-pointer";
    } else if (isPast) {
      stateClass = "text-charcoal-200 cursor-not-allowed";
    } else if (isUnavailable) {
      // Occupé ou fermé : fond gris explicite + texte barré
      stateClass = "bg-charcoal-100 text-charcoal-400 line-through cursor-not-allowed";
    } else {
      stateClass = "text-charcoal-700 hover:bg-sand-100 cursor-pointer";
    }

    cells.push(
      <button
        key={d}
        type="button"
        disabled={isUnavailable}
        onClick={() => !isUnavailable && onDayClick(key)}
        onMouseEnter={() => !isUnavailable && onDayHover(key)}
        onMouseLeave={() => onDayHover(null)}
        className={`${baseClass} ${stateClass}`}
        aria-label={key}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="w-full">
      {/* Nom du mois */}
      <div className="text-center font-semibold text-charcoal-700 text-base mb-4">
        {MONTH_NAMES[lang][month - 1]} {year}
      </div>
      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {DAY_NAMES[lang].map((d, i) => (
          <div key={i} className="text-center text-xs text-charcoal-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>
      {/* Cases jours */}
      <div className="grid grid-cols-7 gap-1.5">{cells}</div>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────
interface AvailabilityCalendarProps {
  lang: Locale;
  onDatesChange?: (checkIn: string, checkOut: string) => void;
  initialCheckIn?: string | null;
  initialCheckOut?: string | null;
}

const TOTAL_MONTHS = 12;

export default function AvailabilityCalendar({ lang, onDatesChange, initialCheckIn, initialCheckOut }: AvailabilityCalendarProps) {
  const now = new Date();

  // Naviguer directement vers le mois de la date d'arrivée si elle est fournie
  const initialOffset = (() => {
    if (!initialCheckIn) return 0;
    const ci = new Date(initialCheckIn);
    const diff = (ci.getFullYear() - now.getFullYear()) * 12 + (ci.getMonth() - now.getMonth());
    return Math.max(0, Math.min(diff, TOTAL_MONTHS - 1));
  })();

  const [offset, setOffset] = useState(initialOffset);
  const [checkIn, setCheckIn] = useState<string | null>(initialCheckIn ?? null);
  const [checkOut, setCheckOut] = useState<string | null>(initialCheckOut ?? null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const labels = LABELS[lang];

  const months: Array<{ year: number; month: number }> = [];
  for (let i = 0; i < TOTAL_MONTHS; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  const currentMonth = months[offset];

  const handleDayClick = useCallback((key: string) => {
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(key);
      setCheckOut(null);
    } else {
      if (key <= checkIn) {
        setCheckIn(key);
        setCheckOut(null);
      } else {
        setCheckOut(key);
        onDatesChange?.(checkIn, key);
      }
    }
  }, [checkIn, checkOut, onDatesChange]);

  const handleClear = () => {
    setCheckIn(null);
    setCheckOut(null);
    setHoverDate(null);
  };

  const instruction = !checkIn
    ? labels.selectCheckIn
    : !checkOut
    ? labels.selectCheckOut
    : `${checkIn} → ${checkOut}`;

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête — centré */}
      <div className="text-center mb-6">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800">
          {labels.title}
        </h2>
        <p className="text-md text-charcoal-500 mt-1">{instruction}</p>
      </div>

      {/* Navigation mois + bouton reset */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setOffset((o) => Math.max(0, o - 1))}
          disabled={offset === 0}
          aria-label="Mois précédent"
          className={cn(
            "w-9 h-9 rounded-full border border-sand-300 flex items-center justify-center transition-colors",
            offset === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-sand-100"
          )}
        >
          <ChevronLeft className="w-5 h-5 text-charcoal-600" />
        </button>

        {(checkIn || checkOut) && (
          <button
            onClick={handleClear}
            className="text-sm text-charcoal-500 hover:text-terracotta-500 underline transition-colors"
          >
            {labels.clear}
          </button>
        )}

        <button
          onClick={() => setOffset((o) => Math.min(TOTAL_MONTHS - 1, o + 1))}
          disabled={offset >= TOTAL_MONTHS - 1}
          aria-label="Mois suivant"
          className={cn(
            "w-9 h-9 rounded-full border border-sand-300 flex items-center justify-center transition-colors",
            offset >= TOTAL_MONTHS - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-sand-100"
          )}
        >
          <ChevronRight className="w-5 h-5 text-charcoal-600" />
        </button>
      </div>

      {/* Mois affiché — pleine largeur du conteneur */}
      <MonthGrid
        year={currentMonth.year}
        month={currentMonth.month}
        lang={lang}
        checkIn={checkIn}
        checkOut={checkOut}
        hoverDate={hoverDate}
        onDayClick={handleDayClick}
        onDayHover={setHoverDate}
      />

      {/* Légende — uniquement Occupé et Sélectionné */}
      <div className="mt-6 flex items-center gap-x-6 gap-y-2 text-sm text-charcoal-600 justify-center flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-charcoal-100 border border-charcoal-200 flex items-center justify-center">
            <span className="text-[9px] font-medium text-charcoal-400 line-through">8</span>
          </span>
          <span>{labels.booked}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded bg-terracotta-500" />
          <span>{labels.selected}</span>
        </div>
      </div>
    </div>
  );
}
