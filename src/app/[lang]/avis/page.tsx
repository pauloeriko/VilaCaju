import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, locales } from "@/lib/i18n/config";
import { reviews } from "@/data/reviews";
import SectionWrapper from "@/components/ui/SectionWrapper";
import ReviewsGrid from "@/components/reviews/ReviewsGrid";

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
    title: `${dict.reviews.pageTitle} | Vila Caju`,
    alternates: {
      languages: { fr: "/fr/avis", en: "/en/avis", pt: "/pt/avis" },
    },
  };
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      <SectionWrapper>
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-800 mb-4">
            {dict.reviews.pageTitle}
          </h1>
          <p className="text-charcoal-700/70 text-lg max-w-2xl mx-auto">
            {dict.reviews.pageSubtitle}
          </p>

          {/* Note globale */}
          <div className="mt-8 inline-flex items-center gap-3 bg-sand-100 border border-sand-200 rounded-softer px-6 py-3">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-terracotta-400 text-xl">★</span>
              ))}
            </div>
            <span className="font-heading text-2xl font-bold text-charcoal-800">5.0</span>
            <span className="text-charcoal-700/50 text-sm">/ 5 — {reviews.length} {dict.reviews.allReviews}</span>
          </div>
        </div>

        <ReviewsGrid reviews={reviews} lang={lang as Locale} dict={dict.reviews} />
      </SectionWrapper>
    </>
  );
}
