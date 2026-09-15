import { getReservations, getBlockedDates, getAllSeasons, getSettings } from "@/lib/supabase/queries";
import { expandBlockedRanges } from "@/lib/supabase/utils";
import AdminCalendar from "@/components/admin/AdminCalendar";
import ReservationPageClient from "@/components/admin/ReservationPageClient";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const [reservationsResult, blockedDatesResult, seasonsResult, settingsResult] = await Promise.all([
    getReservations(),
    getBlockedDates(),
    getAllSeasons(),
    getSettings(),
  ]);
  const reservations = reservationsResult.data ?? [];
  const blockedDates = blockedDatesResult.data ?? [];
  const seasons = seasonsResult.data ?? [];
  const cleaningFee = settingsResult.data?.cleaning_fee ?? 0;
  const expandedBlockedDates = expandBlockedRanges(blockedDates);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-10">
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Réservations</h1>
          <p className="text-sm text-gray-500">Calendrier et suivi de toutes les demandes de réservation</p>
        </div>
        <AdminCalendar
          reservations={reservations}
          blockedDates={blockedDates}
          expandedBlockedDates={expandedBlockedDates}
          seasons={seasons}
          cleaningFee={cleaningFee}
        />
      </div>

      <ReservationPageClient
        reservations={reservations}
        seasons={seasons}
        cleaningFee={cleaningFee}
        blockedDates={expandedBlockedDates}
      />
    </div>
  );
}
