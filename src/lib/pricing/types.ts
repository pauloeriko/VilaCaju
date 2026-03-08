// "peak" = Très Haute saison (Réveillon 30 Déc – 1 Jan)
export type SeasonType = "peak" | "high" | "mid" | "low" | "closed";

export interface SeasonPeriod {
  id: string;
  type: SeasonType;
  label: { fr: string; en: string; pt: string };
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  pricePerNight: number;
  minStay: number;
}

export interface PricingConfig {
  currency: "BRL";
  eurRate: number;
  cleaningFee: number;
  maxGuests: number;
  seasons: SeasonPeriod[];
}

export interface PriceBreakdown {
  nights: number;
  nightlyBreakdown: {
    season: SeasonType;
    label: string;
    nights: number;
    pricePerNight: number;
    subtotal: number;
  }[];
  subtotalNights: number;
  cleaningFee: number;
  total: number;
  totalEUR: number;
  hasClosedDays: boolean;
}
