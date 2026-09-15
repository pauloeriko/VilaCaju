"use client";

import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Reservation, BlockedDate, Season } from "@/lib/supabase/types";
import ConfirmModal from "./ConfirmModal";
import ReservationFormModal from "./ReservationFormModal";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import { useToast } from "./ToastProvider";
import { useEscapeKey } from "@/hooks/useEscapeKey";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toKey(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function expandRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = parseKey(start);
  const endDate = parseKey(end);
  while (current < endDate) {
    dates.push(toKey(current.getFullYear(), current.getMonth() + 1, current.getDate()));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

// ─── Types internes ───────────────────────────────────────────────────────────

type DayState =
  | { kind: "available" }
  | { kind: "reservation"; status: "pending" | "confirmed"; reservation: Reservation; isFirst: boolean; isLast: boolean }
  | { kind: "blocked"; blockId: string; isManual: boolean };

// Discriminant utilisé pour interdire les sélections mélangeant plusieurs statuts
// (libre / blocages différents / réservations différentes) dans une même plage.
function dayDiscriminant(state: DayState): string {
  if (state.kind === "blocked") return `blocked:${state.blockId}`;
  if (state.kind === "reservation") return `reservation:${state.reservation.id}`;
  return "available";
}

// ─── MonthGrid ──────────────────────────────────────────────────────────────

interface MonthGridProps {
  year: number;
  month: number;
  dayMap: Map<string, DayState>;
  selectStart: string | null;
  onDayClick: (key: string, state: DayState) => void;
}

const DAYS_FR = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];

function MonthGrid({ year, month, dayMap, selectStart, onDayClick }: MonthGridProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(<div key={`e-${i}`} />);

  for (let d = 1; d <= daysInMonth; d++) {
    const key = toKey(year, month, d);
    const dateObj = new Date(year, month - 1, d);
    const isPast = dateObj < today;
    const isToday = dateObj.getTime() === today.getTime();
    const state = dayMap.get(key) ?? { kind: "available" as const };
    const isStart = key === selectStart;

    let bg = "";
    let text = "text-gray-700";
    let cursor = "cursor-pointer";
    let extra = "";
    let title = "";

    if (isStart) {
      bg = "bg-blue-500";
      text = "text-white";
    } else if (state.kind === "reservation") {
      if (state.status === "confirmed") {
        bg = state.isFirst ? "bg-green-500 rounded-l-lg" : state.isLast ? "bg-green-500 rounded-r-lg" : "bg-green-500 rounded-none";
        if (state.isFirst && state.isLast) bg = "bg-green-500";
        text = "text-white";
      } else {
        bg = state.isFirst ? "bg-amber-300 rounded-l-lg" : state.isLast ? "bg-amber-300 rounded-r-lg" : "bg-amber-300 rounded-none";
        if (state.isFirst && state.isLast) bg = "bg-amber-300";
        text = "text-amber-900";
      }
      cursor = "cursor-pointer hover:brightness-95";
      title = state.reservation.guest_name;
    } else if (state.kind === "blocked") {
      bg = "bg-gray-200";
      text = "text-gray-400 line-through";
      cursor = state.isManual ? "cursor-pointer hover:bg-red-100" : "cursor-default";
      title = state.isManual ? "Cliquer pour débloquer" : "Bloqué";
    } else if (isPast) {
      text = "text-gray-300";
      cursor = "cursor-default";
    } else {
      cursor = "cursor-pointer hover:bg-terracotta-50";
    }

    if (isToday) extra = "ring-2 ring-terracotta-400 ring-inset";

    // Afficher le nom du guest sur le premier jour de la réservation
    const showName = state.kind === "reservation" && state.isFirst;

    cells.push(
      <button
        key={d}
        type="button"
        title={title}
        disabled={isPast && state.kind === "available"}
        onClick={() => !isPast && onDayClick(key, state)}
        className={cn("relative h-10 w-full text-xs font-medium flex items-center justify-center transition-colors select-none rounded-lg", bg, text, cursor, extra)}
        aria-label={key}
      >
        <span className="relative z-10">{d}</span>
        {showName && state.kind === "reservation" && (
          <span className="absolute -top-4 left-0 text-[9px] font-semibold text-gray-600 truncate max-w-[80px] pointer-events-none">
            {state.reservation.guest_name.split(" ")[0]}
          </span>
        )}
      </button>,
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {DAYS_FR.map((n) => (
          <div key={n} className="text-center text-[10px] text-gray-400 font-medium py-1">{n}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5 mt-5">{cells}</div>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface AdminCalendarProps {
  reservations: Reservation[];
  blockedDates: BlockedDate[];
  expandedBlockedDates: string[];
  seasons: Season[];
  cleaningFee: number;
}

const MONTHS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function AdminCalendar({ reservations, blockedDates, expandedBlockedDates, seasons, cleaningFee }: AdminCalendarProps) {
  const router = useRouter();
  const { toast } = useToast();
  const now = new Date();

  const [offset, setOffset] = useState(0);
  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [selectionError, setSelectionError] = useState<string | null>(null);
  const [confirmRange, setConfirmRange] = useState<{ start: string; end: string } | null>(null);
  const [unblockTarget, setUnblockTarget] = useState<{ blockId: string; key: string } | null>(null);
  const [convertBlock, setConvertBlock] = useState<BlockedDate | null>(null);
  const [createFromRange, setCreateFromRange] = useState<{ check_in: string; check_out: string } | null>(null);
  const [confirmBlockedRange, setConfirmBlockedRange] = useState<{ blockId: string; start: string; end: string } | null>(null);
  const [convertBlockRange, setConvertBlockRange] = useState<{ blockId: string; check_in: string; check_out: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [popover, setPopover] = useState<{ reservation: Reservation; key: string } | null>(null);
  const [viewMode, setViewMode] = useState<1 | 2 | 3>(2);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEscapeKey(() => setPopover(null), popover !== null);

  useEffect(() => {
    if (!popover) return;
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popover]);

  // Map date → DayState avec indicateurs first/last
  const dayMap = useMemo<Map<string, DayState>>(() => {
    const map = new Map<string, DayState>();

    for (const r of reservations) {
      if (r.status === "cancelled" || r.status === "declined") continue;
      const keys = expandRange(r.check_in, r.check_out);
      for (let i = 0; i < keys.length; i++) {
        map.set(keys[i], {
          kind: "reservation",
          status: r.status as "pending" | "confirmed",
          reservation: r,
          isFirst: i === 0,
          isLast: i === keys.length - 1,
        });
      }
    }

    for (const b of blockedDates) {
      for (const key of expandRange(b.date_start, b.date_end)) {
        if (!map.has(key)) {
          map.set(key, { kind: "blocked", blockId: b.id, isManual: b.source === "manual" });
        }
      }
    }

    return map;
  }, [reservations, blockedDates]);

  const handleDayClick = useCallback((key: string, state: DayState) => {
    setPopover(null);

    // Une sélection est en cours : ce clic en marque la fin, quel que soit son
    // statut — le mélange de statuts est rejeté ci-dessous plutôt que par des
    // branches séparées, pour que la règle s'applique de façon uniforme.
    if (selectStart) {
      const [start, end] = selectStart < key ? [selectStart, key] : [key, selectStart];
      const endExclusive = parseKey(end);
      endExclusive.setDate(endExclusive.getDate() + 1);
      const endStr = toKey(endExclusive.getFullYear(), endExclusive.getMonth() + 1, endExclusive.getDate());

      const discriminants = new Set(
        expandRange(start, endStr).map((k) => dayDiscriminant(dayMap.get(k) ?? { kind: "available" })),
      );
      if (discriminants.size > 1) {
        setSelectionError("Sélection invalide : mélange de dates avec des statuts différents.");
        setSelectStart(null);
        return;
      }

      const startState = dayMap.get(start) ?? { kind: "available" as const };
      if (startState.kind === "blocked") {
        if (!startState.isManual) {
          setSelectionError("Ce blocage est automatique (lié à une réservation), il ne peut pas être modifié ici.");
          setSelectStart(null);
          return;
        }
        setConfirmBlockedRange({ blockId: startState.blockId, start, end: endStr });
      } else if (startState.kind === "available") {
        setConfirmRange({ start, end: endStr });
      } else {
        // Une plage ne peut pas se terminer sur une réservation seule (voir garde ci-dessus).
        setSelectionError("Sélection invalide : mélange de dates avec des statuts différents.");
      }
      setSelectStart(null);
      return;
    }

    // Pas de sélection en cours : comportement de premier clic.
    if (state.kind === "reservation") {
      setPopover({ reservation: state.reservation, key });
      return;
    }

    if (state.kind === "blocked") {
      if (state.isManual) {
        setUnblockTarget({ blockId: state.blockId, key });
      }
      return;
    }

    setSelectStart(key);
    setSelectionError(null);
  }, [selectStart, dayMap]);

  async function handleBlock() {
    if (!confirmRange) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/blocked-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date_start: confirmRange.start, date_end: confirmRange.end }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json() as { error: string };
      setError(data.error);
      return;
    }
    setConfirmRange(null);
    toast("success", "Dates bloquées avec succès");
    router.refresh();
  }

  async function handleUnblock() {
    if (!unblockTarget) return;
    setLoading(true);
    const res = await fetch(`/api/admin/blocked-dates/${unblockTarget.blockId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok && res.status !== 204) {
      const data = await res.json() as { error: string };
      setError(data.error);
      toast("error", data.error);
      setUnblockTarget(null);
      return;
    }
    setUnblockTarget(null);
    toast("success", "Date débloquée");
    router.refresh();
  }

  function handleConvertClick() {
    const block = blockedDates.find((b) => b.id === unblockTarget?.blockId) ?? null;
    setUnblockTarget(null);
    setConvertBlock(block);
  }

  function handleConvertSaved() {
    setConvertBlock(null);
    toast("success", "Réservation créée à partir du blocage");
    router.refresh();
  }

  function handleSelectSubRangeClick() {
    if (!unblockTarget) return;
    setSelectStart(unblockTarget.key);
    setSelectionError(null);
    setUnblockTarget(null);
  }

  function handleCreateReservationClick() {
    if (!confirmRange) return;
    setCreateFromRange({ check_in: confirmRange.start, check_out: confirmRange.end });
    setConfirmRange(null);
    setError(null);
  }

  function handleCreateFromRangeSaved() {
    setCreateFromRange(null);
    toast("success", "Réservation créée");
    router.refresh();
  }

  async function handleUnblockRange() {
    if (!confirmBlockedRange) return;
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/blocked-dates/${confirmBlockedRange.blockId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date_start: confirmBlockedRange.start, date_end: confirmBlockedRange.end }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json() as { error: string };
      setError(data.error);
      return;
    }
    setConfirmBlockedRange(null);
    toast("success", "Sous-plage débloquée");
    router.refresh();
  }

  function handleCreateReservationFromBlockRange() {
    if (!confirmBlockedRange) return;
    setConvertBlockRange({
      blockId: confirmBlockedRange.blockId,
      check_in: confirmBlockedRange.start,
      check_out: confirmBlockedRange.end,
    });
    setConfirmBlockedRange(null);
    setError(null);
  }

  function handleConvertBlockRangeSaved() {
    setConvertBlockRange(null);
    toast("success", "Réservation créée à partir du blocage");
    router.refresh();
  }

  // Mois à afficher
  const months = useMemo(() => {
    const result: { year: number; month: number }[] = [];
    for (let i = 0; i < viewMode; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + offset + i, 1);
      result.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
    }
    return result;
  }, [offset, viewMode]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 relative">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-gray-800 text-base">Calendrier</h2>
          {selectStart && (
            <p className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
              {dayMap.get(selectStart)?.kind === "blocked"
                ? `Début de sous-plage : ${selectStart} — cliquez sur la fin`
                : `Arrivée : ${selectStart} — cliquez sur le départ`}
            </p>
          )}
          {selectionError && (
            <p className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
              {selectionError}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle vue */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {([1, 2, 3] as const).map((n) => (
              <button
                key={n}
                onClick={() => setViewMode(n)}
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium transition-colors",
                  viewMode === n ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700",
                )}
              >
                {n} mois
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button onClick={() => setOffset((o) => o - 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Mois précédent">
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={() => setOffset(0)}
              className="text-xs text-gray-500 hover:text-gray-700 px-2"
            >
              Aujourd&apos;hui
            </button>
            <button onClick={() => setOffset((o) => o + 1)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors" aria-label="Mois suivant">
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Grille multi-mois */}
      <div className={cn(
        "grid gap-8",
        viewMode === 1 ? "grid-cols-1" : viewMode === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3",
      )}>
        {months.map(({ year, month }) => (
          <div key={`${year}-${month}`}>
            <p className="text-sm font-semibold text-gray-700 text-center mb-3">
              {MONTHS_FR[month - 1]} {year}
            </p>
            <MonthGrid
              year={year}
              month={month}
              dayMap={dayMap}
              selectStart={selectStart}
              onDayClick={handleDayClick}
            />
          </div>
        ))}
      </div>

      {/* Popover réservation */}
      {popover && (
        <div ref={popoverRef} className="absolute z-30 mt-2 left-1/2 -translate-x-1/2 bg-white rounded-xl border border-gray-200 shadow-lg p-4 w-72">
          <div className="flex items-start justify-between mb-2">
            <p className="font-semibold text-gray-900 text-sm">{popover.reservation.guest_name}</p>
            <span className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              popover.reservation.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700",
            )}>
              {popover.reservation.status === "confirmed" ? "Confirmée" : "En attente"}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {formatDateShort(popover.reservation.check_in)} → {formatDateShort(popover.reservation.check_out)} · {popover.reservation.guests_count} pers.
          </p>
          <p className="text-sm font-semibold text-terracotta-600 mt-1">
            <CurrencyDisplay amountBRL={popover.reservation.total_price} lang="fr" />
          </p>
          {popover.reservation.guest_email && (
            <p className="text-xs text-gray-400 mt-1">{popover.reservation.guest_email}</p>
          )}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <button onClick={() => setPopover(null)} className="text-xs text-gray-400 hover:text-gray-600">
              Fermer
            </button>
            <button
              onClick={() => {
                setPopover(null);
                const el = document.getElementById(`resa-${popover.reservation.id}`);
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-1 text-xs text-terracotta-500 hover:text-terracotta-600 font-medium"
            >
              Voir détails <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Légende */}
      <div className="mt-5 flex flex-wrap gap-4 text-xs text-gray-500">
        {[
          { color: "bg-green-500", label: "Confirmée" },
          { color: "bg-amber-300", label: "En attente" },
          { color: "bg-gray-200", label: "Bloqué" },
          { color: "bg-blue-500", label: "Sélection" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn("w-3 h-3 rounded", color)} />
            {label}
          </div>
        ))}
      </div>

      {/* Modale confirmation blocage */}
      <ConfirmModal
        open={confirmRange !== null}
        title="Bloquer ces dates"
        description={confirmRange ? `Du ${confirmRange.start} au ${confirmRange.end} (exclusif)` : ""}
        confirmLabel="Bloquer"
        loading={loading}
        onConfirm={handleBlock}
        onCancel={() => { setConfirmRange(null); setError(null); }}
      >
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        <button
          type="button"
          onClick={handleCreateReservationClick}
          className="w-full py-2 rounded-lg border border-terracotta-300 text-terracotta-600 text-sm font-medium hover:bg-terracotta-50 transition-colors mb-1"
        >
          Créer une réservation pour ces dates à la place
        </button>
      </ConfirmModal>

      {/* Modale confirmation déblocage */}
      <ConfirmModal
        open={unblockTarget !== null}
        title="Que faire de ce blocage ?"
        description="La date était bloquée manuellement (fermeture de la villa, réservation hors-site...)."
        confirmLabel="Débloquer"
        variant="danger"
        loading={loading}
        onConfirm={handleUnblock}
        onCancel={() => setUnblockTarget(null)}
      >
        <div className="space-y-2 mb-2">
          <button
            type="button"
            onClick={handleConvertClick}
            className="w-full py-2 rounded-lg border border-terracotta-300 text-terracotta-600 text-sm font-medium hover:bg-terracotta-50 transition-colors"
          >
            C&apos;est en fait une réservation → la convertir
          </button>
          <button
            type="button"
            onClick={handleSelectSubRangeClick}
            className="w-full py-2 rounded-lg border border-terracotta-300 text-terracotta-600 text-sm font-medium hover:bg-terracotta-50 transition-colors"
          >
            Sélectionner une sous-plage précise
          </button>
        </div>
      </ConfirmModal>

      {/* Modale confirmation déblocage/conversion d'une sous-plage bloquée */}
      <ConfirmModal
        open={confirmBlockedRange !== null}
        title="Que faire de cette sous-plage ?"
        description={confirmBlockedRange ? `Du ${confirmBlockedRange.start} au ${confirmBlockedRange.end} (exclusif) — le reste du blocage reste inchangé.` : ""}
        confirmLabel="Débloquer cette sous-plage"
        variant="danger"
        loading={loading}
        onConfirm={handleUnblockRange}
        onCancel={() => { setConfirmBlockedRange(null); setError(null); }}
      >
        {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
        <button
          type="button"
          onClick={handleCreateReservationFromBlockRange}
          className="w-full py-2 rounded-lg border border-terracotta-300 text-terracotta-600 text-sm font-medium hover:bg-terracotta-50 transition-colors mb-1"
        >
          Créer une réservation pour cette sous-plage à la place
        </button>
      </ConfirmModal>

      {/* Modale de conversion blocage → réservation */}
      {convertBlock && (
        <ReservationFormModal
          mode="create"
          seasons={seasons}
          cleaningFee={cleaningFee}
          blockedDates={expandedBlockedDates}
          initialDates={{ check_in: convertBlock.date_start, check_out: convertBlock.date_end }}
          convertBlockedDateId={convertBlock.id}
          onClose={() => setConvertBlock(null)}
          onSaved={handleConvertSaved}
        />
      )}

      {/* Modale de création de réservation depuis une sélection libre */}
      {createFromRange && (
        <ReservationFormModal
          mode="create"
          seasons={seasons}
          cleaningFee={cleaningFee}
          blockedDates={expandedBlockedDates}
          initialDates={createFromRange}
          onClose={() => setCreateFromRange(null)}
          onSaved={handleCreateFromRangeSaved}
        />
      )}

      {/* Modale de création de réservation depuis une sous-plage bloquée */}
      {convertBlockRange && (
        <ReservationFormModal
          mode="create"
          seasons={seasons}
          cleaningFee={cleaningFee}
          blockedDates={expandedBlockedDates}
          initialDates={{ check_in: convertBlockRange.check_in, check_out: convertBlockRange.check_out }}
          convertBlockedDateId={convertBlockRange.blockId}
          onClose={() => setConvertBlockRange(null)}
          onSaved={handleConvertBlockRangeSaved}
        />
      )}
    </div>
  );
}
