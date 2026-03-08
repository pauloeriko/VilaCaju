import type { Metadata } from "next";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, locales } from "@/lib/i18n/config";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import RoomPlan from "@/components/villa/RoomPlan";
import AmenityGrid from "@/components/villa/AmenityGrid";
import VillaCarousel from "@/components/villa/VillaCarousel";

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
    title: `${dict.villa.pageTitle} | Vila Caju`,
    alternates: {
      languages: { fr: "/fr/villa", en: "/en/villa", pt: "/pt/villa" },
    },
  };
}

export default async function VillaPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      {/* Page hero */}
      <section className="relative h-[50vh] flex items-end overflow-hidden">
        <Image
          src="/images/villa-facade-entree-lumiere-doree.png"
          alt={dict.villa.pageTitle}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 pb-12 w-full">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-white">
            {dict.villa.pageTitle}
          </h1>
        </div>
      </section>

      {/* Introduction — texte centré au-dessus du carousel */}
      <SectionWrapper>
        <div className="max-w-2xl mx-auto text-center mb-10">
          <p className="text-lg text-charcoal-700 leading-relaxed mb-6">
            {dict.villa.intro}
          </p>
          <div className="inline-flex items-center gap-2 bg-terracotta-50 text-terracotta-600 font-semibold px-5 py-2.5 rounded-soft text-sm">
            {dict.villa.capacity}
          </div>
        </div>
        <VillaCarousel />
      </SectionWrapper>

      {/* Room plan */}
      <SectionWrapper className="bg-sand-100">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-10 text-center">
          {dict.villa.roomsTitle}
        </h2>
        <RoomPlan lang={lang as Locale} />
      </SectionWrapper>

      {/* Amenities */}
      <SectionWrapper>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-10 text-center">
          {dict.villa.amenitiesTitle}
        </h2>
        <AmenityGrid lang={lang as Locale} />
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper>
        <div className="bg-sand-200 rounded-softer p-10 md:p-14 text-center">
          <h3 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-6">
            {dict.villa.cta}
          </h3>
          <Button href={`/${lang}/reserver`} variant="primary" size="lg">
            {dict.villa.ctaButton}
          </Button>
        </div>
      </SectionWrapper>
    </>
  );
}
