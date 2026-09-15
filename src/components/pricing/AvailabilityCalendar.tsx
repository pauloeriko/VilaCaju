"use client";

import React, { useState, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOOKED_DATES, getSeasonForDay, rangeContainsUnavailable } from "@/lib/pricing/availability";
import type { Locale } from "@/lib/i18n/config";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ─── Localisation ─────────────────────────────────────────────────────────────
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
  booked: string; title: string; minStay: string;
  selectCheckIn: string; selectCheckOut: string;
  clear: string; selected: string; unavailableRange: string;
}> = {
  fr: {
    booked: "Occupé", title: "Calendrier de disponibilité",
    minStay: "3 nuits minimum",
    selectCheckIn: "Sélectionnez une date d'arrivée",
    selectCheckOut: "Sélectionnez une date de départ",
    clear: "Réinitialiser", selected: "Sélectionné",
    unavailableRange: "Cette période contient des dates non disponibles.",
  },
  en: {
    booked: "Occupied", title: "Availability calendar",
    minStay: "3 nights minimum",
    selectCheckIn: "Select check-in date",
    selectCheckOut: "Select check-out date",
    clear: "Clear", selected: "Selected",
    unavailableRange: "This period contains unavailable dates.",
  },
  pt: {
    booked: "Ocupado", title: "Calendário de disponibilidade",
    minStay: "Mínimo 3 noites",
    selectCheckIn: "Selecione a data de chegada",
    selectCheckOut: "Selecione a data de saída",
    clear: "Limpar", selected: "Selecionado",
    unavailableRange: "Este período contém datas indisponíveis.",
  },
};

// ─── Composant MonthGrid ──────────────────────────────────────────────────────
interface MonthGridProps {
  year: number;
  month: number;
  lang: Locale;
  checkIn: string | null;
  checkOut: string | null;
  hoverDate: string | null;
  hoverRangeIsInvalid: boolean;
  onDayClick: (key: string) => void;
  onDayHover: (key: string | null) => void;
}

