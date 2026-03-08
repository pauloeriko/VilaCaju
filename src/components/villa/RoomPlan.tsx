"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bed, Bath, Users } from "lucide-react";
import { rooms } from "@/data/villa";
import type { Locale } from "@/lib/i18n/config";

interface RoomPlanProps {
  lang: Locale;
}

export default function RoomPlan({ lang }: RoomPlanProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room, index) => (
        <motion.div
          key={room.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="card-organic overflow-hidden"
        >
          <div className="relative h-48 w-full">
            <Image
              src={room.image}
              alt={room.name[lang]}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <div className="p-5">
            <h3 className="font-heading text-xl font-semibold text-charcoal-800 mb-3">
              {room.name[lang]}
            </h3>
            <div className="flex flex-col gap-2 text-sm text-charcoal-700/70">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-ocean-400" />
                <span>
                  {room.capacity}{" "}
                  {lang === "fr" ? "personnes" : lang === "pt" ? "pessoas" : "guests"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Bed className="w-4 h-4 text-ocean-400" />
                <span>{room.beds[lang]}</span>
              </div>
              {room.ensuite && (
                <div className="flex items-center gap-2">
                  <Bath className="w-4 h-4 text-ocean-400" />
                  <span>
                    {lang === "fr"
                      ? "Salle de bain priv\u00e9e"
                      : lang === "pt"
                      ? "Banheiro privativo"
                      : "Private bathroom"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
