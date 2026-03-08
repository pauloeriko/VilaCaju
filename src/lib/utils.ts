import type { Locale } from "@/lib/i18n/config";

export function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(
  amount: number,
  currency: "BRL" | "EUR",
  locale: Locale
) {
  const localeMap: Record<Locale, string> = {
    fr: "fr-FR",
    en: "en-US",
    pt: "pt-BR",
  };
  return new Intl.NumberFormat(localeMap[locale], {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const EUR_RATE = 5.8;

export function brlToEur(brl: number): number {
  return Math.round(brl / EUR_RATE);
}

export const WHATSAPP_NUMBER = "5582999999999";

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
