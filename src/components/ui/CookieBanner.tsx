"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

interface CookieBannerProps {
  lang: Locale;
  dict: {
    message: string;
    accept: string;
    decline: string;
    learnMore: string;
  };
}

const COOKIE_KEY = "vila-caju-cookies";

export default function CookieBanner({ lang, dict }: CookieBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md",
        "z-50 bg-charcoal-800 text-white rounded-softer shadow-natural-xl",
        "p-5 flex flex-col gap-4"
      )}
      role="dialog"
      aria-label="Cookie consent"
    >
      <p className="text-sm text-white/80 leading-relaxed">
        {dict.message}{" "}
        <Link
          href={`/${lang}/confidentialite`}
          className="text-terracotta-300 hover:text-terracotta-200 underline transition-colors"
        >
          {dict.learnMore}
        </Link>
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          className="flex-1 bg-terracotta-500 hover:bg-terracotta-600 text-white font-semibold text-sm py-2.5 rounded-soft transition-colors"
        >
          {dict.accept}
        </button>
        <button
          onClick={handleDecline}
          className="flex-1 border border-white/20 hover:bg-white/10 text-white/80 font-medium text-sm py-2.5 rounded-soft transition-colors"
        >
          {dict.decline}
        </button>
      </div>
    </div>
  );
}
