import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createReservation, isRangeBlocked, getSettings } from '@/lib/supabase/queries'
import { notifyOwnerWhatsApp } from '@/lib/whatsapp'

const reservationSchema = z
  .object({
    guest_name: z.string().min(2, 'Nom trop court'),
    guest_email: z.string().email('Email invalide'),
    guest_phone: z.string().min(5, 'Téléphone invalide'),
    check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
    check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide'),
    guests_count: z.number().int().min(1).max(17),
    total_price: z.number().min(0),
    price_per_night: z.number().min(0).optional(),
    season_id: z.string().optional(),
    guest_country: z.string().optional(),
    message: z.string().optional(),
  })
  .refine((data) => data.check_out > data.check_in, {
    message: "La date de départ doit être après la date d'arrivée",
    path: ['check_out'],
  })

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 })
  }

  const parsed = reservationSchema.safeParse(body)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Données invalides'
    return NextResponse.json({ error: firstError }, { status: 422 })
  }

  const { data: blocked, error: availabilityError } = await isRangeBlocked(
    parsed.data.check_in,
    parsed.data.check_out,
  )

  if (availabilityError) {
    console.error('[POST /api/reservations] Erreur de vérification de disponibilité:', availabilityError)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des disponibilités' },
      { status: 500 },
    )
  }

  if (blocked) {
    return NextResponse.json(
      { error: 'Ces dates ne sont plus disponibles. Merci de choisir une autre période.' },
      { status: 409 },
    )
  }

  const { data: reservation, error } = await createReservation({
    ...parsed.data,
    guest_country: parsed.data.guest_country ?? null,
    message:       parsed.data.message       ?? null,
    price_per_night: parsed.data.price_per_night ?? null,
    season_id:     parsed.data.season_id     ?? null,
    season_snapshot: null,
  })

  if (error || !reservation) {
    console.error('[POST /api/reservations] Supabase error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de la réservation' },
      { status: 500 },
    )
  }

  const { data: settings } = await getSettings()
  const whatsappUrl = notifyOwnerWhatsApp(reservation, settings?.whatsapp_number ?? '')

  return NextResponse.json({
    success: true,
    id: reservation.id,
    whatsappUrl,
  })
}
