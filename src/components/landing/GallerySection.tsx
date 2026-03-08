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
    <SectionWrapper>
      <div className="text-center mb-14">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-800 mb-4">
          {dict.title}
        </h2>
        <p className="text-charcoal-700/70 text-lg font-body max-w-2xl mx-auto">
          {dict.subtitle}
        </p>
      </div>

      {/* Asymmetric grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5">
        {galleryImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden rounded-softer shadow-natural group ${
              image.colSpan === 7
                ? "md:col-span-7 md:row-span-2"
                : image.colSpan === 5
                ? "md:col-span-5"
                : "md:col-span-4"
            } ${image.rowSpan === 2 ? "md:row-span-2 aspect-[3/4]" : "aspect-[4/3]"}`}
          >
            <Image
              src={image.src}
              alt={image.alt[lang]}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes={
                image.colSpan === 7
                  ? "(max-width: 768px) 100vw, 58vw"
                  : image.colSpan === 5
                  ? "(max-width: 768px) 100vw, 42vw"
                  : "(max-width: 768px) 100vw, 33vw"
              }
            />
            {/* Subtle hover overlay */}
            <div className="absolute inset-0 bg-charcoal-900/0 group-hover:bg-charcoal-900/10 transition-colors duration-300" />
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
