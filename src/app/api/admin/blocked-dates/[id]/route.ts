import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { splitBlockedDate } from "@/lib/supabase/queries";

const patchSchema = z.object({
  date_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  date_end:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// Débloque uniquement la sous-plage [date_start, date_end) d'un blocage manuel,
// en gardant le reste du blocage d'origine intact avant/après.
export async function PATCH(
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
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { date_start, date_end } = parsed.data;

  if (date_start >= date_end) {
    return NextResponse.json(
      { error: "date_start doit être strictement antérieure à date_end" },
      { status: 400 },
    );
  }

  const admin = await createAdminClient();
  const { data: original, error: fetchError } = await admin
    .from("blocked_dates")
    .select("date_start, date_end, source")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    return NextResponse.json({ error: "Blocage introuvable." }, { status: 404 });
  }

  if (original.source !== "manual") {
    return NextResponse.json(
      { error: "Seuls les blocages manuels peuvent être modifiés." },
      { status: 400 },
    );
  }

  if (date_start < original.date_start || date_end > original.date_end) {
    return NextResponse.json(
      { error: "La sous-plage sélectionnée dépasse les limites du blocage." },
      { status: 400 },
    );
  }

  const { error } = await splitBlockedDate(id, date_start, date_end);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

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

  const admin = await createAdminClient();
  const { error } = await admin
    .from("blocked_dates")
    .delete()
    .eq("id", id)
    .eq("source", "manual"); // sécurité : on ne supprime que les dates manuelles

  if (error) {
    console.error("[DELETE /api/admin/blocked-dates/[id]]", error.message);
    return NextResponse.json({ error: "Impossible de supprimer la date bloquée." }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
