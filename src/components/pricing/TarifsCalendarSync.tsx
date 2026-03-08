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
    // Scroll fluide vers le calculateur
    const el = document.getElementById("price-calculator");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
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

      {/* 2. Calendrier de disponibilité */}
      <div className="px-6 md:px-8 py-10 md:py-14">
        <div className="max-w-6xl mx-auto">
          <AvailabilityCalendar lang={lang} onDatesChange={handleDatesChange} />
        </div>
      </div>

      {/* 3. Prix des saisons */}
      {priceCards}

      {/* 4. Estimez votre séjour */}
      <div id="price-calculator" className="bg-sand-100 px-6 md:px-8 py-10 md:py-14">
        <div className="max-w-xl mx-auto">
          <PriceCalculator
            lang={lang}
            dict={dict}
            externalCheckIn={calendarCheckIn}
            externalCheckOut={calendarCheckOut}
          />
        </div>
      </div>

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
