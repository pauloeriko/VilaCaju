import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

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
