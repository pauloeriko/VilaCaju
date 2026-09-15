"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";
import HeroDatePicker from "./HeroDatePicker";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface HeroSectionProps {
  dict: Dictionary["hero"];
  lang: Locale;
}

export default function HeroSection({ dict, lang }: HeroSectionProps) {
  return (
    <section className="relative h-screen -mt-16 md:-mt-20 flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/images/villa-maison-principale-vue-mer.png"
        alt="Vila Caju — maison principale avec vue sur la mer"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      {/* Gradient overlay bas → haut */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-charcoal-900/30 to-transparent" />
      {/* Gradient overlay haut → bas pour lisibilité de la navbar */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-charcoal-900/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6 max-w-2xl w-full">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm md:text-base tracking-[0.3em] text-white/80 mb-6 font-body font-medium drop-shadow-md"
        >
          {dict.tagline}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-heading text-6xl md:text-8xl lg:text-9xl font-bold mb-4 !text-white drop-shadow-lg"
        >
          {dict.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-lg md:text-xl text-white/80 mb-8 font-body font-light tracking-wide drop-shadow-md"
        >
          {dict.subtitle}
        </motion.p>

        {/* Moteur de disponibilité rapide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <HeroDatePicker lang={lang} dict={dict} />
        </motion.div>

        {/* CTA secondaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6"
        >
          <Button
            href={`/${lang}/villa`}
            variant="secondary"
            size="lg"
            className="border-white/60 text-white hover:bg-white/10"
          >
            {dict.cta}
          </Button>
          <Button href={`/${lang}/reserver`} variant="primary" size="lg">
            {dict.ctaBook}
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </section>
  );
}
