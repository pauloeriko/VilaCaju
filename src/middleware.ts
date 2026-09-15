import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { locales, defaultLocale } from "@/lib/i18n/config";

// Crée un client Supabase compatible middleware (cookies via request/response, pas next/headers)
function buildSupabaseMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Protection des routes admin ────────────────────────────────────────────
  const adminLocale = locales.find(
    (locale) =>
      pathname === `/${locale}/admin` ||
      pathname.startsWith(`/${locale}/admin/`),
  );

  if (adminLocale) {
    const isLoginPage = pathname.startsWith(`/${adminLocale}/admin/login`);
    const response = NextResponse.next({ request });
    const supabase = buildSupabaseMiddlewareClient(request, response);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !isLoginPage) {
      return NextResponse.redirect(
        new URL(`/${adminLocale}/admin/login`, request.url),
      );
    }

    if (user && isLoginPage) {
      return NextResponse.redirect(
        new URL(`/${adminLocale}/admin`, request.url),
      );
    }

    return response;
  }

  // ── Redirection i18n (logique existante) ───────────────────────────────────
  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (pathnameHasLocale) return NextResponse.next();

  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const detectedLocale =
    locales.find((locale) => acceptLanguage.toLowerCase().includes(locale)) ??
    defaultLocale;

  return NextResponse.redirect(
    new URL(`/${detectedLocale}${pathname}`, request.url),
  );
}

export const config = {
  matcher: ["/((?!_next|api|images|icons|favicon.ico).*)"],
};
