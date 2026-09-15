"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ArrowRight, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLocalStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function rangeHasBlocked(checkIn: string, checkOut: string, blocked: Set<string>): boolean {
  const [ciY, ciM, ciD] = checkIn.split("-").map(Number);
  const [coY, coM, coD] = checkOut.split("-").map(Number);
  const current = new Date(ciY, ciM - 1, ciD);
  const end = new Date(coY, coM - 1, coD);
  while (current < end) {
    if (blocked.has(toLocalStr(current))) return true;
    current.setDate(current.getDate() + 1);
  }
  return false;
}

function formatDisplay(dateStr: string, lang: Locale): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(
    lang === "fr" ? "fr-FR" : lang === "pt" ? "pt-BR" : "en-GB",
    { day: "2-digit", month: "short", year: "numeric" }
  );
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
  checkIn: string; checkOut: string; seePrice: string;
  blocked: string; selectCheckIn: string; selectCheckOut: string; clear: string;
}> = {
  fr: {
    checkIn: "Arrivée", checkOut: "Départ", seePrice: "Voir le prix",
    blocked: "Ces dates sont déjà réservées — choisissez d'autres dates.",
    selectCheckIn: "Sélectionnez une date d'arrivée",
    selectCheckOut: "Sélectionnez une date de départ",
    clear: "Effacer",
  },
  en: {
    checkIn: "Check-in", checkOut: "Check-out", seePrice: "See price",
    blocked: "These dates are already booked — please choose other dates.",
    selectCheckIn: "Select check-in date",
    selectCheckOut: "Select check-out date",
    clear: "Clear",
  },
  pt: {
    checkIn: "Chegada", checkOut: "Saída", seePrice: "Ver preço",
    blocked: "Estas datas já estão reservadas — escolha outras datas.",
    selectCheckIn: "Selecione a data de chegada",
    selectCheckOut: "Selecione a data de saída",
    clear: "Limpar",
  },
};

// ─── Mini MonthGrid ───────────────────────────────────────────────────────────

interface MonthGridProps {
  year: number;
  month: number;
  lang: Locale;
  checkIn: string | null;
  checkOut: string | null;
  hoverDate: string | null;
  blockedSet: Set<string>;
  onDayClick: (key: string) => void;
  onDayHover: (key: string | null) => void;
}

