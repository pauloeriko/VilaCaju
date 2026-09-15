import { createClient, createAdminClient } from './server'
import type {
  BlockedDate,
  Reservation,
  ReservationInsert,
  ReservationStatus,
  Season,
  SeasonInsert,
  SeasonName,
  SeasonUpdate,
  Settings,
  SettingsUpdate,
  SupabaseResponse,
} from './types'

// --- Paramètres généraux ---

// Lecture publique — la villa n'a qu'une seule ligne de paramètres (id = 1)
export async function getSettings(): Promise<SupabaseResponse<Settings>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) {
    console.error('[getSettings]', error.message)
    return { data: null, error: 'Impossible de charger les paramètres.' }
  }

  return { data, error: null }
}

// Admin — modifier les paramètres généraux
export async function updateSettings(
  updates: SettingsUpdate,
): Promise<SupabaseResponse<Settings>> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', 1)
    .select()
    .single()

  if (error) {
    console.error('[updateSettings]', error.message)
    return { data: null, error: 'Impossible de mettre à jour les paramètres.' }
  }

  return { data, error: null }
}

// --- Dates bloquées ---

// Lecture publique — utilise le client standard (RLS autorise SELECT)
export async function getBlockedDates(): Promise<SupabaseResponse<BlockedDate[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blocked_dates')
    .select('*')
    .order('date_start', { ascending: true })

  if (error) {
    console.error('[getBlockedDates]', error.message)
    return { data: null, error: 'Impossible de charger les dates bloquées.' }
  }

  return { data, error: null }
}

// Admin — retire une sous-plage d'un blocage manuel et conserve le reliquat
// avant/après sous forme de nouveaux blocages. Utilisé aussi bien pour convertir
// une portion d'un gros blocage (ex: tout le mois d'août) en réservation — seule
// la portion convertie est retirée, le reste demeure bloqué pour la suite — que
// pour un simple déblocage partiel sans création de réservation.
export async function splitBlockedDate(
  blockedDateId: string,
  excludedStart: string,
  excludedEnd: string,
): Promise<SupabaseResponse<null>> {
  const supabase = await createAdminClient()

  const { data: original, error: fetchError } = await supabase
    .from('blocked_dates')
    .select('*')
    .eq('id', blockedDateId)
    .single()

  if (fetchError) {
    console.error('[splitBlockedDate]', fetchError.message)
    return { data: null, error: 'Impossible de récupérer le blocage à diviser.' }
  }

  const remainders: { date_start: string; date_end: string }[] = []
  if (excludedStart > original.date_start) {
    remainders.push({ date_start: original.date_start, date_end: excludedStart })
  }
  if (excludedEnd < original.date_end) {
    remainders.push({ date_start: excludedEnd, date_end: original.date_end })
  }

  const { error: deleteError } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('id', blockedDateId)

  if (deleteError) {
    console.error('[splitBlockedDate]', deleteError.message)
    return { data: null, error: "Impossible de supprimer l'ancien blocage." }
  }

  if (remainders.length > 0) {
    const { error: insertError } = await supabase
      .from('blocked_dates')
      .insert(remainders.map((r) => ({
        date_start: r.date_start,
        date_end: r.date_end,
        reason: original.reason,
        source: 'manual',
      })))

    if (insertError) {
      console.error('[splitBlockedDate]', insertError.message)
      return { data: null, error: 'Impossible de créer le reliquat de blocage.' }
    }
  }

  return { data: null, error: null }
}

// --- Saisons ---

// Lecture publique — les saisons se répètent chaque année (mois/jour), il n'y a
// donc qu'une seule liste à récupérer, jamais filtrée par année.
export async function getAllSeasons(): Promise<SupabaseResponse<Season[]>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .order('start_month', { ascending: true })
    .order('start_day', { ascending: true })

  if (error) {
    console.error('[getAllSeasons]', error.message)
    return { data: null, error: 'Impossible de charger les saisons.' }
  }

  return { data, error: null }
}

// Admin — créer une saison
export async function createSeason(
  data: SeasonInsert,
): Promise<SupabaseResponse<Season>> {
  const supabase = await createAdminClient()

  const { data: season, error } = await supabase
    .from('seasons')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('[createSeason]', error.message)
    return { data: null, error: 'Impossible de créer la saison.' }
  }

  return { data: season, error: null }
}

// Admin — mettre à jour une saison
export async function updateSeason(
  id: string,
  updates: SeasonUpdate,
): Promise<SupabaseResponse<Season>> {
  const supabase = await createAdminClient()

  const { data: season, error } = await supabase
    .from('seasons')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[updateSeason]', error.message)
    return { data: null, error: 'Impossible de mettre à jour la saison.' }
  }

  return { data: season, error: null }
}

// Admin — supprimer une saison
export async function deleteSeason(
  id: string,
): Promise<SupabaseResponse<null>> {
  const supabase = await createAdminClient()

  const { error } = await supabase
    .from('seasons')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteSeason]', error.message)
    return { data: null, error: 'Impossible de supprimer la saison.' }
  }

  return { data: null, error: null }
}

