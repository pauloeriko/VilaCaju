"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { calculatePrice } from "@/lib/pricing/calculator";
import { formatCurrency, brlToEur, buildWhatsAppUrl } from "@/lib/utils";
import { pricingConfig } from "@/lib/pricing/seasons";
import { cancellationPolicies, type CancellationPolicy } from "@/data/policies";
import type { SeasonType } from "@/lib/pricing/types";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import DatePicker from "./DatePicker";
import GuestCounter from "./GuestCounter";
import Button from "@/components/ui/Button";
import AvailabilityCalendar from "@/components/pricing/AvailabilityCalendar";

interface BookingFormProps {
  lang: Locale;
  dict: Dictionary["booking"];
}

interface FormState {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  name: string;
  email: string;
  phone: string;
  message: string;
}

// Ordre de sévérité : peak > high > mid > low > closed
const SEVERITY: Record<SeasonType, number> = {
  peak: 4,
  high: 3,
  mid: 2,
  low: 1,
  closed: 0,
};

function getDominantPolicy(checkIn: string, checkOut: string): CancellationPolicy | null {
  if (!checkIn || !checkOut) return null;
  const ci = new Date(checkIn);
  const co = new Date(checkOut);
  if (co <= ci) return null;

  let dominant: SeasonType | null = null;
  const current = new Date(ci);

  while (current < co) {
    const month = current.getMonth() + 1;
    const day = current.getDate();

    for (const season of pricingConfig.seasons) {
      const { startMonth, startDay, endMonth, endDay, type } = season;
      let matches = false;
      if (startMonth <= endMonth) {
        matches =
          (month > startMonth || (month === startMonth && day >= startDay)) &&
          (month < endMonth || (month === endMonth && day <= endDay));
      } else {
        matches =
          month > startMonth ||
          (month === startMonth && day >= startDay) ||
          month < endMonth ||
          (month === endMonth && day <= endDay);
      }
      if (matches) {
        if (dominant === null || SEVERITY[type] > SEVERITY[dominant]) {
          dominant = type;
        }
        break;
      }
    }
    current.setDate(current.getDate() + 1);
  }

  if (!dominant || dominant === "closed") return null;
  return cancellationPolicies.find((p) => p.seasonType === dominant) ?? null;
}

const POLICY_ICON: Record<string, React.ReactNode> = {
  low: <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
  mid: <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />,
  high: <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
  peak: <ShieldX className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
};

