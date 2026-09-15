"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySwitcher from "./CurrencySwitcher";
import MobileMenu from "./MobileMenu";

// Pages sur lesquelles le header doit toujours être opaque (fond d'image clair au-dessus du fold)
const ALWAYS_SCROLLED_PATHS = ["/villa", "/destination", "/tarifs", "/avis", "/contact", "/faq"];

interface NavbarProps {
  lang: Locale;
  dict: Dictionary["nav"];
}

const navItems = [
  { key: "home" as const,        path: "" },
  { key: "villa" as const,       path: "/villa" },
  { key: "destination" as const, path: "/destination" },
  { key: "rates" as const,       path: "/tarifs" },
  { key: "reviews" as const,     path: "/avis" },
  { key: "faq" as const,         path: "/faq" },
];

export default function Navbar({ lang, dict }: NavbarProps) {
  const pathname = usePathname();

  const forceScrolled = ALWAYS_SCROLLED_PATHS.some((path) =>
    pathname.endsWith(path)
  );

  const { scrolled } = useScrollDirection({ forceScrolled });
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass-nav shadow-natural" : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href={`/${lang}`}
            className={cn(
              "font-heading text-2xl md:text-3xl font-semibold transition-colors",
              scrolled
                ? "text-charcoal-800 hover:text-terracotta-500"
                : "text-white hover:text-sand-200"
            )}
          >
            Vila Caju
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`/${lang}${item.path}`}
                className={cn(
                  "font-medium transition-colors text-sm tracking-wide",
                  scrolled
                    ? "text-charcoal-700 hover:text-terracotta-500"
                    : "text-white/90 hover:text-white"
                )}
              >
                {dict[item.key]}
              </Link>
            ))}
          </nav>

          {/* Right side : devise + langue + CTA */}
          <div className="hidden md:flex items-center gap-3">
            <CurrencySwitcher scrolled={scrolled} />
            <LanguageSwitcher currentLang={lang} />
            <Link
              href={`/${lang}/reserver`}
              className="bg-terracotta-500 text-white font-semibold px-5 py-2.5 rounded-soft text-sm hover:bg-terracotta-600 transition-colors shadow-natural hover:shadow-natural-lg"
            >
              {dict.bookCta}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn(
              "md:hidden p-2 transition-colors",
              scrolled ? "text-charcoal-700" : "text-white"
            )}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        lang={lang}
        dict={dict}
      />
    </header>
  );
}
