import React from "react";
import Link from "next/link";
import { isValidLocale, type Locale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";

export default async function BookingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!isValidLocale(lang)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Minimal header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-sand-50/80 backdrop-blur-md border-b border-sand-300/50">
        <div className="max-w-6xl mx-auto px-6 md:px-8 flex items-center justify-between h-16">
          <Link
            href={`/${lang}`}
            className="font-heading text-2xl font-semibold text-charcoal-800 hover:text-terracotta-500 transition-colors"
          >
            Vila Caju
          </Link>
          <LanguageSwitcher currentLang={lang as Locale} />
        </div>
      </header>

      <main className="pt-16">{children}</main>
    </div>
  );
}