// Admin — met à jour le tarif d'un TYPE de saison (ex: "high") sur toutes ses
// périodes en une fois, pour éviter d'avoir à modifier le même prix plusieurs
// fois quand une saison couvre plusieurs plages de dates dans l'année.
export async function updateSeasonsByName(
  name: SeasonName,
  updates: { price_per_night?: number; min_nights?: number },
): Promise<SupabaseResponse<Season[]>> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('seasons')
    .update(updates)
    .eq('name', name)
    .select()

  if (error) {
    console.error('[updateSeasonsByName]', error.message)
    return { data: null, error: 'Impossible de mettre à jour le tarif de la saison.' }
  }

  return { data, error: null }
}

// --- Réservations ---

// Vérifie si une plage [dateStart, dateEnd[ chevauche un blocage existant
// (date bloquée manuellement, importée, ou posée par une autre réservation).
// Utilisé côté serveur avant toute création/édition de réservation pour empêcher le double-booking.
// `excludeReservationId` permet à une réservation d'ignorer son propre blocage lors d'une édition de dates.
// `excludeBlockedDateId` permet de convertir un blocage manuel en réservation sans qu'il se bloque lui-même.
export async function isRangeBlocked(
  dateStart: string,
  dateEnd: string,
  options?: { excludeReservationId?: string; excludeBlockedDateId?: string },
): Promise<SupabaseResponse<boolean>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('blocked_dates')
    .select('id, reservation_id')
    .lt('date_start', dateEnd)
    .gt('date_end', dateStart)

  if (error) {
    console.error('[isRangeBlocked]', error.message)
    return { data: null, error: 'Impossible de vérifier la disponibilité des dates.' }
  }

  const overlapping = (data ?? []).filter((b) =>
    b.reservation_id !== options?.excludeReservationId &&
    b.id !== options?.excludeBlockedDateId,
  )

  return { data: overlapping.length > 0, error: null }
}

// Insert via service role — la validation Zod dans la Route Handler fait office de garde-fou
// Le client anon + RLS posait des problèmes de contexte dans les Route Handlers
// `initialStatus` permet à l'admin de créer directement une réservation confirmée
// (cas d'une réservation reçue par téléphone déjà actée avec le client).
export async function createReservation(
  data: Omit<ReservationInsert, 'status'>,
  initialStatus: ReservationStatus = 'pending',
): Promise<SupabaseResponse<Reservation>> {
  const supabase = await createAdminClient()

  const { data: reservation, error } = await supabase
    .from('reservations')
    .insert({ ...data, status: initialStatus, whatsapp_notified: false })
    .select()
    .single()

  if (error) {
    console.error('[createReservation]', error.message)
    return { data: null, error: 'Impossible de créer la réservation.' }
  }

  // Pose un blocage lié à cette réservation pour empêcher qu'un autre visiteur
  // réserve les mêmes dates pendant qu'elle est en attente de confirmation.
  // Best-effort : un échec ici ne doit pas faire échouer la réservation elle-même.
  const { error: blockError } = await supabase.from('blocked_dates').insert({
    date_start: reservation.check_in,
    date_end: reservation.check_out,
    reason: 'Réservation en attente',
    source: 'reservation',
    reservation_id: reservation.id,
  })

  if (blockError) {
    console.error('[createReservation] Échec du blocage automatique des dates:', blockError.message)
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
    console.error('[getReservations]', error.message)
    return { data: null, error: 'Impossible de charger les réservations.' }
  }

  return { data, error: null }
}

// Admin uniquement — confirmer une réservation en attente
export async function updateReservationStatus(
  id: string,
  status: Extract<ReservationStatus, 'confirmed'>,
): Promise<SupabaseResponse<Reservation>> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('reservations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[updateReservationStatus]', error.message)
    return { data: null, error: 'Impossible de confirmer la réservation.' }
  }

  return { data, error: null }
}

// Admin uniquement — supprime définitivement une réservation (au lieu de la
// marquer "annulée") et libère les dates bloquées automatiquement posées à sa création.
export async function deleteReservation(id: string): Promise<SupabaseResponse<null>> {
  const supabase = await createAdminClient()

  const { error: unblockError } = await supabase
    .from('blocked_dates')
    .delete()
    .eq('reservation_id', id)

  if (unblockError) {
    console.error('[deleteReservation] Échec de la libération des dates:', unblockError.message)
  }

  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteReservation]', error.message)
    return { data: null, error: 'Impossible de supprimer la réservation.' }
  }

  return { data: null, error: null }
}

export type ReservationEditableFields = Partial<{
  guest_name: string
  guest_email: string
  guest_phone: string | null
  guest_country: string | null
  check_in: string
  check_out: string
  guests_count: number
  total_price: number
  price_per_night: number | null
  message: string | null
}>

// Admin uniquement — modifier les informations d'une réservation existante
// (dates, personnes, prix, coordonnées). Si les dates changent, le blocage
// automatique lié à cette réservation est réaligné pour rester cohérent.
export async function updateReservationDetails(
  id: string,
  updates: ReservationEditableFields,
): Promise<SupabaseResponse<Reservation>> {
  const supabase = await createAdminClient()

  const { data, error } = await supabase
    .from('reservations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[updateReservationDetails]', error.message)
    return { data: null, error: 'Impossible de mettre à jour la réservation.' }
  }

  if ((updates.check_in || updates.check_out) && data.status !== 'cancelled') {
    const { error: syncError } = await supabase
      .from('blocked_dates')
      .update({ date_start: data.check_in, date_end: data.check_out })
      .eq('reservation_id', id)

    if (syncError) {
      console.error('[updateReservationDetails] Échec de la synchronisation du blocage:', syncError.message)
    }
  }

  return { data, error: null }
}
