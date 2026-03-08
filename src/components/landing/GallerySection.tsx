"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import SectionWrapper from "@/components/ui/SectionWrapper";
import { galleryImages } from "@/data/gallery";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface GallerySectionProps {
  dict: Dictionary["gallery"];
  lang: Locale;
}

export default function GallerySection({ dict, lang }: GallerySectionProps) {
  return (
    <section className="py-20 md:py-28">
      {/* Titre — centré dans le conteneur standard */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 text-center mb-14">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-800 mb-4">
          {dict.title}
        </h2>
        <p className="text-charcoal-700/70 text-lg font-body max-w-2xl mx-auto">
          {dict.subtitle}
        </p>
      </div>

      {/* Grille pleine largeur avec fine marge */}
      <div className="px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {galleryImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-softer shadow-natural group aspect-[4/3]"
            >
              <Image
                src={image.src}
                alt={image.alt[lang]}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/10 transition-colors duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
