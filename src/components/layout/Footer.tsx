import React from "react";
import Link from "next/link";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { buildWhatsAppUrl } from "@/lib/utils";

interface FooterProps {
  lang: Locale;
  dict: Dictionary["footer"];
}

export default function Footer({ lang, dict }: FooterProps) {
  const year = new Date().getFullYear();
  const whatsappUrl = buildWhatsAppUrl("Bonjour, je suis int\u00e9ress\u00e9(e) par Vila Caju.");

  return (
    <footer className="bg-charcoal-800 text-sand-300">
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-3xl font-semibold text-white mb-3">
              Vila Caju
            </h3>
            <p className="text-sand-400 text-sm leading-relaxed">
              {dict.tagline}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4">
              {lang === "fr" ? "Navigation" : lang === "pt" ? "Navegação" : "Navigation"}
            </h4>
            <nav className="flex flex-col gap-3">
              <Link href={`/${lang}/villa`} className="text-sand-400 hover:text-terracotta-300 transition-colors text-sm">
                Vila
              </Link>
              <Link href={`/${lang}/destination`} className="text-sand-400 hover:text-terracotta-300 transition-colors text-sm">
                {lang === "fr" ? "Destination" : lang === "pt" ? "Destino" : "Destination"}
              </Link>
              <Link href={`/${lang}/tarifs`} className="text-sand-400 hover:text-terracotta-300 transition-colors text-sm">
                {lang === "fr" ? "Tarifs" : lang === "pt" ? "Tarifas" : "Rates"}
              </Link>
              <Link href={`/${lang}/avis`} className="text-sand-400 hover:text-terracotta-300 transition-colors text-sm">
                {lang === "fr" ? "Avis" : lang === "pt" ? "Avaliações" : "Reviews"}
              </Link>
              <Link href={`/${lang}/contact`} className="text-sand-400 hover:text-terracotta-300 transition-colors text-sm">
                {lang === "fr" ? "Contact" : lang === "pt" ? "Contato" : "Contact"}
              </Link>
              <Link href={`/${lang}/reserver`} className="text-sand-400 hover:text-terracotta-300 transition-colors text-sm">
                {lang === "fr" ? "Réserver" : lang === "pt" ? "Reservar" : "Book"}
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4">
              {dict.contact}
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sand-400 hover:text-[#25D366] transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                {dict.whatsapp}
              </a>
              <a
                href="mailto:contact@vilacaju.com"
                className="flex items-center gap-2 text-sand-400 hover:text-terracotta-300 transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                contact@vilacaju.com
              </a>
              <div className="flex items-center gap-2 text-sand-400 text-sm">
                <MapPin className="w-4 h-4" />
                Pontal de Macei\u00f3, Alagoas, Brasil
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-charcoal-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sand-500 text-xs">
            {dict.copyright.replace("{year}", String(year))}
          </p>
          <div className="flex items-center flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
            <Link href={`/${lang}/mentions-legales`} className="text-sand-500 hover:text-sand-300 transition-colors text-xs">
              {dict.legal}
            </Link>
            <Link href={`/${lang}/cgv`} className="text-sand-500 hover:text-sand-300 transition-colors text-xs">
              {dict.cgv}
            </Link>
            <Link href={`/${lang}/confidentialite`} className="text-sand-500 hover:text-sand-300 transition-colors text-xs">
              {dict.privacy}
            </Link>
            <Link href={`/${lang}/faq`} className="text-sand-500 hover:text-sand-300 transition-colors text-xs">
              {dict.faq}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
