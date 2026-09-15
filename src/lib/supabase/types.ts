// Types TypeScript pour les 3 tables Supabase de Vila Caju

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled'

export type Reservation = {
  id: string
  created_at: string
  updated_at: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  guest_country: string | null
  check_in: string              // format ISO date : YYYY-MM-DD
  check_out: string             // format ISO date : YYYY-MM-DD
  guests_count: number
  total_price: number
  price_per_night: number | null
  season_id: string | null
  season_snapshot: string | null
  status: ReservationStatus
  message: string | null
  whatsapp_notified: boolean
  whatsapp_notified_at: string | null
}

export type ReservationInsert = Omit<Reservation, 'id' | 'created_at' | 'updated_at' | 'whatsapp_notified' | 'whatsapp_notified_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
  status?: ReservationStatus
}

export type BlockedDate = {
  id: string
  created_at: string
  date_start: string        // format ISO date : YYYY-MM-DD
  date_end: string          // format ISO date : YYYY-MM-DD
  reason: string | null
  source: string | null
  reservation_id: string | null
  ical_uid: string | null
}

export type SeasonName = 'low' | 'mid' | 'high' | 'peak' | 'closed'

export type Season = {
  id: string
  created_at: string
  name: SeasonName
  start_month: number     // 1-12 — la saison se répète chaque année
  start_day: number       // 1-31
  end_month: number       // 1-12
  end_day: number         // 1-31
  price_per_night: number
  min_nights: number
}

export type SeasonInsert = Omit<Season, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type SeasonUpdate = Partial<Omit<Season, 'id' | 'created_at'>>

export type Settings = {
  id: number
  cleaning_fee: number
  eur_rate: number
  whatsapp_number: string
  updated_at: string
}

export type SettingsUpdate = Partial<Pick<Settings, 'cleaning_fee' | 'eur_rate' | 'whatsapp_number'>>

// Type utilitaire pour les réponses Supabase
export type SupabaseResponse<T> = {
  data: T | null
  error: string | null
}
