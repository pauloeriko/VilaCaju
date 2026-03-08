"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Wind, Sparkles, Receipt } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface UspSectionProps {
  dict: Dictionary["usp"];
  lang: Locale;
}

const icons = [Users, Wind, Sparkles, Receipt];
const keys = ["capacity", "location", "service", "value"] as const;

export default function UspSection({ dict, lang }: UspSectionProps) {
  return (
    <SectionWrapper>
      <div className="text-center mb-14">
        <h2 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-800">
          {dict.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {keys.map((key, index) => {
          const Icon = icons[index];
          const item = dict[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ocean-50 text-ocean-400 mb-5">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-charcoal-800 mb-2">
                {item.title}
              </h3>
              <p className="font-body text-charcoal-700/70 text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* CTA banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-sand-200 rounded-softer p-10 md:p-14 text-center"
      >
        <h3 className="font-heading text-3xl md:text-4xl font-bold text-charcoal-800 mb-6">
          {dict.cta}
        </h3>
        <Button href={`/${lang}/reserver`} variant="primary" size="lg">
          {dict.ctaButton}
        </Button>
      </motion.div>
    </SectionWrapper>
  );
}
