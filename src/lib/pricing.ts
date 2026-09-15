// Moteur de calcul de prix basé sur les saisons Supabase — seule source de vérité des tarifs

import type { Season } from './supabase/types'

export type PriceResult = {
  pricePerNight: number
  totalPrice: number
  nights: number
  season: Season
  minNights: number
}

/**
 * Retourne la saison applicable pour une plage de dates.
 * - Si la plage couvre une saison 'closed', retourne cette saison immédiatement.
 * - Si la plage chevauche plusieurs saisons, retourne celle au tarif le plus élevé.
 * - Retourne null si aucune saison ne couvre la plage.
 */
// Formate une Date en YYYY-MM-DD en heure locale (évite le décalage UTC)
function toLocalDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Parse une string YYYY-MM-DD comme date locale (pas UTC minuit)
function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Une saison se répète chaque année (mois/jour uniquement) — gère le cas où elle
// chevauche le 31 décembre (ex: 16 Déc → 28 Fév).
function isDateInSeason(month: number, day: number, s: Season): boolean {
  const wraps = s.start_month > s.end_month || (s.start_month === s.end_month && s.start_day > s.end_day)
  const afterStart = month > s.start_month || (month === s.start_month && day >= s.start_day)
  const beforeEnd = month < s.end_month || (month === s.end_month && day <= s.end_day)

  return wraps ? (afterStart || beforeEnd) : (afterStart && beforeEnd)
}

// Retourne la saison couvrant une date donnée (YYYY-MM-DD), ou null si aucune ne la couvre.
// Utilisé pour le calcul de prix (par nuit) et pour l'affichage du calendrier de disponibilité,
// afin que les deux s'appuient sur la même source de vérité (table Supabase `seasons`).
export function getSeasonForDate(dateStr: string, seasons: Season[]): Season | null {
  const [, monthStr, dayStr] = dateStr.split('-')
  const month = Number(monthStr)
  const day = Number(dayStr)
  return seasons.find((s) => isDateInSeason(month, day, s)) ?? null
}

export function getSeasonForDateRange(
  checkIn: Date,
  checkOut: Date,
  seasons: Season[],
): Season | null {
  const encountered = new Map<string, Season>()

  // Travailler en heure locale pour éviter le décalage UTC (Brésil UTC-3)
  const current = parseLocalDate(toLocalDateStr(checkIn))
  const end     = parseLocalDate(toLocalDateStr(checkOut))

  while (current < end) {
    const season = getSeasonForDate(toLocalDateStr(current), seasons)

    if (season) {
      // Période fermée → blocage immédiat
      if (season.name === 'closed') return season
      encountered.set(season.id, season)
    }

    current.setDate(current.getDate() + 1)
  }

  if (encountered.size === 0) return null

  // Saison avec le tarif le plus élevé
  return Array.from(encountered.values()).reduce((max, s) =>
    s.price_per_night > max.price_per_night ? s : max,
  )
}

/**
 * Calcule le prix total pour une plage de dates.
 * Retourne null si aucune saison ne couvre la plage ou si les dates sont invalides.
 */
export function calculatePrice(
  checkIn: Date,
  checkOut: Date,
  seasons: Season[],
  cleaningFee: number,
): PriceResult | null {
  if (checkOut <= checkIn) return null

  const season = getSeasonForDateRange(checkIn, checkOut, seasons)
  if (!season) return null

  const nights = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  )

  const pricePerNight = season.price_per_night
  const totalPrice = nights * pricePerNight + cleaningFee

  return {
    pricePerNight,
    totalPrice,
    nights,
    season,
    minNights: season.min_nights,
  }
}
