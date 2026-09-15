import { pricingConfig } from "./seasons";
import type { PriceBreakdown } from "./types";
import type { Locale } from "@/lib/i18n/config";

function getSeasonForDate(date: Date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const season of pricingConfig.seasons) {
    const { startMonth, startDay, endMonth, endDay } = season;

    if (startMonth <= endMonth) {
      // Normal range (e.g., Mar 1 - May 31)
      if (
        (month > startMonth || (month === startMonth && day >= startDay)) &&
        (month < endMonth || (month === endMonth && day <= endDay))
      ) {
        return season;
      }
    } else {
      // Year-wrapping range (e.g., Dec 20 - Jan 10)
      if (
        month > startMonth ||
        (month === startMonth && day >= startDay) ||
        month < endMonth ||
        (month === endMonth && day <= endDay)
      ) {
        return season;
      }
    }
  }
  return null;
}

export function calculatePrice(
  checkIn: Date,
  checkOut: Date,
  lang: Locale
): PriceBreakdown {
  const nightlyMap = new Map<
    string,
    {
      season: PriceBreakdown["nightlyBreakdown"][0]["season"];
      label: string;
      nights: number;
      pricePerNight: number;
    }
  >();

  let totalNights = 0;
  let hasClosedDays = false;
  const current = new Date(checkIn);

  while (current < checkOut) {
    const seasonDef = getSeasonForDate(current);
    if (seasonDef) {
      if (seasonDef.type === "closed") {
        hasClosedDays = true;
      } else {
        const key = seasonDef.id;
        const existing = nightlyMap.get(key);
        if (existing) {
          existing.nights += 1;
        } else {
          nightlyMap.set(key, {
            season: seasonDef.type,
            label: seasonDef.label[lang],
            nights: 1,
            pricePerNight: seasonDef.pricePerNight,
          });
        }
        totalNights += 1;
      }
    }
    current.setDate(current.getDate() + 1);
  }

  const nightlyBreakdown = Array.from(nightlyMap.values()).map((entry) => ({
    ...entry,
    subtotal: entry.nights * entry.pricePerNight,
  }));

  const subtotalNights = nightlyBreakdown.reduce(
    (sum, e) => sum + e.subtotal,
    0
  );
  const total = subtotalNights + pricingConfig.cleaningFee;

  return {
    nights: totalNights,
    nightlyBreakdown,
    subtotalNights,
    cleaningFee: pricingConfig.cleaningFee,
    total,
    totalEUR: Math.round(total / pricingConfig.eurRate),
    hasClosedDays,
  };
}
