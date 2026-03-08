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
    title: { fr: "Basse saison", en: "Low season", pt: "Baixa temporada" },
    rules: [
      { daysBeforeCheckin: 45, refundPercent: 100, label: { fr: "Remboursement intégral à plus de 45 jours", en: "Full refund more than 45 days before", pt: "Reembolso integral a mais de 45 dias" } },
      { daysBeforeCheckin: 30, refundPercent: 70,  label: { fr: "70% remboursé entre 30 et 45 jours avant", en: "70% refund between 30 and 45 days before", pt: "70% reembolso entre 30 e 45 dias antes" } },
      { daysBeforeCheckin: 0,  refundPercent: 0,   label: { fr: "Non remboursable à moins de 30 jours", en: "Non-refundable within 30 days", pt: "Não reembolsável com menos de 30 dias" } },
    ],
  },
  {
    seasonType: "mid",
    title: { fr: "Moyenne saison", en: "Mid season", pt: "Média temporada" },
    rules: [
      { daysBeforeCheckin: 45, refundPercent: 100, label: { fr: "Remboursement intégral à plus de 45 jours", en: "Full refund more than 45 days before", pt: "Reembolso integral a mais de 45 dias" } },
      { daysBeforeCheckin: 30, refundPercent: 70,  label: { fr: "70% remboursé entre 30 et 45 jours avant", en: "70% refund between 30 and 45 days before", pt: "70% reembolso entre 30 e 45 dias antes" } },
      { daysBeforeCheckin: 0,  refundPercent: 0,   label: { fr: "Non remboursable à moins de 30 jours", en: "Non-refundable within 30 days", pt: "Não reembolsável com menos de 30 dias" } },
    ],
  },
  {
    seasonType: "high",
    title: { fr: "Haute saison", en: "High season", pt: "Alta temporada" },
    rules: [
      { daysBeforeCheckin: 60, refundPercent: 100, label: { fr: "Remboursement intégral à plus de 60 jours", en: "Full refund more than 60 days before", pt: "Reembolso integral a mais de 60 dias" } },
      { daysBeforeCheckin: 45, refundPercent: 60,  label: { fr: "60% remboursé entre 45 et 60 jours avant", en: "60% refund between 45 and 60 days before", pt: "60% reembolso entre 45 e 60 dias antes" } },
      { daysBeforeCheckin: 0,  refundPercent: 0,   label: { fr: "Non remboursable à moins de 45 jours", en: "Non-refundable within 45 days", pt: "Não reembolsável com menos de 45 dias" } },
    ],
  },
  {
    seasonType: "peak",
    title: { fr: "Très Haute saison — Réveillon", en: "Peak season — New Year Eve", pt: "Altíssima temporada — Réveillon" },
    rules: [
      { daysBeforeCheckin: 0, refundPercent: 0, label: { fr: "Non remboursable, non modifiable", en: "Non-refundable, non-modifiable", pt: "Não reembolsável, não modificável" } },
    ],
  },
];

export const paymentConditions: PaymentCondition[] = [
  { seasonType: "low",  depositPercent: 30, balanceDaysBeforeCheckin: 30, fullPaymentAtBooking: false },
  { seasonType: "mid",  depositPercent: 30, balanceDaysBeforeCheckin: 30, fullPaymentAtBooking: false },
  { seasonType: "high", depositPercent: 40, balanceDaysBeforeCheckin: 45, fullPaymentAtBooking: false },
  { seasonType: "peak", depositPercent: 100, balanceDaysBeforeCheckin: 0, fullPaymentAtBooking: true },
];
