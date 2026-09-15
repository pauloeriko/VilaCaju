import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Échange le code de récupération envoyé par email contre une session,
// puis redirige vers le formulaire de nouveau mot de passe. Si le code
// est absent ou invalide, la page de reset affichera l'erreur au moment
// de l'appel à updateUser (session absente).
export async function GET(
  request: Request,
  { params }: { params: Promise<{ lang: string }> },
): Promise<NextResponse> {
  const { lang } = await params;
  const code = new URL(request.url).searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(
    new URL(`/${lang}/auth/reset-password`, request.url),
  );
}
