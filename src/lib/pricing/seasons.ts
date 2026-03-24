import type { PricingConfig } from "./types";

export const pricingConfig: PricingConfig = {
  currency: "BRL",
  eurRate: 5.8,
  cleaningFee: 800,
  maxGuests: 17,
  seasons: [
    // ── Haute saison : 16 Déc – Fin Fév ────────────────────────────────────
    {
      id: "high-winter",
      type: "high",
      label: {
        fr: "Haute saison",
        en: "High season",
        pt: "Alta temporada",
      },
      startMonth: 12, startDay: 16,
      endMonth: 2,   endDay: 28,
      pricePerNight: 8000,
      minStay: 3,
    },

    // ── Moyenne saison ──────────────────────────────────────────────────────
    {
      id: "mid-summer",
      type: "mid",
      label: {
        fr: "Moyenne saison",
        en: "Mid season",
        pt: "Média temporada",
      },
      startMonth: 7, startDay: 1,
      endMonth: 8,   endDay: 31,
      pricePerNight: 6200,
      minStay: 3,
    },
    {
      id: "mid-fall",
      type: "mid",
      label: {
        fr: "Moyenne saison",
        en: "Mid season",
        pt: "Média temporada",
      },
      startMonth: 10, startDay: 16,
      endMonth: 12,   endDay: 15,
      pricePerNight: 6200,
      minStay: 3,
    },

    // ── Basse saison ────────────────────────────────────────────────────────
    {
      id: "low-june",
      type: "low",
      label: {
        fr: "Basse saison",
        en: "Low season",
        pt: "Baixa temporada",
      },
      startMonth: 6, startDay: 1,
      endMonth: 6,   endDay: 30,
      pricePerNight: 5400,
      minStay: 3,
    },
    {
      id: "low-fall",
      type: "low",
      label: {
        fr: "Basse saison",
        en: "Low season",
        pt: "Baixa temporada",
      },
      startMonth: 9, startDay: 1,
      endMonth: 10,  endDay: 15,
      pricePerNight: 5400,
      minStay: 3,
    },

    // ── Fermeture annuelle : 1 Mar – 31 Mai ─────────────────────────────────
    {
      id: "closed",
      type: "closed",
      label: {
        fr: "Fermeture annuelle",
        en: "Annual closure",
        pt: "Fechamento anual",
      },
      startMonth: 3, startDay: 1,
      endMonth: 5,   endDay: 31,
      pricePerNight: 0,
      minStay: 0,
    },
  ],
};
