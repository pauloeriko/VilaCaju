import React from "react";
import { notFound } from "next/navigation";
import { isValidLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getSettings } from "@/lib/supabase/queries";
import { CurrencyProvider } from "@/lib/currency/CurrencyContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/ui/CookieBanner";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export default async function LangLayout({
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

  const [dict, settingsResult] = await Promise.all([
    getDictionary(lang as Locale),
    getSettings(),
  ]);

  return (
    <CurrencyProvider eurRate={settingsResult.data?.eur_rate}>
      <Navbar lang={lang as Locale} dict={dict.nav} />
      <main className="min-h-screen pt-16 md:pt-20">{children}</main>
      <Footer lang={lang as Locale} dict={dict.footer} />
      <CookieBanner lang={lang as Locale} dict={dict.cookies} />
    </CurrencyProvider>
  );
}