function MonthGrid({
  year, month, lang, checkIn, checkOut, hoverDate, hoverRangeIsInvalid, onDayClick, onDayHover,
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
    const isUnavailable = isPast || season === "closed" || BOOKED_DATES.has(key);
    const isCheckIn  = key === checkIn;
    const isCheckOut = key === checkOut;
    const inRange    = isInRange(key);

    const base = "relative flex items-center justify-center rounded-lg text-sm font-medium h-12 w-full select-none transition-colors";
    let state: string;

    if (isCheckIn || isCheckOut) {
      state = "bg-terracotta-500 text-white font-bold cursor-pointer";
    } else if (isPast) {
      // Passé : texte très clair, pas de fond
      state = "text-charcoal-200 cursor-not-allowed";
    } else if (season === "closed" || BOOKED_DATES.has(key)) {
      // Non disponible (occupé ou fermeture) : même couleur gris clair
      state = "bg-[#D3D3D3] text-charcoal-400 line-through cursor-not-allowed";
    } else if (inRange) {
      // Plage sélectionnée — rouge si invalide, terracotta si valide
      state = hoverRangeIsInvalid
        ? "bg-red-50 text-red-400 cursor-not-allowed"
        : "bg-terracotta-100 text-terracotta-800 cursor-pointer";
    } else {
      state = "text-charcoal-700 hover:bg-sand-100 cursor-pointer";
    }

    cells.push(
      <button
        key={d}
        type="button"
        disabled={isUnavailable}
        onClick={() => !isUnavailable && onDayClick(key)}
        onMouseEnter={() => !isUnavailable && onDayHover(key)}
        onMouseLeave={() => onDayHover(null)}
        className={`${base} ${state}`}
        aria-label={key}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center font-semibold text-charcoal-700 text-base mb-4">
        {MONTH_NAMES[lang][month - 1]} {year}
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {DAY_NAMES[lang].map((day, i) => (
          <div key={i} className="text-center text-xs text-charcoal-400 font-medium py-1">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">{cells}</div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────
interface AvailabilityCalendarProps {
  lang: Locale;
  onDatesChange?: (checkIn: string, checkOut: string) => void;
  initialCheckIn?: string | null;
  initialCheckOut?: string | null;
}

const TOTAL_MONTHS = 12;

export default function AvailabilityCalendar({
  lang, onDatesChange, initialCheckIn, initialCheckOut,
}: AvailabilityCalendarProps) {
  const now = new Date();

  const initialOffset = (() => {
    if (!initialCheckIn) return 0;
    const ci = new Date(initialCheckIn);
    const diff = (ci.getFullYear() - now.getFullYear()) * 12 + (ci.getMonth() - now.getMonth());
    return Math.max(0, Math.min(diff, TOTAL_MONTHS - 1));
  })();

  const [offset,    setOffset]    = useState(initialOffset);
  const [checkIn,   setCheckIn]   = useState<string | null>(initialCheckIn  ?? null);
  const [checkOut,  setCheckOut]  = useState<string | null>(initialCheckOut ?? null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState(false);

  const labels = LABELS[lang];

  const months: Array<{ year: number; month: number }> = [];
  for (let i = 0; i < TOTAL_MONTHS; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  // Détecte si la plage survolée est invalide (pour colorer la plage en rouge)
  const hoverRangeIsInvalid = useMemo(() => {
    if (!checkIn || checkOut || !hoverDate || hoverDate <= checkIn) return false;
    return rangeContainsUnavailable(checkIn, hoverDate);
  }, [checkIn, checkOut, hoverDate]);

  const handleDayClick = useCallback((key: string) => {
    // Pas de check-in ou les deux dates déjà choisies → on recommence
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(key);
      setCheckOut(null);
      setRangeError(false);
      return;
    }
    // Nouvelle date ≤ check-in → on remplace le check-in
    if (key <= checkIn) {
      setCheckIn(key);
      setCheckOut(null);
      setRangeError(false);
      return;
    }
    // Vérification : la plage contient-elle des dates non disponibles ?
    if (rangeContainsUnavailable(checkIn, key)) {
      setRangeError(true);
      return;
    }
    // Plage valide
    setRangeError(false);
    setCheckOut(key);
    onDatesChange?.(checkIn, key);
  }, [checkIn, checkOut, onDatesChange]);

  const handleClear = () => {
    setCheckIn(null);
    setCheckOut(null);
    setHoverDate(null);
    setRangeError(false);
  };

  const showError = rangeError || hoverRangeIsInvalid;

  const instruction = showError
    ? labels.unavailableRange
    : !checkIn
    ? labels.selectCheckIn
    : !checkOut
    ? labels.selectCheckOut
    : `${checkIn} → ${checkOut}`;

  const currentMonth = months[offset];

  return (
    <div className="max-w-3xl mx-auto">
      {/* En-tête */}
      <div className="text-center mb-4">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800">
          {labels.title}
        </h2>
        <p className="text-sm text-terracotta-500 font-medium mt-1">{labels.minStay}</p>
      </div>

      {/* Message d'erreur persistant */}
      {rangeError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-soft px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{labels.unavailableRange}</p>
        </div>
      )}

      {/* Instruction / dates sélectionnées */}
      <p className={cn("text-sm text-center mb-4", showError ? "text-red-500 font-medium" : "text-charcoal-500")}>
        {instruction}
      </p>

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

        {(checkIn || checkOut || rangeError) && (
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

      {/* Grille du mois */}
      <MonthGrid
        year={currentMonth.year}
        month={currentMonth.month}
        lang={lang}
        checkIn={checkIn}
        checkOut={checkOut}
        hoverDate={hoverDate}
        hoverRangeIsInvalid={hoverRangeIsInvalid}
        onDayClick={handleDayClick}
        onDayHover={setHoverDate}
      />

      {/* Légende — Occupé + Sélectionné uniquement */}
      <div className="mt-6 flex items-center gap-x-6 gap-y-2 text-sm text-charcoal-600 justify-center flex-wrap">
        <div className="flex items-center gap-1.5">
          <span
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ backgroundColor: "#D3D3D3" }}
          >
            <span className="text-[9px] font-medium text-[#888] line-through">8</span>
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
