"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Waves, TreePalm, Armchair, Flame,
  UtensilsCrossed, Coffee, Wine, ChefHat,
  Tv, Wifi, Music, Gamepad2,
  SprayCan, Car, ShieldCheck, Plane,
} from "lucide-react";
import { amenityCategories } from "@/data/villa";
import type { Locale } from "@/lib/i18n/config";

const iconMap: Record<string, React.ElementType> = {
  Waves, TreePalm, Armchair, Flame,
  UtensilsCrossed, Coffee, Wine, ChefHat,
  Tv, Wifi, Music, Gamepad2,
  SprayCan, Car, ShieldCheck, Plane,
  ConciergeBell: ChefHat,
};

interface AmenityGridProps {
  lang: Locale;
}

export default function AmenityGrid({ lang }: AmenityGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {amenityCategories.map((category, catIndex) => {
        const CategoryIcon = iconMap[category.icon] || Waves;
        return (
          <motion.div
            key={catIndex}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: catIndex * 0.1 }}
            className="card-organic p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-ocean-50 flex items-center justify-center">
                <CategoryIcon className="w-5 h-5 text-ocean-400" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-charcoal-800">
                {category.title[lang]}
              </h3>
            </div>
            <ul className="grid grid-cols-2 gap-3">
              {category.items.map((item, itemIndex) => {
                const ItemIcon = iconMap[item.icon] || Waves;
                return (
                  <li key={itemIndex} className="flex items-center gap-2 text-sm text-charcoal-700/70">
                    <ItemIcon className="w-4 h-4 text-terracotta-400 shrink-0" />
                    <span>{item.label[lang]}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        );
      })}
    </div>
  );
}
