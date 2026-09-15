import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { defaultLocale } from "@/lib/i18n/config";

export async function GET(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const origin = new URL(request.url).origin;
  return NextResponse.redirect(
    new URL(`/${defaultLocale}/admin/login`, origin),
  );
}
