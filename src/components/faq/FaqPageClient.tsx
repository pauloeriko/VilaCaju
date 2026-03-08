"use client";

import React, { useState } from "react";
import { ChevronDown, Home, CalendarCheck, PlaneLanding, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { faqEntries, type FaqEntry } from "@/data/faq";
import type { Locale } from "@/lib/i18n/config";

// Catégories avec icône et label
const CATEGORIES: Array<{
  key: FaqEntry["category"];
  icon: React.ElementType;
  color: string;
}> = [
  { key: "villa",      icon: Home,         color: "text-terracotta-500 bg-terracotta-50" },
  { key: "booking",    icon: CalendarCheck, color: "text-ocean-500 bg-ocean-50" },
  { key: "arrival",    icon: PlaneLanding,  color: "text-green-600 bg-green-50" },
  { key: "activities", icon: Waves,         color: "text-amber-500 bg-amber-50" },
];

interface AccordionItemProps {
  question: string;
  answer: string;
}

function AccordionItem({ question, answer }: AccordionItemProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-sand-200 rounded-soft overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-sand-50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-medium text-charcoal-800 text-sm">{question}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-charcoal-500 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="px-5 pb-4 pt-1 bg-sand-50/50 border-t border-sand-100">
          <p className="text-sm text-charcoal-700/75 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

interface FaqPageClientProps {
  lang: Locale;
  dict: {
    categories: Record<FaqEntry["category"], string>;
  };
}

export default function FaqPageClient({ lang, dict }: FaqPageClientProps) {
  return (
    <div className="space-y-12">
      {CATEGORIES.map(({ key, icon: Icon, color }) => {
        const items = faqEntries.filter((e) => e.category === key);
        if (items.length === 0) return null;

        return (
          <section key={key}>
            {/* En-tête de catégorie */}
            <div className="flex items-center gap-3 mb-6">
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", color)}>
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-heading text-xl md:text-2xl font-bold text-charcoal-800">
                {dict.categories[key]}
              </h2>
            </div>

            {/* Accordéon */}
            <div className="max-w-2xl space-y-3">
              {items.map((item, i) => (
                <AccordionItem
                  key={i}
                  question={item.question[lang]}
                  answer={item.answer[lang]}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
