"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Review } from "@/types";

interface ReviewsGridProps {
  reviews: Review[];
  lang: Locale;
  dict: Dictionary["reviews"];
}

const sourceStyles = {
  airbnb: { bg: "bg-[#FF5A5F]/10", text: "text-[#FF5A5F]", dot: "bg-[#FF5A5F]" },
  google:  { bg: "bg-ocean-50",     text: "text-ocean-600",   dot: "bg-ocean-500" },
  direct:  { bg: "bg-sand-100",     text: "text-sand-700",    dot: "bg-sand-500"  },
};

function SourceBadge({
  source,
  dict,
}: {
  source: Review["source"];
  dict: Dictionary["reviews"];
}) {
  const style = sourceStyles[source];
  const label =
    source === "airbnb" ? dict.sourceAirbnb
    : source === "google" ? dict.sourceGoogle
    : dict.sourceDirect;

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", style.bg, style.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
      {label}
    </span>
  );
}

export default function ReviewsGrid({ reviews, lang, dict }: ReviewsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="card-organic p-6 flex flex-col gap-4 hover:shadow-natural-lg transition-shadow"
        >
          {/* En-tête : badge source + étoiles */}
          <div className="flex items-center justify-between">
            <SourceBadge source={review.source} dict={dict} />
            <div className="flex gap-0.5">
              {Array.from({ length: review.rating }).map((_, i) => (
                <span key={i} className="text-terracotta-400 text-sm">★</span>
              ))}
            </div>
          </div>

          {/* Texte */}
          <p className="text-charcoal-700/80 text-sm leading-relaxed italic flex-1">
            &ldquo;{review.text[lang]}&rdquo;
          </p>

          {/* Auteur */}
          <div className="flex items-center justify-between pt-3 border-t border-sand-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">{review.flag}</span>
              <div>
                <p className="font-semibold text-charcoal-800 text-sm">{review.name}</p>
                <p className="text-charcoal-700/50 text-xs">{review.country}</p>
              </div>
            </div>
            <p className="text-charcoal-700/40 text-xs">
              {new Date(review.date + "-01").toLocaleDateString(
                lang === "fr" ? "fr-FR" : lang === "pt" ? "pt-BR" : "en-US",
                { month: "long", year: "numeric" }
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
