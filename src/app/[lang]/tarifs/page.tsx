import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, locales } from "@/lib/i18n/config";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import PriceCard from "@/components/pricing/PriceCard";
import CancellationSection from "@/components/pricing/CancellationSection";
import PaymentSection from "@/components/pricing/PaymentSection";
import FaqSection from "@/components/pricing/FaqSection";
import TarifsCalendarSync from "@/components/pricing/TarifsCalendarSync";

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
    title: `${dict.rates.pageTitle} | Vila Caju`,
    alternates: {
      languages: { fr: "/fr/tarifs", en: "/en/tarifs", pt: "/pt/tarifs" },
    },
  };
}

export default async function RatesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  // ── Cartes de prix ────────────────────────────────────────────────────
  const priceCards = (
    <SectionWrapper>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basse saison : Juin + 1 Sep – 15 Oct */}
        <PriceCard
          title={dict.rates.lowSeason}
          seasonType="low"
          periods={[
            { dates: lang === "fr" ? "Juin" : lang === "pt" ? "Junho" : "June" },
            {
              dates:
                lang === "fr"
                  ? "1 Sep – 15 Oct"
                  : lang === "pt"
                  ? "1 Set – 15 Out"
                  : "Sep 1 – Oct 15",
            },
          ]}
          pricePerNight={5400}
          minStay={3}
          lang={lang as Locale}
          perNightLabel={dict.rates.perNight}
          minStayLabel={dict.rates.minStay}
          nightsLabel={dict.rates.nights}
        />

        {/* Moyenne saison : Mars – Mai + Juil – Août + 16 Oct – 15 Déc */}
        <PriceCard
          title={dict.rates.midSeason}
          seasonType="mid"
          periods={[
            {
              dates:
                lang === "fr"
                  ? "Mars – Mai"
                  : lang === "pt"
                  ? "Março – Maio"
                  : "March – May",
            },
            {
              dates:
                lang === "fr"
                  ? "Juillet – Août"
                  : lang === "pt"
                  ? "Julho – Agosto"
                  : "July – August",
            },
            {
              dates:
                lang === "fr"
                  ? "16 Oct – 15 Déc"
                  : lang === "pt"
                  ? "16 Out – 15 Dez"
                  : "Oct 16 – Dec 15",
            },
          ]}
          pricePerNight={6200}
          minStay={3}
          lang={lang as Locale}
          perNightLabel={dict.rates.perNight}
          minStayLabel={dict.rates.minStay}
          nightsLabel={dict.rates.nights}
        />

        {/* Haute saison : 16 Déc – Fin Fév */}
        <PriceCard
          title={dict.rates.highSeason}
          seasonType="high"
          periods={[
            {
              dates:
                lang === "fr"
                  ? "16 Déc – Fin Fév"
                  : lang === "pt"
                  ? "16 Dez – Fim Fev"
                  : "Dec 16 – End Feb",
            },
          ]}
          pricePerNight={8000}
          minStay={3}
          lang={lang as Locale}
          perNightLabel={dict.rates.perNight}
          minStayLabel={dict.rates.minStay}
          nightsLabel={dict.rates.nights}
        />

      </div>
    </SectionWrapper>
  );

  const paymentSection = (
    <SectionWrapper>
      <PaymentSection lang={lang as Locale} dict={dict.rates} />
    </SectionWrapper>
  );

  const cancellationSection = (
    <SectionWrapper className="bg-sand-50">
      <CancellationSection lang={lang as Locale} dict={dict.rates} />
    </SectionWrapper>
  );

  const faqSection = (
    <SectionWrapper>
      <FaqSection lang={lang as Locale} dict={dict.rates} />
    </SectionWrapper>
  );

  const ctaSection = (
    <SectionWrapper>
      <div className="bg-sand-200 rounded-softer p-10 md:p-14 text-center">
        <h3 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-6">
          {dict.rates.cta}
        </h3>
        <Button href={`/${lang}/reserver`} variant="primary" size="lg">
          {dict.nav.bookCta}
        </Button>
      </div>
    </SectionWrapper>
  );

  return (
    <>
      {/* Header */}
      <SectionWrapper>
        <div className="text-center">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-800 mb-4">
            {dict.rates.pageTitle}
          </h1>
          <p className="text-charcoal-700/70 text-lg max-w-2xl mx-auto">
            {dict.rates.subtitle}
          </p>
        </div>
      </SectionWrapper>

      <TarifsCalendarSync
        lang={lang as Locale}
        dict={dict.rates}
        priceCards={priceCards}
        paymentSection={paymentSection}
        cancellationSection={cancellationSection}
        faqSection={faqSection}
        ctaSection={ctaSection}
      />
    </>
  );
}
