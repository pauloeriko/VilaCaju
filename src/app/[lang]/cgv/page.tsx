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
  return { title: `${dict.legal.cgvTitle} | Vila Caju` };
}

export default async function CgvPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);

  return (
    <SectionWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading text-4xl font-bold text-charcoal-800 mb-2">{dict.legal.cgvTitle}</h1>
        <p className="text-charcoal-700/50 text-sm mb-10">{dict.legal.lastUpdated} : février 2026</p>

        <div className="space-y-8 text-charcoal-700/70 text-sm leading-relaxed">
          <section>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">1. Objet</h2>
            <p>Les présentes conditions régissent la location saisonnière de la Vila Caju, propriété privée située à Pontal de Maceió, Alagoas, Brésil. Toute réservation implique l&apos;acceptation pleine et entière des présentes CGV.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">2. Réservation & Paiement</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Basse saison :</strong> Acompte de 30% à la réservation — Solde à J-30 avant l&apos;arrivée</li>
              <li><strong>Haute saison :</strong> Acompte de 40% à la réservation — Solde à J-45 avant l&apos;arrivée</li>
              <li><strong>Très Haute saison (Réveillon) :</strong> Paiement intégral à la réservation</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">3. Annulation</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li><strong>Basse saison :</strong> Remboursement intégral à +45j ; 70% entre 30 et 45j ; 0% à -30j</li>
              <li><strong>Haute saison :</strong> Remboursement intégral à +60j ; 60% entre 45 et 60j ; 0% à -45j</li>
              <li><strong>Très Haute saison :</strong> Non remboursable, non modifiable</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">4. Dépôt de garantie</h2>
            <p>Un dépôt de garantie de 1 000€ à 2 500€ est requis 48h avant l&apos;arrivée par pré-autorisation bancaire. Il est restitué dans un délai de 7 jours après le départ, déduction faite des éventuels dommages constatés.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">5. Capacité & Règles</h2>
            <p>La capacité maximale est de 17 personnes. Il est interdit d&apos;accueillir un nombre de personnes supérieur à celui indiqué à la réservation. Animaux non admis sauf accord préalable écrit.</p>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">6. Frais inclus & exclus</h2>
            <p><strong>Inclus :</strong> Ménage de fin de séjour (800 BRL), linge de maison, accès piscine, WiFi, climatisation.</p>
            <p className="mt-2"><strong>Non inclus :</strong> Transferts aéroport, chef cuisinier (sur demande), activités extérieures, consommations personnelles.</p>
          </section>
        </div>
      </div>
    </SectionWrapper>
  );
}
