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
  return { title: `${dict.legal.privacyTitle} | Vila Caju` };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <SectionWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl font-bold text-charcoal-800 mb-2">{dict.legal.privacyTitle}</h1>
        <p className="text-charcoal-700/50 text-sm mb-10">{dict.legal.lastUpdated} : février 2026</p>

        <div className="space-y-8 text-charcoal-700/70 text-sm leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">Données collectées</h2>
            <p>Lors de votre demande de réservation, nous collectons : nom complet, adresse email, numéro de téléphone, dates de séjour et nombre de voyageurs. Ces données sont strictement nécessaires au traitement de votre réservation.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">Utilisation des données</h2>
            <p>Vos données sont utilisées exclusivement pour : traiter votre demande de réservation, vous envoyer une confirmation de réservation, vous adresser des rappels liés à votre séjour (solde, livret d&apos;accueil).</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">Conservation</h2>
            <p>Vos données sont conservées pendant 3 ans à compter de votre dernier séjour, conformément aux obligations comptables et fiscales.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">Vos droits (RGPD)</h2>
            <p>Conformément au Règlement Général sur la Protection des Données (UE 2016/679), vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos données. Pour exercer ces droits : <a href="mailto:contact@vilacaju.com" className="text-terracotta-500">contact@vilacaju.com</a>.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">Transferts de données</h2>
            <p>Vos données peuvent être transmises à nos prestataires (hébergeur Vercel, service de messagerie) dans le cadre strict de la prestation. Aucune cession à des tiers à des fins commerciales n&apos;est effectuée.</p>
          </section>
        </div>
      </div>
    </SectionWrapper>
  );
}
