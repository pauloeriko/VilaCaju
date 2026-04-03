import type { SeasonType } from "@/lib/pricing/types";

export interface CancellationRule {
  daysBeforeCheckin: number;
  refundPercent: number;
  label: { fr: string; en: string; pt: string };
}

export interface CancellationPolicy {
  seasonType: SeasonType;
  title: { fr: string; en: string; pt: string };
  rules: CancellationRule[];
}

export interface PaymentCondition {
  seasonType: SeasonType;
  depositPercent: number;
  balanceDaysBeforeCheckin: number;
  fullPaymentAtBooking: boolean;
}

export const cancellationPolicies: CancellationPolicy[] = [
  {
    seasonType: "low",
    title: { fr: "Politique d'annulation", en: "Cancellation policy", pt: "Política de cancelamento" },
    rules: [
      {
        daysBeforeCheckin: 0,
        refundPercent: 0,
        label: {
          fr: "Les séjours sont fermes et définitifs — aucun remboursement en cas d'annulation.",
          en: "Bookings are firm and final — no refund in case of cancellation.",
          pt: "As reservas são firmes e definitivas — sem reembolso em caso de cancelamento.",
        },
      },
    ],
  },
];

export const paymentConditions: PaymentCondition[] = [
  { seasonType: "low", depositPercent: 30, balanceDaysBeforeCheckin: 45, fullPaymentAtBooking: false },
];
