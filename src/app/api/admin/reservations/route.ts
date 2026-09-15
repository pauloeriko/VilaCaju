import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createReservation, isRangeBlocked, splitBlockedDate } from "@/lib/supabase/queries";

// Création manuelle d'une réservation depuis l'admin — ex: demande reçue par téléphone.
const bodySchema = z.object({
  guest_name: z.string().min(2, "Nom trop court"),
  guest_email: z.string().email("Email invalide"),
  guest_phone: z.string().min(5, "Téléphone invalide"),
  guest_country: z.string().optional(),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide"),
  guests_count: z.number().int().min(1).max(17),
  total_price: z.number().min(0),
  price_per_night: z.number().min(0).optional(),
  message: z.string().optional(),
  confirmed: z.boolean().optional(),
  // Si présent, ce blocage manuel est remplacé par la réservation créée (meilleur suivi).
  convertBlockedDateId: z.string().optional(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { check_in, check_out, confirmed, convertBlockedDateId, ...rest } = parsed.data;

  if (check_in >= check_out) {
    return NextResponse.json(
      { error: "La date de départ doit être après la date d'arrivée" },
      { status: 400 },
    );
  }

  const { data: blocked, error: availabilityError } = await isRangeBlocked(check_in, check_out, {
    excludeBlockedDateId: convertBlockedDateId,
  });

  if (availabilityError) {
    return NextResponse.json({ error: availabilityError }, { status: 500 });
  }

  if (blocked) {
    return NextResponse.json(
      { error: "Ces dates chevauchent une réservation ou un blocage existant." },
      { status: 409 },
    );
  }

  const result = await createReservation(
    {
      ...rest,
      check_in,
      check_out,
      guest_country: parsed.data.guest_country ?? null,
      message: parsed.data.message ?? null,
      price_per_night: parsed.data.price_per_night ?? null,
      season_id: null,
      season_snapshot: null,
    },
    confirmed ? "confirmed" : "pending",
  );

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  // Le blocage manuel d'origine est réduit au reliquat non couvert par cette
  // réservation (la portion convertie est déjà bloquée par createReservation).
  // Permet de convertir un même blocage en plusieurs réservations, une par une.
  if (convertBlockedDateId) {
    const { error: splitError } = await splitBlockedDate(convertBlockedDateId, check_in, check_out);

    if (splitError) {
      console.error("[POST /api/admin/reservations] Échec de la division du blocage converti:", splitError);
    }
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}
