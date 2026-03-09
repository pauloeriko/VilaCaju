"use client";

import React, { useState, useCallback } from "react";
import AvailabilityCalendar from "./AvailabilityCalendar";
import PriceCalculator from "./PriceCalculator";
import SeasonCalendar from "./SeasonCalendar";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface TarifsCalendarSyncProps {
  lang: Locale;
  dict: Dictionary["rates"];
  // Contenu statique rendu entre les sections (price cards, payment, etc.)
  priceCards: React.ReactNode;
  paymentSection: React.ReactNode;
  cancellationSection: React.ReactNode;
  faqSection: React.ReactNode;
  ctaSection: React.ReactNode;
}

/**
 * Wrapper client qui coordonne le calendrier de disponibilité et
 * le calculateur de prix via un state de dates partagé,
 * tout en permettant d'intercaler du contenu statique entre les deux.
 */
export default function TarifsCalendarSync({
  lang,
  dict,
  priceCards,
  paymentSection,
  cancellationSection,
  faqSection,
  ctaSection,
}: TarifsCalendarSyncProps) {
  const [calendarCheckIn, setCalendarCheckIn] = useState<string | null>(null);
  const [calendarCheckOut, setCalendarCheckOut] = useState<string | null>(null);

  const handleDatesChange = useCallback((checkIn: string, checkOut: string) => {
    setCalendarCheckIn(checkIn);
    setCalendarCheckOut(checkOut);
    // Pas de scroll — le calculateur est visible côte à côte
  }, []);

  return (
    <>
      {/* 1. Calendrier des saisons */}
      <div className="bg-sand-100 px-6 md:px-8 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <SeasonCalendar
            lang={lang}
            highLabel={dict.highSeason}
            midLabel={dict.midSeason}
            lowLabel={dict.lowSeason}
            closedLabel={dict.closedSeason}
          />
        </div>
      </div>

      {/* 2 + 4. Calendrier de disponibilité + Estimez votre séjour — côte à côte */}
      <div className="px-6 md:px-8 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-stretch">
            <div className="card-organic p-6 h-full">
              <AvailabilityCalendar lang={lang} onDatesChange={handleDatesChange} />
            </div>
            <div id="price-calculator" className="h-full [&>div]:h-full">
              <PriceCalculator
                lang={lang}
                dict={dict}
                externalCheckIn={calendarCheckIn}
                externalCheckOut={calendarCheckOut}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Prix des saisons */}
      {priceCards}

      {/* 5. Conditions de paiement */}
      {paymentSection}

      {/* 6. Politique d'annulation */}
      {cancellationSection}

      {/* 7. FAQ */}
      {faqSection}

      {/* 8. CTA */}
      {ctaSection}
    </>
  );
}
