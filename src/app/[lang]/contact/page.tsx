import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { type Locale, locales } from "@/lib/i18n/config";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/utils";

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
    title: `${dict.contact.pageTitle} | Vila Caju`,
    alternates: {
      languages: { fr: "/fr/contact", en: "/en/contact", pt: "/pt/contact" },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang as Locale);
  const whatsappUrl = buildWhatsAppUrl(
    lang === "fr" ? "Bonjour, j\'ai une question sur Vila Caju."
    : lang === "pt" ? "Olá, tenho uma pergunta sobre a Vila Caju."
    : "Hello, I have a question about Vila Caju."
  );

  return (
    <SectionWrapper>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="font-heading text-5xl md:text-6xl font-bold text-charcoal-800 mb-4">
            {dict.contact.pageTitle}
          </h1>
          <p className="text-charcoal-700/70 text-lg">{dict.contact.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-organic p-8 flex flex-col gap-4 hover:shadow-natural-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-[#25D366]/10 rounded-soft flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-[#25D366]" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-charcoal-800 mb-1">{dict.contact.whatsappLabel}</p>
              <p className="text-charcoal-700/60 text-sm">{dict.contact.whatsappDesc}</p>
              <p className="text-[#25D366] font-medium text-sm mt-2">+55 82 99999-9999</p>
            </div>
          </a>

          {/* Email */}
          <a
            href="mailto:contact@vilacaju.com"
            className="card-organic p-8 flex flex-col gap-4 hover:shadow-natural-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-terracotta-50 rounded-soft flex items-center justify-center group-hover:bg-terracotta-100 transition-colors">
              <Mail className="w-6 h-6 text-terracotta-500" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-charcoal-800 mb-1">{dict.contact.emailLabel}</p>
              <p className="text-charcoal-700/60 text-sm">{dict.contact.emailDesc}</p>
              <p className="text-terracotta-500 font-medium text-sm mt-2">contact@vilacaju.com</p>
            </div>
          </a>

          {/* Adresse */}
          <a
            href="https://maps.app.goo.gl/A5EBLDqpGGYxqDYw6"
            target="_blank"
            rel="noopener noreferrer"
            className="card-organic p-8 flex flex-col gap-4 hover:shadow-natural-lg transition-shadow group"
          >
            <div className="w-12 h-12 bg-ocean-50 rounded-soft flex items-center justify-center group-hover:bg-ocean-100 transition-colors">
              <MapPin className="w-6 h-6 text-ocean-500" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-charcoal-800 mb-1">{dict.contact.addressLabel}</p>
              <p className="text-charcoal-700/60 text-sm leading-relaxed">
                R. C - Pontal de Maceio<br />Fortim - CE, 62815-000<br />Brasil
              </p>
              <p className="text-ocean-500 font-medium text-xs mt-2 group-hover:underline">
                {lang === "fr" ? "Voir sur Google Maps" : lang === "pt" ? "Ver no Google Maps" : "View on Google Maps"}
              </p>
            </div>
          </a>

          {/* Horaires */}
          <div className="card-organic p-8 flex flex-col gap-4">
            <div className="w-12 h-12 bg-sand-100 rounded-soft flex items-center justify-center">
              <Clock className="w-6 h-6 text-sand-600" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold text-charcoal-800 mb-1">{dict.contact.hoursLabel}</p>
              <p className="text-charcoal-700/60 text-sm leading-relaxed">{dict.contact.hoursValue}</p>
            </div>
          </div>
        </div>

        {/* Google Maps embed */}
        <div className="mt-10 rounded-softer overflow-hidden shadow-natural">
          <iframe
            src="https://maps.google.com/maps?q=Pontal+de+Maceio,+Fortim,+CE,+Brasil&t=&z=14&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="320"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Pontal de Maceió — Fortim, CE"
          />
        </div>
      </div>
    </SectionWrapper>
  );
}
