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

  // ── 3. Prix des saisons ────────────────────────────────────────────────
  const priceCards = (
    <SectionWrapper>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PriceCard
          title={dict.rates.lowSeason}
          seasonType="low"
          periods={[
            {
              dates:
                lang === "fr"
                  ? "26 Fév – 31 Mai"
                  : lang === "pt"
                  ? "26 Fev – 31 Mai"
                  : "Feb 26 – May 31",
              label:
                lang === "fr"
                  ? "Mars, Avril, Mai"
                  : lang === "pt"
                  ? "Março, Abril, Maio"
                  : "March, April, May",
            },
            {
              dates:
                lang === "fr"
                  ? "Août – Novembre"
                  : lang === "pt"
                  ? "Agosto – Novembro"
                  : "August – November",
              label:
                lang === "fr"
                  ? "4 mois consécutifs"
                  : lang === "pt"
                  ? "4 meses consecutivos"
                  : "4 consecutive months",
            },
          ]}
          pricePerNight={2200}
          minStay={2}
          lang={lang as Locale}
          perNightLabel={dict.rates.perNight}
          minStayLabel={dict.rates.minStay}
          nightsLabel={dict.rates.nights}
        />
        <PriceCard
          title={dict.rates.midSeason}
          seasonType="mid"
          periods={[
            {
              dates:
                lang === "fr"
                  ? "11 Jan – 9 Fév"
                  : lang === "pt"
                  ? "11 Jan – 9 Fev"
                  : "Jan 11 – Feb 9",
              label:
                lang === "fr"
                  ? "Après le Réveillon"
                  : lang === "pt"
                  ? "Após o Réveillon"
                  : "After New Year",
            },
            {
              dates:
                lang === "fr" ? "Juin" : lang === "pt" ? "Junho" : "June",
              label:
                lang === "fr"
                  ? "Mois entier"
                  : lang === "pt"
                  ? "Mês inteiro"
                  : "Full month",
            },
          ]}
          pricePerNight={3000}
          minStay={2}
          lang={lang as Locale}
          perNightLabel={dict.rates.perNight}
          minStayLabel={dict.rates.minStay}
          nightsLabel={dict.rates.nights}
        />
        <PriceCard
          title={dict.rates.highSeason}
          seasonType="high"
          periods={[
            {
              dates:
                lang === "fr"
                  ? "20 Déc – 10 Jan"
                  : lang === "pt"
                  ? "20 Dez – 10 Jan"
                  : "Dec 20 – Jan 10",
              label:
                lang === "fr"
                  ? "Réveillon & Nouvel An"
                  : lang === "pt"
                  ? "Réveillon & Ano Novo"
                  : "New Year's Eve & Day",
            },
            {
              dates:
                lang === "fr"
                  ? "10 – 25 Fév"
                  : lang === "pt"
                  ? "10 – 25 Fev"
                  : "Feb 10 – 25",
              label:
                lang === "fr"
                  ? "Carnaval"
                  : lang === "pt"
                  ? "Carnaval"
                  : "Carnival",
            },
            {
              dates:
                lang === "fr"
                  ? "1 – 31 Juillet"
                  : lang === "pt"
                  ? "1 – 31 Julho"
                  : "July 1 – 31",
              label:
                lang === "fr"
                  ? "Vacances scolaires"
                  : lang === "pt"
                  ? "Férias escolares"
                  : "School holidays",
            },
          ]}
          pricePerNight={3800}
          minStay={3}
          lang={lang as Locale}
          perNightLabel={dict.rates.perNight}
          minStayLabel={dict.rates.minStay}
          nightsLabel={dict.rates.nights}
        />
        <PriceCard
          title={dict.rates.closedSeason}
          seasonType="closed"
          periods={[
            {
              dates:
                lang === "fr"
                  ? "1 – 19 Décembre"
                  : lang === "pt"
                  ? "1 – 19 Dezembro"
                  : "December 1 – 19",
              label:
                lang === "fr"
                  ? "Entretien annuel"
                  : lang === "pt"
                  ? "Manutenção anual"
                  : "Annual maintenance",
            },
          ]}
          pricePerNight={0}
          minStay={0}
          lang={lang as Locale}
          perNightLabel={dict.rates.perNight}
          minStayLabel={dict.rates.minStay}
          nightsLabel={dict.rates.nights}
        />
      </div>
    </SectionWrapper>
  );

  // ── 5. Conditions de paiement ──────────────────────────────────────────
  const paymentSection = (
    <SectionWrapper>
      <PaymentSection lang={lang as Locale} dict={dict.rates} />
    </SectionWrapper>
  );

  // ── 6. Politique d'annulation ──────────────────────────────────────────
  const cancellationSection = (
    <SectionWrapper className="bg-sand-50">
      <CancellationSection lang={lang as Locale} dict={dict.rates} />
    </SectionWrapper>
  );

  // ── 7. FAQ ─────────────────────────────────────────────────────────────
  const faqSection = (
    <SectionWrapper>
      <FaqSection lang={lang as Locale} dict={dict.rates} />
    </SectionWrapper>
  );

  // ── 8. CTA ─────────────────────────────────────────────────────────────
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

      {/* Sections coordonnées (calendriers + calculateur) + reste de la page */}
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
