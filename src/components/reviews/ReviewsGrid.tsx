"use client";

import React, { useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Review } from "@/types";

// Aligné sur ReviewsSection (landing page)
const MAX_CHARS = 210;

const expandLabels: Record<Locale, { more: string; less: string }> = {
  fr: { more: "Lire la suite", less: "Réduire" },
  en: { more: "Read more",    less: "Show less" },
  pt: { more: "Ler mais",     less: "Recolher" },
};

function formatReviewDate(dateStr: string, lang: Locale): string {
  const [year, month] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  const locale = lang === "fr" ? "fr-FR" : lang === "pt" ? "pt-BR" : "en-US";
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

interface ReviewsGridProps {
  reviews: Review[];
  lang: Locale;
  dict: Dictionary["reviews"];
}

interface ReviewCardProps {
  review: Review;
  lang: Locale;
}

function ReviewCard({ review, lang }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const text = review.text[lang];
  const isLong = text.length > MAX_CHARS;
  const displayText =
    isLong && !expanded ? text.slice(0, MAX_CHARS).trimEnd() + "…" : text;
  const labels = expandLabels[lang];

  return (
    <div className="card-organic p-6 flex flex-col h-full hover:shadow-natural-lg transition-shadow">
      {/* 1. Drapeau + Nom */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl leading-none">{review.flag}</span>
        <p className="font-body font-semibold text-charcoal-800 text-sm">
          {review.name}
        </p>
      </div>

      {/* 2. Date + Lieu */}
      <p className="font-body text-charcoal-400 text-xs mb-3">
        {review.country}&nbsp;·&nbsp;{formatReviewDate(review.date, lang)}
      </p>

      {/* 3. Étoiles */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star
            key={i}
            className="w-3.5 h-3.5 fill-terracotta-400 text-terracotta-400"
          />
        ))}
      </div>

      {/* 4. Texte + bouton expand */}
      <div className="flex-1 flex flex-col">
        <p className="font-body text-charcoal-700 text-sm leading-relaxed flex-1">
          &ldquo;{displayText}&rdquo;
        </p>
        {isLong && (
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center gap-1 text-terracotta-600 text-xs font-semibold mt-3 hover:text-terracotta-700 transition-colors self-start"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                {labels.less}
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                {labels.more}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ReviewsGrid({ reviews, lang }: ReviewsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} lang={lang} />
      ))}
    </div>
  );
}
