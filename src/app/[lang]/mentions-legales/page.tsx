import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, locales } from "@/lib/i18n/config";
import SectionWrapper from "@/components/ui/SectionWrapper";

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
  return { title: `${dict.legal.mentionsTitle} | Vila Caju` };
}

export default async function MentionsLegalesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <SectionWrapper>
      <div className="max-w-2xl mx-auto prose prose-charcoal">
        <h1 className="font-heading text-4xl font-bold text-charcoal-800 mb-2">{dict.legal.mentionsTitle}</h1>
        <p className="text-charcoal-700/50 text-sm mb-10">{dict.legal.lastUpdated} : février 2026</p>

        <h2 className="font-heading text-xl font-semibold text-charcoal-800 mt-8 mb-3">Éditeur du site</h2>
        <p className="text-charcoal-700/70 text-sm leading-relaxed">
          Vila Caju — Location saisonnière de luxe<br />
          Pontal de Maceió, Flexeiras, Alagoas, Brasil<br />
          Email : contact@vilacaju.com<br />
          WhatsApp : +55 82 99999-9999
        </p>

        <h2 className="font-heading text-xl font-semibold text-charcoal-800 mt-8 mb-3">Hébergement</h2>
        <p className="text-charcoal-700/70 text-sm leading-relaxed">
          Vercel Inc.<br />
          440 N Barranca Ave #4133, Covina, CA 91723, USA<br />
          <a href="https://vercel.com" className="text-terracotta-500">vercel.com</a>
        </p>

        <h2 className="font-heading text-xl font-semibold text-charcoal-800 mt-8 mb-3">Propriété intellectuelle</h2>
        <p className="text-charcoal-700/70 text-sm leading-relaxed">
          L&apos;ensemble du contenu de ce site (textes, images, graphismes) est protégé par le droit d&apos;auteur.
          Toute reproduction sans autorisation écrite est interdite.
        </p>

        <h2 className="font-heading text-xl font-semibold text-charcoal-800 mt-8 mb-3">Données personnelles</h2>
        <p className="text-charcoal-700/70 text-sm leading-relaxed">
          Les données collectées via le formulaire de réservation (nom, email, téléphone) sont utilisées uniquement
          pour traiter votre demande. Elles ne sont jamais cédées à des tiers. Conformément au RGPD, vous disposez
          d&apos;un droit d&apos;accès, de rectification et de suppression en contactant contact@vilacaju.com.
        </p>

        <h2 className="font-heading text-xl font-semibold text-charcoal-800 mt-8 mb-3">Cookies</h2>
        <p className="text-charcoal-700/70 text-sm leading-relaxed">
          Ce site utilise des cookies techniques nécessaires à son fonctionnement et des cookies de préférence
          (langue, devise). Aucun cookie publicitaire ou de tracking tiers n&apos;est déposé sans votre consentement.
        </p>
      </div>
    </SectionWrapper>
  );
}
