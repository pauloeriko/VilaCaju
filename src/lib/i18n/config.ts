export const locales = ["fr", "en", "pt"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export function isValidLocale(lang: string): lang is Locale {
  return locales.includes(lang as Locale);
}
