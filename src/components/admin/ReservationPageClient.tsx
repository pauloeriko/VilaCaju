"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { Reservation, Season } from "@/lib/supabase/types";
import ReservationFilters from "./ReservationFilters";
import ReservationList from "./ReservationList";
import ReservationFormModal from "./ReservationFormModal";
import { useToast } from "./ToastProvider";

interface ReservationPageClientProps {
  reservations: Reservation[];
  seasons: Season[];
  cleaningFee: number;
  blockedDates: string[];
}

export default function ReservationPageClient({ reservations, seasons, cleaningFee, blockedDates }: ReservationPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [filtered, setFiltered] = useState<Reservation[]>(reservations);
  const [showCreate, setShowCreate] = useState(false);

  const handleFiltered = useCallback((result: Reservation[]) => {
    setFiltered(result);
  }, []);

  function handleSaved() {
    setShowCreate(false);
    toast("success", "Réservation créée");
    router.refresh();
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Ajouter une réservation
        </button>
      </div>

      <ReservationFilters reservations={reservations} onFiltered={handleFiltered} />
      <ReservationList reservations={filtered} seasons={seasons} cleaningFee={cleaningFee} blockedDates={blockedDates} />

      {showCreate && (
        <ReservationFormModal
          mode="create"
          seasons={seasons}
          cleaningFee={cleaningFee}
          blockedDates={blockedDates}
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
