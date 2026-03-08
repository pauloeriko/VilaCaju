"use client";

import React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import LanguageSwitcher from "./LanguageSwitcher";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
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

export default function MobileMenu({ isOpen, onClose, lang, dict }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="md:hidden overflow-hidden glass-nav border-t border-sand-300/50"
        >
          <nav className="flex flex-col px-6 py-6 gap-4">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`/${lang}${item.path}`}
                onClick={onClose}
                className="text-charcoal-700 font-medium text-lg hover:text-terracotta-500 transition-colors"
              >
                {dict[item.key]}
              </Link>
            ))}
            <Link
              href={`/${lang}/reserver`}
              onClick={onClose}
              className="mt-2 bg-terracotta-500 text-white font-semibold px-6 py-3 rounded-soft text-center hover:bg-terracotta-600 transition-colors"
            >
              {dict.bookCta}
            </Link>
            <div className="pt-4 border-t border-sand-300/50">
              <LanguageSwitcher currentLang={lang} />
            </div>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
