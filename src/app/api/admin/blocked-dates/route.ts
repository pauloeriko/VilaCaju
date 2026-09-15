import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  date_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  date_end:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason:     z.string().max(200).optional(),
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
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const { date_start, date_end, reason } = parsed.data;

  if (date_start >= date_end) {
    return NextResponse.json(
      { error: "date_start doit être strictement antérieure à date_end" },
      { status: 400 },
    );
  }

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("blocked_dates")
    .insert({ date_start, date_end, reason: reason ?? "Manuel", source: "manual" })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/admin/blocked-dates]", error.message);
    return NextResponse.json({ error: "Impossible de créer la date bloquée." }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