export default function BookingForm({ lang, dict }: BookingFormProps) {
  const searchParams = useSearchParams();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckout = new Date(tomorrow);
  defaultCheckout.setDate(defaultCheckout.getDate() + 3);

  // Pré-remplissage depuis les query params (ex: /reserver?checkIn=2026-07-01&checkOut=2026-07-08)
  const urlCheckIn  = searchParams.get("checkIn")  ?? tomorrow.toISOString().split("T")[0];
  const urlCheckOut = searchParams.get("checkOut") ?? defaultCheckout.toISOString().split("T")[0];

  const [form, setForm] = useState<FormState>({
    checkIn: urlCheckIn,
    checkOut: urlCheckOut,
    adults: 2,
    children: 0,
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const breakdown = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return null;
    const ci = new Date(form.checkIn);
    const co = new Date(form.checkOut);
    if (co <= ci) return null;
    return calculatePrice(ci, co, lang);
  }, [form.checkIn, form.checkOut, lang]);

  const applicablePolicy = useMemo(
    () => getDominantPolicy(form.checkIn, form.checkOut),
    [form.checkIn, form.checkOut]
  );

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) errs.name = dict.errors.required;
    if (!form.email.trim()) errs.email = dict.errors.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = dict.errors.invalidEmail;
    if (!form.phone.trim()) errs.phone = dict.errors.required;
    if (form.adults + form.children > pricingConfig.maxGuests)
      errs.adults = dict.errors.maxGuests;
    if (breakdown?.hasClosedDays) errs.checkIn = dict.errors.closedPeriod;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const message = [
      `*Nova reserva Vila Caju*`,
      ``,
      `Chegada: ${form.checkIn}`,
      `Sa\u00edda: ${form.checkOut}`,
      `H\u00f3spedes: ${form.adults} adultos, ${form.children} crian\u00e7as`,
      ``,
      `Nome: ${form.name}`,
      `Email: ${form.email}`,
      `Tel: ${form.phone}`,
      form.message ? `Mensagem: ${form.message}` : "",
      ``,
      breakdown ? `Total estimado: ${formatCurrency(breakdown.total, "BRL", lang)}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    window.open(buildWhatsAppUrl(message), "_blank");
  }

  const handleCalendarDatesChange = useCallback(
    (checkIn: string, checkOut: string) => {
      setForm((prev) => ({ ...prev, checkIn, checkOut }));
    },
    []
  );

  const totalGuests = form.adults + form.children;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker
            label={dict.checkIn}
            value={form.checkIn}
            onChange={(v) => setForm({ ...form, checkIn: v })}
            min={tomorrow.toISOString().split("T")[0]}
            error={errors.checkIn}
          />
          <DatePicker
            label={dict.checkOut}
            value={form.checkOut}
            onChange={(v) => setForm({ ...form, checkOut: v })}
            min={form.checkIn}
            error={errors.checkOut}
          />
        </div>

        {/* Guests */}
        <div className="card-organic p-5 space-y-4">
          <GuestCounter
            label={dict.adults}
            value={form.adults}
            min={1}
            max={pricingConfig.maxGuests - form.children}
            onChange={(v) => setForm({ ...form, adults: v })}
          />
          <GuestCounter
            label={dict.children}
            value={form.children}
            min={0}
            max={pricingConfig.maxGuests - form.adults}
            onChange={(v) => setForm({ ...form, children: v })}
          />
          {totalGuests > pricingConfig.maxGuests && (
            <p className="text-red-500 text-xs">{dict.errors.maxGuests}</p>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
              {dict.name}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-soft bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400 transition-colors ${
                errors.name ? "border-red-400" : "border-sand-300"
              }`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
              {dict.email}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full px-4 py-3 border rounded-soft bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400 transition-colors ${
                errors.email ? "border-red-400" : "border-sand-300"
              }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
              {dict.phone}
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={`w-full px-4 py-3 border rounded-soft bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400 transition-colors ${
                errors.phone ? "border-red-400" : "border-sand-300"
              }`}
              placeholder="+55..."
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
              {dict.message}
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-sand-300 rounded-soft bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400 transition-colors resize-none"
            />
          </div>
        </div>

        <Button type="submit" variant="whatsapp" size="lg" className="w-full">
          <MessageCircle className="w-5 h-5" />
          {dict.submit}
        </Button>
      </form>

      {/* Sidebar : calendrier + récapitulatif */}
      <div>
        <div className="lg:sticky lg:top-24 space-y-6">
        {/* Calendrier de disponibilité */}
        <div className="card-organic p-6">
          <AvailabilityCalendar lang={lang} onDatesChange={handleCalendarDatesChange} />
        </div>

        {/* Récapitulatif */}
        <div className="card-organic p-6">
          <h3 className="font-heading text-xl font-bold text-charcoal-800 mb-4">
            {dict.summary}
          </h3>

          {breakdown && breakdown.nights > 0 ? (
            <div className="space-y-3">
              {breakdown.nightlyBreakdown.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-charcoal-700">
                  <span>
                    {item.label} ({item.nights} {dict.nights})
                  </span>
                  <span>{formatCurrency(item.subtotal, "BRL", lang)}</span>
                </div>
              ))}

              <div className="flex justify-between text-sm text-charcoal-700/60">
                <span>
                  {lang === "fr"
                    ? "Frais de m\u00e9nage"
                    : lang === "pt"
                    ? "Taxa de limpeza"
                    : "Cleaning fee"}
                </span>
                <span>{formatCurrency(breakdown.cleaningFee, "BRL", lang)}</span>
              </div>

              <div className="border-t border-sand-200 pt-3 flex justify-between font-bold text-charcoal-800">
                <span>{dict.total}</span>
                <div className="text-right">
                  <div>{formatCurrency(breakdown.total, "BRL", lang)}</div>
                  <div className="text-sm font-normal text-sand-500">
                    ~{formatCurrency(brlToEur(breakdown.total), "EUR", lang)}
                  </div>
                </div>
              </div>

              {/* Politique d'annulation applicable */}
              {applicablePolicy && (
                <div className="mt-4 border-t border-sand-200 pt-4">
                  <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                    {dict.cancellationPolicy}
                  </p>
                  <div className="space-y-1.5">
                    {applicablePolicy.rules.map((rule, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        {POLICY_ICON[applicablePolicy.seasonType]}
                        <span className="text-xs text-charcoal-700/80">
                          {rule.label[lang]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-charcoal-700/50 italic">
              {lang === "fr"
                ? "S\u00e9lectionnez vos dates pour voir le prix"
                : lang === "pt"
                ? "Selecione suas datas para ver o pre\u00e7o"
                : "Select your dates to see the price"}
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
