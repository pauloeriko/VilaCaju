import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAllSeasons, createSeason, updateSeasonsByName } from "@/lib/supabase/queries";

const seasonSchema = z.object({
  name: z.enum(["low", "mid", "high", "peak", "closed"]),
  start_month: z.number().int().min(1).max(12),
  start_day: z.number().int().min(1).max(31),
  end_month: z.number().int().min(1).max(12),
  end_day: z.number().int().min(1).max(31),
  price_per_night: z.number().min(0),
  min_nights: z.number().min(1),
});

const bulkPriceSchema = z.object({
  name: z.enum(["low", "mid", "high", "peak", "closed"]),
  price_per_night: z.number().min(0).optional(),
  min_nights: z.number().min(1).optional(),
});

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const result = await getAllSeasons();
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = seasonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const result = await createSeason(parsed.data);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}

// Met à jour le prix/nuit et/ou les nuits minimum pour TOUTES les périodes
// d'un même type de saison (ex: "high"), en un seul appel.
export async function PATCH(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parsed = bulkPriceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { name, ...updates } = parsed.data;
  const result = await updateSeasonsByName(name, updates);
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ data: result.data });
}
