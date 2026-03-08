"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  currentLang: Locale;
}

export default function LanguageSwitcher({ currentLang }: LanguageSwitcherProps) {
  const pathname = usePathname();

  function getLocalizedPath(locale: Locale) {
    const segments = pathname.split("/");
    segments[1] = locale;
    return segments.join("/");
  }

  return (
    <div className="flex items-center gap-1">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={getLocalizedPath(locale)}
          className={cn(
            "px-2 py-1 text-sm font-medium uppercase transition-colors rounded",
            locale === currentLang
              ? "text-terracotta-500 bg-terracotta-50"
              : "text-charcoal-700 hover:text-terracotta-500"
          )}
        >
          {locale}
        </Link>
      ))}
    </div>
  );
}
