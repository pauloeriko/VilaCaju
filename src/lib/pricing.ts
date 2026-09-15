// Moteur de calcul de prix basé sur les saisons Supabase — seule source de vérité des tarifs

import type { Season, SeasonName } from './supabase/types'

export type PriceResult = {
  pricePerNight: number
  totalPrice: number
  nights: number
  season: Season
  minNights: number
}

// Bornes mois/jour d'une période. Un `Season` complet les respecte, mais une
// période candidate pas encore enregistrée aussi (ex: formulaire admin avant
// création) — ce qui permet de réutiliser isDateInSeason pour la détection de
// chevauchement (cf. findOverlappingSeason).
export type SeasonBoundaries = {
  start_month: number
  start_day: number
  end_month: number
  end_day: number
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

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
}

// Une saison se répète chaque année (mois/jour uniquement) — gère le cas où elle
// chevauche le 31 décembre (ex: 16 Déc → 28 Fév).
// `year` (optionnel) ne sert qu'à gérer le 29 février : une saison qui se termine
// le 28 février représente "jusqu'à la fin février", pas littéralement "jusqu'au
// 28e jour" — elle couvre donc aussi le 29 février des années bissextiles.
export function isDateInSeason(month: number, day: number, s: SeasonBoundaries, year?: number): boolean {
  const wraps = s.start_month > s.end_month || (s.start_month === s.end_month && s.start_day > s.end_day)
  const afterStart = month > s.start_month || (month === s.start_month && day >= s.start_day)
  const isLeapDayAtEndOfFebruarySeason =
    month === 2 && day === 29 && s.end_month === 2 && s.end_day === 28 && !!year && isLeapYear(year)
  const beforeEnd =
    month < s.end_month || (month === s.end_month && day <= s.end_day) || isLeapDayAtEndOfFebruarySeason

  return wraps ? (afterStart || beforeEnd) : (afterStart && beforeEnd)
}

// Retourne la saison couvrant une date donnée (YYYY-MM-DD), ou null si aucune ne la couvre.
// Utilisé pour le calcul de prix (par nuit) et pour l'affichage du calendrier de disponibilité,
// afin que les deux s'appuient sur la même source de vérité (table Supabase `seasons`).
// En cas de chevauchement entre plusieurs périodes pour la même date (normalement
// empêché à la création/édition, cf. findOverlappingSeason, mais on reste défensif
// ici en cas de données existantes ou de modification directe en base), retient
// celle au tarif le plus élevé plutôt que la première trouvée dans le tableau.
export function getSeasonForDate(dateStr: string, seasons: Season[]): Season | null {
  const [yearStr, monthStr, dayStr] = dateStr.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)

  const matches = seasons.filter((s) => isDateInSeason(month, day, s, year))
  if (matches.length === 0) return null

  return matches.reduce((max, s) => (s.price_per_night > max.price_per_night ? s : max))
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

// --- Validation anti-chevauchement (utilisée par les routes admin /api/admin/seasons) ---

// Vérifie si deux périodes (récurrentes, mois/jour) partagent au moins un jour.
function periodsOverlap(a: SeasonBoundaries, b: SeasonBoundaries): boolean {
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 31; day++) {
      if (isDateInSeason(month, day, a) && isDateInSeason(month, day, b)) {
        return true
      }
    }
  }
  return false
}

// Retourne la première saison existante qui chevauche la période candidate, ou
// null si aucune. `excludeId` permet à une saison de s'exclure elle-même lors
// d'une édition (PUT) — sans ça, elle chevaucherait toujours sa propre période.
export function findOverlappingSeason(
  candidate: SeasonBoundaries,
  seasons: Season[],
  excludeId?: string,
): Season | null {
  return seasons.find((s) => s.id !== excludeId && periodsOverlap(candidate, s)) ?? null
}

const SEASON_LABELS_FR: Record<SeasonName, string> = {
  low: 'Basse saison',
  mid: 'Moyenne saison',
  high: 'Haute saison',
  peak: 'Très haute saison',
  closed: 'Fermé',
}

function formatMonthDaySlash(month: number, day: number): string {
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`
}

// Message d'erreur (français, destiné à l'admin) décrivant un chevauchement
// détecté par findOverlappingSeason — identifie clairement la période en conflit.
export function formatOverlapErrorMessage(conflict: Season): string {
  const label = SEASON_LABELS_FR[conflict.name]
  const start = formatMonthDaySlash(conflict.start_month, conflict.start_day)
  const end = formatMonthDaySlash(conflict.end_month, conflict.end_day)
  return `Cette période chevauche "${label}" du ${start} au ${end}.`
}
