import { pricingConfig } from "./seasons";
import type { SeasonType } from "./types";

// ─── Réservations (à remplacer par une API Supabase) ─────────────────────────
export const BOOKED_DATES = new Set<string>([
  // Mars 2026 — complet
  "2026-03-01", "2026-03-02", "2026-03-03", "2026-03-04", "2026-03-05",
  "2026-03-06", "2026-03-07", "2026-03-08", "2026-03-09", "2026-03-10",
  "2026-03-11", "2026-03-12", "2026-03-13", "2026-03-14", "2026-03-15",
  "2026-03-16", "2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20",
  "2026-03-21", "2026-03-22", "2026-03-23", "2026-03-24", "2026-03-25",
  "2026-03-26", "2026-03-27", "2026-03-28", "2026-03-29", "2026-03-30", "2026-03-31",

  // Avril 2026 — complet
  "2026-04-01", "2026-04-02", "2026-04-03", "2026-04-04", "2026-04-05",
  "2026-04-06", "2026-04-07", "2026-04-08", "2026-04-09", "2026-04-10",
  "2026-04-11", "2026-04-12", "2026-04-13", "2026-04-14", "2026-04-15",
  "2026-04-16", "2026-04-17", "2026-04-18", "2026-04-19", "2026-04-20",
  "2026-04-21", "2026-04-22", "2026-04-23", "2026-04-24", "2026-04-25",
  "2026-04-26", "2026-04-27", "2026-04-28", "2026-04-29", "2026-04-30",

  // Mai 2026 — complet
  "2026-05-01", "2026-05-02", "2026-05-03", "2026-05-04", "2026-05-05",
  "2026-05-06", "2026-05-07", "2026-05-08", "2026-05-09", "2026-05-10",
  "2026-05-11", "2026-05-12", "2026-05-13", "2026-05-14", "2026-05-15",
  "2026-05-16", "2026-05-17", "2026-05-18", "2026-05-19", "2026-05-20",
  "2026-05-21", "2026-05-22", "2026-05-23", "2026-05-24", "2026-05-25",
  "2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29", "2026-05-30", "2026-05-31",

  // Juillet 2026 — 21, 22, 23, 24, 25 + 31
  "2026-07-21", "2026-07-22", "2026-07-23", "2026-07-24", "2026-07-25", 
  "2026-07-26", "2026-07-27", "2026-07-28", "2026-07-29", "2026-07-30",
  "2026-07-31",

  // Août 2026 — complet
  "2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05",
  "2026-08-06", "2026-08-07", "2026-08-08", "2026-08-09", "2026-08-10",
  "2026-08-11", "2026-08-12", "2026-08-13", "2026-08-14", "2026-08-15",
  "2026-08-16", "2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20",
  "2026-08-21", "2026-08-22", "2026-08-23", "2026-08-24", "2026-08-25",
  "2026-08-26", "2026-08-27", "2026-08-28", "2026-08-29", "2026-08-30", "2026-08-31",

  // Septembre 2026 — 1 + 5, 6, 7
  "2026-09-01",
  "2026-09-05", "2026-09-06", "2026-09-07",

  // Octobre 2026 — 18→31
  "2026-10-18", "2026-10-19", "2026-10-20", "2026-10-21", "2026-10-22",
  "2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26", "2026-10-27",
  "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31",

  // Novembre 2026 — 1, 2, 3, 4, 5, 6 + 20, 21, 22, 23
  "2026-11-01", "2026-11-02", "2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06",
  "2026-11-20", "2026-11-21", "2026-11-22", "2026-11-23",

  // Décembre 2026 — 3, 4, 5, 6
  "2026-12-03", "2026-12-04", "2026-12-05", "2026-12-06",
]);

export function getSeasonForDay(month: number, day: number): SeasonType | null {
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

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Vérifie si la plage de nuitées [checkIn, checkOut[ contient au moins une date
 * non disponible (réservée ou fermeture annuelle).
 */
export function rangeContainsUnavailable(checkIn: string, checkOut: string): boolean {
  const [ciY, ciM, ciD] = checkIn.split("-").map(Number);
  const [coY, coM, coD] = checkOut.split("-").map(Number);
  const current = new Date(ciY, ciM - 1, ciD);
  const end     = new Date(coY, coM - 1, coD);

  // On vérifie chaque nuit du séjour (check-in inclus, check-out exclu)
  while (current < end) {
    const m = current.getMonth() + 1;
    const d = current.getDate();
    const y = current.getFullYear();
    const key = toDateKey(y, m, d);
    if (BOOKED_DATES.has(key)) return true;
    current.setDate(current.getDate() + 1);
  }
  return false;
}
