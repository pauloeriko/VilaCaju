import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  updateReservationStatus,
  updateReservationDetails,
  deleteReservation,
  isRangeBlocked,
} from "@/lib/supabase/queries";

const patchSchema = z.object({
  status: z.literal("confirmed"),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // Vérification de session — double check côté serveur
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const body: unknown = await request.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const result = await updateReservationStatus(id, parsed.data.status);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}

const editSchema = z.object({
  guest_name: z.string().min(2).optional(),
  guest_email: z.string().email().optional(),
  guest_phone: z.string().min(5).nullable().optional(),
  guest_country: z.string().nullable().optional(),
  check_in: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  check_out: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  guests_count: z.number().int().min(1).max(17).optional(),
  total_price: z.number().min(0).optional(),
  price_per_night: z.number().min(0).nullable().optional(),
  message: z.string().nullable().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const body: unknown = await request.json();
  const parsed = editSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  if (parsed.data.check_in && parsed.data.check_out && parsed.data.check_in >= parsed.data.check_out) {
    return NextResponse.json(
      { error: "La date de départ doit être après la date d'arrivée" },
      { status: 400 },
    );
  }

  if (parsed.data.check_in && parsed.data.check_out) {
    const { data: blocked, error: availabilityError } = await isRangeBlocked(
      parsed.data.check_in,
      parsed.data.check_out,
      { excludeReservationId: id },
    );

    if (availabilityError) {
      return NextResponse.json({ error: availabilityError }, { status: 500 });
    }

    if (blocked) {
      return NextResponse.json(
        { error: "Ces nouvelles dates chevauchent une autre réservation ou un blocage existant." },
        { status: 409 },
      );
    }
  }

  const result = await updateReservationDetails(id, parsed.data);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}

// Supprime définitivement la réservation (pas de statut "annulée" conservé).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const result = await deleteReservation(id);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
