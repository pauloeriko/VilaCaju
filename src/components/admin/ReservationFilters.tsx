"use client";

import { useState, useMemo, useCallback } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import type { Reservation, ReservationStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

type SortField = "check_in" | "created_at" | "total_price";
type SortDir = "asc" | "desc";

interface ReservationFiltersProps {
  reservations: Reservation[];
  onFiltered: (filtered: Reservation[]) => void;
}

const STATUS_OPTIONS: { value: ReservationStatus | "all"; label: string }[] = [
  { value: "all",       label: "Tous" },
  { value: "pending",   label: "En attente" },
  { value: "confirmed", label: "Confirmées" },
  { value: "cancelled", label: "Annulées" },
];

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: "check_in",    label: "Check-in" },
  { value: "created_at",  label: "Date création" },
  { value: "total_price", label: "Montant" },
];

export default function ReservationFilters({ reservations, onFiltered }: ReservationFiltersProps) {
  const [search, setSearch]     = useState("");
  const [status, setStatus]     = useState<ReservationStatus | "all">("all");
  const [sortBy, setSortBy]     = useState<SortField>("check_in");
  const [sortDir, setSortDir]   = useState<SortDir>("asc");
  const [showFilters, setShowFilters] = useState(false);

  const applyFilters = useCallback(() => {
    let result = [...reservations];

    // Recherche texte
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.guest_name.toLowerCase().includes(q) ||
          r.guest_email.toLowerCase().includes(q) ||
          (r.guest_phone?.toLowerCase().includes(q)),
      );
    }

    // Filtre statut
    if (status !== "all") {
      result = result.filter((r) => r.status === status);
    }

    // Tri
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "total_price") {
        cmp = a.total_price - b.total_price;
      } else {
        cmp = a[sortBy].localeCompare(b[sortBy]);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [reservations, search, status, sortBy, sortDir]);

  const filtered = useMemo(() => {
    const result = applyFilters();
    onFiltered(result);
    return result;
  }, [applyFilters, onFiltered]);

  const hasActiveFilters = search.trim() !== "" || status !== "all";

  function resetFilters() {
    setSearch("");
    setStatus("all");
    setSortBy("check_in");
    setSortDir("asc");
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Barre de recherche */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou téléphone..."
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2.5 border rounded-lg text-sm font-medium transition-colors",
            showFilters || hasActiveFilters
              ? "border-terracotta-300 bg-terracotta-50 text-terracotta-700"
              : "border-gray-200 text-gray-600 hover:bg-gray-50",
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
        </button>
      </div>

      {/* Panneau filtres */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Statut */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium">Statut :</span>
            <div className="flex gap-1">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                    status === opt.value
                      ? "bg-terracotta-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tri */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs text-gray-500 font-medium">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="px-2 py-1 border border-gray-200 rounded-lg text-xs bg-white"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortDir((d) => d === "asc" ? "desc" : "asc")}
              className="p-1 rounded hover:bg-gray-100 text-gray-500 transition-colors"
              title={sortDir === "asc" ? "Croissant" : "Décroissant"}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-terracotta-500 hover:text-terracotta-600 underline"
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* Résultat count */}
      {hasActiveFilters && (
        <p className="text-xs text-gray-400">
          {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
