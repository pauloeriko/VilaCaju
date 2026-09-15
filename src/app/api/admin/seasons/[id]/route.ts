import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAllSeasons, updateSeason, deleteSeason } from "@/lib/supabase/queries";
import { findOverlappingSeason, formatOverlapErrorMessage } from "@/lib/pricing";

const updateSchema = z.object({
  name: z.enum(["low", "mid", "high", "peak", "closed"]).optional(),
  start_month: z.number().int().min(1).max(12).optional(),
  start_day: z.number().int().min(1).max(31).optional(),
  end_month: z.number().int().min(1).max(12).optional(),
  end_day: z.number().int().min(1).max(31).optional(),
  price_per_night: z.number().min(0).optional(),
  min_nights: z.number().min(1).optional(),
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
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updates = parsed.data;

  const existing = await getAllSeasons();
  if (existing.error) {
    return NextResponse.json({ error: existing.error }, { status: 500 });
  }

  const current = existing.data?.find((s) => s.id === id);
  if (!current) {
    return NextResponse.json({ error: "Saison introuable" }, { status: 404 });
  }

  const candidate = { ...current, ...updates };
  const conflict = findOverlappingSeason(candidate, existing.data ?? [], id);
  if (conflict) {
    return NextResponse.json(
      { error: formatOverlapErrorMessage(conflict) },
      { status: 400 },
    );
  }

  const result = await updateSeason(id, updates);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
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
  const result = await deleteSeason(id);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
