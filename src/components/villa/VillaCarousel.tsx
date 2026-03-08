"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const CAROUSEL_IMAGES = [
  { src: "/images/villa-piscine-mer-palmiers.png",             alt: "Piscine privée avec vue sur l'océan" },
  { src: "/images/villa-maison-principale-vue-mer.png",        alt: "Maison principale vue mer" },
  { src: "/images/villa-piscine-terrasse-mer-grand-angle.jpg", alt: "Terrasse, piscine et mer" },
  { src: "/images/villa-pergola-vue-mer.jpg",                  alt: "Pergola avec vue sur l'océan" },
  { src: "/images/villa-terrasse-bougainvilliers.jpg",         alt: "Terrasse fleurie" },
  { src: "/images/villa-piscine-transats-pergola.jpg",         alt: "Piscine et transats" },
  { src: "/images/villa-jardin-palmiers-vue-mer.jpg",          alt: "Jardin tropical" },
  { src: "/images/villa-hamacs-jardin-palmiers.jpg",           alt: "Hamacs dans le jardin" },
  { src: "/images/villa-salon-interieur-volume.jpg",           alt: "Salon intérieur" },
  { src: "/images/villa-salle-manger-bois.jpg",               alt: "Salle à manger en bois" },
];

export default function VillaCarousel() {
  const [current, setCurrent] = useState(0);
  const total = CAROUSEL_IMAGES.length;

  const prev = useCallback(() => {
    setCurrent((i) => (i === 0 ? total - 1 : i - 1));
  }, [total]);

  const next = useCallback(() => {
    setCurrent((i) => (i === total - 1 ? 0 : i + 1));
  }, [total]);

  return (
    <div className="relative w-full">
      {/* Image principale — pleine largeur */}
      <div className="relative w-full h-[60vh] md:h-[70vh] rounded-softer overflow-hidden shadow-natural-lg">
        <Image
          key={current}
          src={CAROUSEL_IMAGES[current].src}
          alt={CAROUSEL_IMAGES[current].alt}
          fill
          className="object-cover transition-opacity duration-500"
          sizes="100vw"
          priority={current === 0}
        />

        {/* Overlay léger en bas pour les dots */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-charcoal-900/50 to-transparent pointer-events-none" />

        {/* Dots indicateurs */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {CAROUSEL_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Photo ${i + 1}`}
              className={cn(
                "rounded-full transition-all duration-200",
                i === current
                  ? "bg-white w-5 h-2"
                  : "bg-white/50 w-2 h-2 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      </div>

      {/* Bouton gauche — toujours visible */}
      <button
        onClick={prev}
        aria-label="Photo précédente"
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 z-10",
          "w-11 h-11 rounded-full bg-white/90 shadow-natural",
          "flex items-center justify-center",
          "hover:bg-white hover:shadow-natural-lg transition-all duration-200"
        )}
      >
        <ChevronLeft className="w-5 h-5 text-charcoal-700" />
      </button>

      {/* Bouton droit — toujours visible */}
      <button
        onClick={next}
        aria-label="Photo suivante"
        className={cn(
          "absolute right-3 top-1/2 -translate-y-1/2 z-10",
          "w-11 h-11 rounded-full bg-white/90 shadow-natural",
          "flex items-center justify-center",
          "hover:bg-white hover:shadow-natural-lg transition-all duration-200"
        )}
      >
        <ChevronRight className="w-5 h-5 text-charcoal-700" />
      </button>

      {/* Compteur */}
      <div className="mt-3 text-center text-xs text-charcoal-500 font-body">
        {current + 1} / {total}
      </div>
    </div>
  );
}
