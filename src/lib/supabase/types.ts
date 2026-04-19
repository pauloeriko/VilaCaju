// Types TypeScript pour les 3 tables Supabase de Vila Caju

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled'

export type Reservation = {
  id: string
  created_at: string
  updated_at: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  check_in: string        // format ISO date : YYYY-MM-DD
  check_out: string       // format ISO date : YYYY-MM-DD
  guests_count: number
  total_price: number
  status: ReservationStatus
  notes: string | null
  stripe_payment_intent_id: string | null
}

export type ReservationInsert = Omit<Reservation, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
  status?: ReservationStatus
}

export type BlockedDate = {
  id: string
  created_at: string
  date: string            // format ISO date : YYYY-MM-DD
  reason: string | null   // ex: "maintenance", "propriétaire"
}

export type SeasonName = 'low' | 'high' | 'peak' | 'closed'

export type Season = {
  id: string
  created_at: string
  name: SeasonName
  start_date: string      // format ISO date : YYYY-MM-DD
  end_date: string        // format ISO date : YYYY-MM-DD
  price_per_night: number
  minimum_nights: number
}

// Type utilitaire pour les réponses Supabase
export type SupabaseResponse<T> = {
  data: T | null
  error: string | null
}