function MonthGrid({ year, month, lang, checkIn, checkOut, hoverDate, blockedSet, onDayClick, onDayHover }: MonthGridProps) {
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
  for (let i = 0; i < firstDow; i++) cells.push(<div key={`e-${i}`} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month - 1, d);
    dateObj.setHours(0, 0, 0, 0);
    const key = toKey(year, month, d);
    const isPast = dateObj < today;
    const isBlocked = blockedSet.has(key);
    const isUnavailable = isPast || isBlocked;
    const isCheckIn  = key === checkIn;
    const isCheckOut = key === checkOut;
    const inRange = isInRange(key);

    // Vérif si le survol crée une plage invalide
    const hoverInvalid = !checkIn || !!checkOut || !hoverDate || hoverDate <= checkIn
      ? false
      : rangeHasBlocked(checkIn, hoverDate, blockedSet);

    let cls: string;
    if (isCheckIn || isCheckOut) {
      cls = "bg-terracotta-500 text-white font-bold cursor-pointer";
    } else if (isPast) {
      cls = "text-white/20 cursor-not-allowed";
    } else if (isBlocked) {
      cls = "bg-white/10 text-white/30 line-through cursor-not-allowed";
    } else if (inRange) {
      cls = hoverInvalid
        ? "bg-red-500/20 text-red-300 cursor-not-allowed"
        : "bg-terracotta-400/30 text-white cursor-pointer";
    } else {
      cls = "text-white hover:bg-white/10 cursor-pointer";
    }

    cells.push(
      <button
        key={d}
        type="button"
        disabled={isUnavailable}
        onClick={() => !isUnavailable && onDayClick(key)}
        onMouseEnter={() => !isUnavailable && onDayHover(key)}
        onMouseLeave={() => onDayHover(null)}
        className={cn(
          "rounded-md text-xs font-medium h-8 w-full flex items-center justify-center select-none transition-colors",
          cls
        )}
        aria-label={key}
      >
        {d}
      </button>
    );
  }

  return (
    <div className="w-full">
      <p className="text-center text-sm font-semibold text-white mb-3">
        {MONTH_NAMES[lang][month - 1]} {year}
      </p>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAY_NAMES[lang].map((n, i) => (
          <div key={i} className="text-center text-[10px] text-white/40 font-medium py-0.5">{n}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">{cells}</div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface HeroDatePickerProps {
  lang: Locale;
  dict: Dictionary["hero"];
  blockedDates?: string[];
}

type PickerMode = "closed" | "checkIn" | "checkOut";

export default function HeroDatePicker({ lang, dict, blockedDates = [] }: HeroDatePickerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef   = useRef<HTMLDivElement>(null);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultOut = new Date(tomorrow);
  defaultOut.setDate(defaultOut.getDate() + 7);

  const [checkIn,   setCheckIn]   = useState(toLocalStr(tomorrow));
  const [checkOut,  setCheckOut]  = useState(toLocalStr(defaultOut));
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [mode,      setMode]      = useState<PickerMode>("closed");
  const [offset,    setOffset]    = useState(0);
  // Position fixe du popover (échappe à overflow-hidden du hero)
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  // Calcul du mois affiché dans le popover
  const now = new Date();
  const displayMonth = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  }, [offset]);

  const isBlocked = useMemo(() => {
    if (!checkIn || !checkOut) return false;
    return rangeHasBlocked(checkIn, checkOut, blockedSet);
  }, [checkIn, checkOut, blockedSet]);

  const labels = LABELS[lang];

  // Calcule la position fixed à partir du container (échappe overflow-hidden)
  function computePopoverStyle() {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(320, rect.width);
    // Centrer horizontalement sous le container
    const left = rect.left + (rect.width - popoverWidth) / 2;
    // Vérifier si assez de place en bas, sinon ouvrir vers le haut
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = 420; // hauteur approximative du popover
    if (spaceBelow >= estimatedHeight || spaceBelow >= window.innerHeight / 2) {
      setPopoverStyle({ top: rect.bottom + 8, left, width: popoverWidth });
    } else {
      setPopoverStyle({ bottom: window.innerHeight - rect.top + 8, left, width: popoverWidth });
    }
  }

  // Fermer le popover au clic extérieur
  useEffect(() => {
    function onOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        containerRef.current && !containerRef.current.contains(target)
      ) {
        setMode("closed");
        setHoverDate(null);
      }
    }
    if (mode !== "closed") document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [mode]);

  const handleDayClick = useCallback((key: string) => {
    if (mode === "checkIn") {
      setCheckIn(key);
      if (key >= checkOut) {
        const [y, m, d] = key.split("-").map(Number);
        const next = new Date(y, m - 1, d);
        next.setDate(next.getDate() + 1);
        setCheckOut(toLocalStr(next));
      }
      setMode("checkOut");
    } else if (mode === "checkOut") {
      if (key <= checkIn) {
        setCheckIn(key);
        setMode("checkOut");
        return;
      }
      if (rangeHasBlocked(checkIn, key, blockedSet)) return;
      setCheckOut(key);
      setMode("closed");
      setHoverDate(null);
    }
  }, [mode, checkIn, checkOut, blockedSet]);

  function handleSearch() {
    if (isBlocked) return;
    const params = new URLSearchParams({ checkIn, checkOut });
    router.push(`/${lang}/reserver?${params.toString()}`);
  }

  function openCheckIn()  { computePopoverStyle(); setMode("checkIn");  setOffset(0); }
  function openCheckOut() { computePopoverStyle(); setMode("checkOut"); setOffset(0); }

  const TOTAL_MONTHS = 18;

  return (
    <div className="mt-10 w-full max-w-xl mx-auto relative" ref={containerRef}>
      {/* Barre de sélection */}
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-softer p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Check-in */}
        <button
          type="button"
          onClick={openCheckIn}
          className={cn(
            "flex-1 flex flex-col px-3 py-2 rounded-soft text-left transition-colors",
            mode === "checkIn" ? "bg-white/20" : "hover:bg-white/10"
          )}
        >
          <span className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">
            {labels.checkIn}
          </span>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-white/50 shrink-0" />
            <span className="text-white text-sm font-medium">{formatDisplay(checkIn, lang)}</span>
          </div>
        </button>

        <div className="hidden sm:block w-px self-stretch bg-white/20" />

        {/* Check-out */}
        <button
          type="button"
          onClick={openCheckOut}
          className={cn(
            "flex-1 flex flex-col px-3 py-2 rounded-soft text-left transition-colors",
            mode === "checkOut" ? "bg-white/20" : "hover:bg-white/10"
          )}
        >
          <span className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">
            {labels.checkOut}
          </span>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-white/50 shrink-0" />
            <span className="text-white text-sm font-medium">{formatDisplay(checkOut, lang)}</span>
          </div>
        </button>

        {/* CTA */}
        <button
          onClick={handleSearch}
          disabled={isBlocked}
          className={cn(
            "font-semibold text-sm px-5 py-3 rounded-soft",
            "flex items-center justify-center gap-2 transition-colors",
            "whitespace-nowrap shrink-0",
            isBlocked
              ? "bg-charcoal-400 text-white/60 cursor-not-allowed"
              : "bg-terracotta-500 hover:bg-terracotta-600 text-white"
          )}
        >
          {dict.seePrice}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Alerte dates bloquées */}
      {isBlocked && (
        <div className="mt-3 flex items-start gap-2 bg-red-900/60 backdrop-blur-sm border border-red-400/30 rounded-soft px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-red-300 shrink-0 mt-0.5" />
          <p className="text-sm text-red-200 font-medium">{labels.blocked}</p>
        </div>
      )}

      {/* Popover calendrier — position fixed pour échapper au overflow-hidden du hero */}
      {mode !== "closed" && (
        <div
          ref={popoverRef}
          style={popoverStyle}
          className="fixed z-50 bg-charcoal-800/95 backdrop-blur-md border border-white/20 rounded-softer p-4 shadow-2xl"
        >
          {/* En-tête navigation mois */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setOffset((o) => Math.max(0, o - 1))}
              disabled={offset === 0}
              className={cn(
                "w-7 h-7 rounded-full border border-white/20 flex items-center justify-center transition-colors",
                offset === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10"
              )}
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            <p className="text-xs text-white/50 font-medium">
              {mode === "checkIn" ? labels.selectCheckIn : labels.selectCheckOut}
            </p>

            <button
              type="button"
              onClick={() => setOffset((o) => Math.min(TOTAL_MONTHS - 1, o + 1))}
              disabled={offset >= TOTAL_MONTHS - 1}
              className={cn(
                "w-7 h-7 rounded-full border border-white/20 flex items-center justify-center transition-colors",
                offset >= TOTAL_MONTHS - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10"
              )}
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          <MonthGrid
            year={displayMonth.year}
            month={displayMonth.month}
            lang={lang}
            checkIn={checkIn}
            checkOut={checkOut}
            hoverDate={hoverDate}
            blockedSet={blockedSet}
            onDayClick={handleDayClick}
            onDayHover={setHoverDate}
          />

          {/* Légende + Effacer */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded bg-white/10 flex items-center justify-center">
                <span className="text-[8px] text-white/30 line-through">8</span>
              </span>
              <span className="text-xs text-white/40">Occupé</span>
            </div>
            <button
              type="button"
              onClick={() => { setMode("closed"); setHoverDate(null); }}
              className="text-xs text-white/50 hover:text-white/80 underline transition-colors"
            >
              {labels.clear}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
