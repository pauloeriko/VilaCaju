"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { reviews } from "@/data/reviews";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface ReviewsSectionProps {
  dict: Dictionary["reviews"];
  lang: Locale;
}

export default function ReviewsSection({ dict, lang }: ReviewsSectionProps) {
  return (
    <section className="w-full bg-sand-100 py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
      <div className="text-center mb-14">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-800 mb-4">
          {dict.title}
        </h2>
        <p className="text-charcoal-700/70 text-lg font-body">
          {dict.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="card-organic p-6"
          >
            {/* Stars */}
            <div className="flex gap-0.5 mb-4">
              {Array.from({ length: review.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-terracotta-400 text-terracotta-400"
                />
              ))}
            </div>

            {/* Quote */}
            <p className="font-heading text-charcoal-700 italic text-lg leading-relaxed mb-6">
              &ldquo;{review.text[lang]}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-sand-200">
              <span className="text-2xl">{review.flag}</span>
              <div>
                <p className="font-body font-semibold text-charcoal-800 text-sm">
                  {review.name}
                </p>
                <p className="font-body text-sand-500 text-xs">
                  {review.country} &middot; {review.date}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      </div>
    </section>
  );
}
