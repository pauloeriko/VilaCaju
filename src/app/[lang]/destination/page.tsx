import type { Metadata } from "next";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plane, MapPin } from "lucide-react";
import {
  Waves, Fish, Sailboat, UtensilsCrossed, TreePalm, Sunset, Wind,
} from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, locales } from "@/lib/i18n/config";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import { activities } from "@/data/destination";

const iconMap: Record<string, React.ElementType> = {
  Waves, Fish, Sailboat, UtensilsCrossed, TreePalm, Sunset, Wind,
};

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
    title: `${dict.destination.pageTitle} | Vila Caju`,
    alternates: {
      languages: {
        fr: "/fr/destination",
        en: "/en/destination",
        pt: "/pt/destination",
      },
    },
  };
}

export default async function DestinationPage({
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
          src="/images/villa-piscine-terrasse-mer-grand-angle.jpg"
          alt={dict.destination.pageTitle}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/60 to-transparent" />
        <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8 pb-12 w-full">
          <div className="inline-flex items-center gap-2 bg-ocean-500/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            {dict.destination.kitesurfBadge}
          </div>
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-white">
            {dict.destination.pageTitle}
          </h1>
          <p className="text-sand-200 text-lg mt-2 font-body">
            {dict.destination.subtitle}
          </p>
        </div>
      </section>

      {/* Introduction */}
      <SectionWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lg text-charcoal-700 leading-relaxed">
              {dict.destination.intro}
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-softer overflow-hidden shadow-natural-lg">
            <Image
              src="/images/destination-kitesurf-phare-pontal.jpg"
              alt="Pontal de Maceió — kitesurf"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </SectionWrapper>

      {/* Activities */}
      <SectionWrapper className="bg-sand-100">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-10 text-center">
          {dict.destination.activitiesTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => {
            const Icon = iconMap[activity.icon] || Waves;
            return (
              <div
                key={index}
                className="card-organic overflow-hidden"
              >
                <div className="relative h-44 w-full">
                  <Image
                    src={activity.image}
                    alt={activity.title[lang as Locale]}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-ocean-400" />
                    <h3 className="font-heading text-lg font-semibold text-charcoal-800">
                      {activity.title[lang as Locale]}
                    </h3>
                  </div>
                  <p className="text-sm text-charcoal-700/70 leading-relaxed">
                    {activity.description[lang as Locale]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* Getting there */}
      <SectionWrapper>
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-8 text-center">
          {dict.destination.gettingThereTitle}
        </h2>
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-4 card-organic p-5">
            <div className="w-10 h-10 rounded-full bg-ocean-50 flex items-center justify-center shrink-0">
              <Plane className="w-5 h-5 text-ocean-400" />
            </div>
            <p className="text-charcoal-700">{dict.destination.airport}</p>
          </div>
          <div className="flex items-center gap-4 card-organic p-5">
            <div className="w-10 h-10 rounded-full bg-terracotta-50 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-terracotta-400" />
            </div>
            <p className="text-charcoal-700">{dict.destination.transfer}</p>
          </div>
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper>
        <div className="bg-sand-200 rounded-softer p-10 md:p-14 text-center">
          <h3 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-6">
            {dict.destination.cta}
          </h3>
          <Button href={`/${lang}/reserver`} variant="primary" size="lg">
            {dict.nav.bookCta}
          </Button>
        </div>
      </SectionWrapper>
    </>
  );
}
