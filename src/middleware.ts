import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Detect preferred locale from Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") || "";
  const detectedLocale =
    locales.find((locale) => acceptLanguage.toLowerCase().includes(locale)) ||
    defaultLocale;

  return NextResponse.redirect(
    new URL(`/${detectedLocale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: ["/((?!_next|api|images|icons|favicon.ico).*)"],
};
