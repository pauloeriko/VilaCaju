import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, locales } from "@/lib/i18n/config";
import HeroSection from "@/components/landing/HeroSection";
import GallerySection from "@/components/landing/GallerySection";
import ReviewsSection from "@/components/landing/ReviewsSection";
import UspSection from "@/components/landing/UspSection";
import PricingSection from "@/components/landing/PricingSection";

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
    title: dict.metadata.title,
    description: dict.metadata.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { fr: "/fr", en: "/en", pt: "/pt" },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <HeroSection dict={dict.hero} lang={lang as Locale} />
      <GallerySection dict={dict.gallery} lang={lang as Locale} />
      <PricingSection lang={lang as Locale} dict={{ pricing: dict.pricing, rates: dict.rates }} />
      <ReviewsSection dict={dict.reviews} lang={lang as Locale} />
      <UspSection dict={dict.usp} lang={lang as Locale} />
    </>
  );
}
