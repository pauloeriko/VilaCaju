"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Bed, Bath, Users, AirVent } from "lucide-react";
import { cn } from "@/lib/utils";
import { rooms } from "@/data/villa";
import type { Locale } from "@/lib/i18n/config";

interface RoomPlanProps {
  lang: Locale;
}

export default function RoomPlan({ lang }: RoomPlanProps) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => Math.max(0, c - 1));
  const next = () => setCurrent((c) => Math.min(rooms.length - 1, c + 1));

  const room = rooms[current];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Carte chambre courante */}
      <div className="card-organic overflow-hidden">
        <div className="relative h-64 w-full">
          <Image
            src={room.image}
            alt={room.name[lang]}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>
        <div className="p-6">
          <h3 className="font-heading text-2xl font-semibold text-charcoal-800 mb-4">
            {room.name[lang]}
          </h3>
          <div className="flex flex-col gap-2 text-sm text-charcoal-700/70">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-ocean-400" />
              <span>
                {lang === "fr" ? "2-3 personnes" : lang === "pt" ? "2-3 pessoas" : "2-3 guests"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bed className="w-4 h-4 text-ocean-400" />
              <span>
                {lang === "fr" ? "Lit double" : lang === "pt" ? "Cama de casal" : "Double bed"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Bath className="w-4 h-4 text-ocean-400" />
              <span>
                {lang === "fr"
                  ? "Salle de bain privée"
                  : lang === "pt"
                  ? "Banheiro privativo"
                  : "Private bathroom"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AirVent className="w-4 h-4 text-ocean-400" />
              <span>
                {lang === "fr"
                  ? "Climatisation"
                  : lang === "pt"
                  ? "Ar-condicionado"
                  : "Air conditioning"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prev}
          disabled={current === 0}
          aria-label={lang === "fr" ? "Chambre précédente" : lang === "pt" ? "Quarto anterior" : "Previous room"}
          className={cn(
            "w-10 h-10 rounded-full border border-sand-300 flex items-center justify-center transition-colors",
            current === 0 ? "opacity-30 cursor-not-allowed" : "hover:bg-sand-100"
          )}
        >
          <ChevronLeft className="w-5 h-5 text-charcoal-600" />
        </button>

        {/* Indicateurs de position */}
        <div className="flex items-center gap-2">
          {rooms.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Chambre ${i + 1}`}
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-colors",
                i === current ? "bg-terracotta-500" : "bg-sand-300 hover:bg-sand-400"
              )}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={current === rooms.length - 1}
          aria-label={lang === "fr" ? "Chambre suivante" : lang === "pt" ? "Próximo quarto" : "Next room"}
          className={cn(
            "w-10 h-10 rounded-full border border-sand-300 flex items-center justify-center transition-colors",
            current === rooms.length - 1 ? "opacity-30 cursor-not-allowed" : "hover:bg-sand-100"
          )}
        >
          <ChevronRight className="w-5 h-5 text-charcoal-600" />
        </button>
      </div>

      {/* Compteur */}
      <p className="text-center text-sm text-charcoal-500 mt-3">
        {current + 1} / {rooms.length}
      </p>
    </div>
  );
}
