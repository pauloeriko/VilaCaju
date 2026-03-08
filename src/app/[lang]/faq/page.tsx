import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, locales } from "@/lib/i18n/config";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import FaqPageClient from "@/components/faq/FaqPageClient";

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
    title: `${dict.faq.pageTitle} | Vila Caju`,
    alternates: {
      languages: { fr: "/fr/faq", en: "/en/faq", pt: "/pt/faq" },
    },
  };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <>
      {/* FAQ accordion par catégorie — centré */}
      <SectionWrapper className="pt-32">
        <div className="max-w-2xl mx-auto">
          <FaqPageClient lang={lang as Locale} dict={dict.faq} />
        </div>
      </SectionWrapper>

      {/* CTA contact */}
      <SectionWrapper className="bg-sand-100">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-14 h-14 rounded-full bg-terracotta-100 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-7 h-7 text-terracotta-500" />
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal-800 mb-3">
            {dict.faq.cta}
          </h2>
          <Button href={`/${lang}/contact`} variant="primary" size="lg">
            {dict.faq.ctaButton}
          </Button>
        </div>
      </SectionWrapper>
    </>
  );
}
