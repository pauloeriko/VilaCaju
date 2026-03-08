import type { PricingConfig } from "./types";

export const pricingConfig: PricingConfig = {
  currency: "BRL",
  eurRate: 5.8,
  cleaningFee: 800,
  maxGuests: 17,
  seasons: [
    // ── Très Haute saison : Réveillon strict (30 Déc – 1 Jan) ──────────────
    {
      id: "peak-newyear",
      type: "peak",
      label: {
        fr: "Très Haute saison – Réveillon",
        en: "Peak season – New Year's Eve",
        pt: "Altíssima temporada – Réveillon",
      },
      startMonth: 12, startDay: 30,
      endMonth: 1,  endDay: 1,
      pricePerNight: 8000,
      minStay: 3,
    },

    // ── Haute saison ────────────────────────────────────────────────────────
    {
      id: "high-newyear-pre",
      type: "high",
      label: {
        fr: "Haute saison – Fêtes de fin d'année",
        en: "High season – Year-end holidays",
        pt: "Alta temporada – Festas de fim de ano",
      },
      startMonth: 12, startDay: 20,
      endMonth: 12,  endDay: 29,
      pricePerNight: 5200,
      minStay: 5,
    },
    {
      id: "high-newyear-post",
      type: "high",
      label: {
        fr: "Haute saison – Nouvel An",
        en: "High season – New Year",
        pt: "Alta temporada – Ano Novo",
      },
      startMonth: 1, startDay: 2,
      endMonth: 1,   endDay: 10,
      pricePerNight: 5200,
      minStay: 5,
    },
    {
      id: "high-carnival",
      type: "high",
      label: {
        fr: "Haute saison – Carnaval",
        en: "High season – Carnival",
        pt: "Alta temporada – Carnaval",
      },
      startMonth: 2, startDay: 10,
      endMonth: 2,   endDay: 25,
      pricePerNight: 5200,
      minStay: 5,
    },
    {
      id: "high-july",
      type: "high",
      label: {
        fr: "Haute saison – Vacances de juillet",
        en: "High season – July holidays",
        pt: "Alta temporada – Férias de julho",
      },
      startMonth: 7, startDay: 1,
      endMonth: 7,   endDay: 31,
      pricePerNight: 5200,
      minStay: 5,
    },

    // ── Moyenne saison ──────────────────────────────────────────────────────
    {
      id: "mid-jan",
      type: "mid",
      label: {
        fr: "Moyenne saison",
        en: "Mid season",
        pt: "M\u00e9dia temporada",
      },
      startMonth: 1, startDay: 11,
      endMonth: 2,   endDay: 9,
      pricePerNight: 3000,
      minStay: 2,
    },
    {
      id: "mid-jun",
      type: "mid",
      label: {
        fr: "Moyenne saison",
        en: "Mid season",
        pt: "M\u00e9dia temporada",
      },
      startMonth: 6, startDay: 1,
      endMonth: 6,   endDay: 30,
      pricePerNight: 3000,
      minStay: 2,
    },

    // ── Basse saison ────────────────────────────────────────────────────────
    {
      id: "low-mar",
      type: "low",
      label: {
        fr: "Basse saison",
        en: "Low season",
        pt: "Baixa temporada",
      },
      startMonth: 2, startDay: 26,
      endMonth: 5,   endDay: 31,
      pricePerNight: 4400,
      minStay: 3,
    },
    {
      id: "low-aug",
      type: "low",
      label: {
        fr: "Basse saison",
        en: "Low season",
        pt: "Baixa temporada",
      },
      startMonth: 8, startDay: 1,
      endMonth: 11,  endDay: 30,
      pricePerNight: 4400,
      minStay: 3,
    },

    // ── Fermeture annuelle ──────────────────────────────────────────────────
    {
      id: "closed",
      type: "closed",
      label: {
        fr: "Fermeture annuelle",
        en: "Annual closure",
        pt: "Fechamento anual",
      },
      startMonth: 12, startDay: 1,
      endMonth: 12,   endDay: 19,
      pricePerNight: 0,
      minStay: 0,
    },
  ],
};
