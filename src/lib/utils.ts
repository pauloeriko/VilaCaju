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

export function brlToEur(brl: number, eurRate: number): number {
  return Math.round(brl / eurRate);
}

export function eurToBrl(eur: number, eurRate: number): number {
  return Math.round(eur * eurRate);
}

export const WHATSAPP_NUMBER = "33759568241";

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
