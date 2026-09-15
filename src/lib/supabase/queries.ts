import { createClient, createAdminClient } from './server'
import type {
  BlockedDate,
  Reservation,
  ReservationInsert,
  ReservationStatus,
  Season,
  SupabaseResponse,
} from './types'

// --- Dates bloquées ---

// Lecture publique — utilise le client standard (RLS autorise SELECT)
export async function getBlockedDates(): Promise<SupabaseResponse<BlockedDate[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .order('date', { ascending: true })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// --- Saisons ---

// Lecture publique — filtre par année calendaire
export async function getSeasons(year: number): Promise<SupabaseResponse<Season[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .gte('start_date', `${year}-01-01`)
    .lte('end_date', `${year}-12-31`)
    .order('start_date', { ascending: true })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// --- Réservations ---

// Insert public — statut forcé à 'pending' pour toute nouvelle réservation
export async function createReservation(
  data: Omit<ReservationInsert, 'status'>,
): Promise<SupabaseResponse<Reservation>> {
  const supabase = await createClient()

  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({ ...data, status: 'pending' })
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: reservation, error: null }
}

// Admin uniquement — liste toutes les réservations sans restriction RLS
export async function getReservations(): Promise<SupabaseResponse<Reservation[]>> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('check_in', { ascending: true })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

// Admin uniquement — confirmer ou annuler une réservation
export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
): Promise<SupabaseResponse<Reservation>> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('reservations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
