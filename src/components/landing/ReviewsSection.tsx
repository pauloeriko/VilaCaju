"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { reviews } from "@/data/reviews";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Review } from "@/types";

// Lien vers les avis Google Maps de Vila Caju
const GOOGLE_MAPS_URL =
  "https://www.google.fr/maps/place/Vila+Caju/@-4.3993808,-37.7916943,17z/data=!4m6!3m5!1s0x7b8450435cc1ceb:0xf454260ee8693549!8m2!3d-4.3993808!4d-37.7891194!16s%2Fg%2F11vc3szwry?entry=ttu&g_ep=EgoyMDI2MDMxOC4xIKXMDSoASAFQAw%3D%3D";

// Nombre de caractères avant troncature
const MAX_CHARS = 210;

// Labels localisés pour le bouton expand
const expandLabels: Record<Locale, { more: string; less: string }> = {
  fr: { more: "Lire la suite", less: "Réduire" },
  en: { more: "Read more",    less: "Show less" },
  pt: { more: "Ler mais",     less: "Recolher" },
};

// Labels localisés pour le lien Google
const googleLinkLabels: Record<Locale, string> = {
  fr: "Voir tous les avis sur Google",
  en: "See all reviews on Google",
  pt: "Ver todos os comentários no Google",
};

// Formatte "2026-03" → "mars 2026" selon la locale
function formatReviewDate(dateStr: string, lang: Locale): string {
  const [year, month] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  const locale = lang === "fr" ? "fr-FR" : lang === "pt" ? "pt-BR" : "en-US";
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}

interface ReviewsSectionProps {
  dict: Dictionary["reviews"];
  lang: Locale;
}

interface ReviewCardProps {
  review: Review;
  lang: Locale;
  index: number;
}

// Carte individuelle avec état expand local
function ReviewCard({ review, lang, index }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const text = review.text[lang];
  const isLong = text.length > MAX_CHARS;
  const displayText =
    isLong && !expanded ? text.slice(0, MAX_CHARS).trimEnd() + "…" : text;
  const labels = expandLabels[lang];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="card-organic p-6 flex flex-col h-full"
    >
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
    </motion.div>
  );
}

export default function ReviewsSection({ dict, lang }: ReviewsSectionProps) {
  return (
    <section className="w-full bg-sand-100 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        {/* En-tête */}
        <div className="text-center mb-14">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-800 mb-4">
            {dict.title}
          </h2>
          <p className="text-charcoal-700/70 text-lg font-body mb-5">
            {dict.subtitle}
          </p>
          {/* Lien Google Maps */}
          <a
            href={GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-terracotta-600 hover:text-terracotta-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {googleLinkLabels[lang]}
          </a>
        </div>

        {/* Grille — items-stretch pour hauteur uniforme */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {reviews.map((review, index) => (
            <ReviewCard
              key={review.id}
              review={review}
              lang={lang}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
