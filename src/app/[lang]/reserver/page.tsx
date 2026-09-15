import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, locales } from "@/lib/i18n/config";
import { getBlockedDates, getAllSeasons, getSettings } from "@/lib/supabase/queries";
import { expandBlockedRanges } from "@/lib/supabase/utils";
import BookingForm from "@/components/booking/BookingForm";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  return {
    title: `${dict.booking.pageTitle} | Vila Caju`,
    alternates: {
      languages: {
        fr: "/fr/reserver",
        en: "/en/reserver",
        pt: "/pt/reserver",
      },
    },
  };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const [dict, blockedResult, seasonsResult, settingsResult] = await Promise.all([
    getDictionary(lang as Locale),
    getBlockedDates(),
    getAllSeasons(),
    getSettings(),
  ]);

  const blockedDates = expandBlockedRanges(blockedResult.data ?? []);
  const cleaningFee = settingsResult.data?.cleaning_fee ?? 0;
  const seasons = seasonsResult.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-800 mb-3">
          {dict.booking.pageTitle}
        </h1>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse bg-sand-100 rounded-softer" />}>
        <BookingForm
          lang={lang as Locale}
          dict={dict.booking}
          blockedDates={blockedDates}
          seasons={seasons}
          cleaningFee={cleaningFee}
        />
      </Suspense>
    </div>
  );
}
