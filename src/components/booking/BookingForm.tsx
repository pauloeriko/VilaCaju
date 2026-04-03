"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, ShieldX, AlertTriangle } from "lucide-react";
import { calculatePrice } from "@/lib/pricing/calculator";
import { formatCurrency, brlToEur, buildWhatsAppUrl } from "@/lib/utils";
import { pricingConfig } from "@/lib/pricing/seasons";
import { rangeContainsUnavailable } from "@/lib/pricing/availability";
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


export default function BookingForm({ lang, dict }: BookingFormProps) {
  const searchParams = useSearchParams();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckout = new Date(tomorrow);
  defaultCheckout.setDate(defaultCheckout.getDate() + 3);

  // Pré-remplissage depuis les query params (ex: /reserver?checkIn=2026-07-01&checkOut=2026-07-08)
  const calendarInitialCheckIn  = searchParams.get("checkIn");
  const calendarInitialCheckOut = searchParams.get("checkOut");
  const urlCheckIn  = calendarInitialCheckIn  ?? tomorrow.toISOString().split("T")[0];
  const urlCheckOut = calendarInitialCheckOut ?? defaultCheckout.toISOString().split("T")[0];

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

  const MIN_NIGHTS = 3;

  // Validation : dates occupées ou fermeture annuelle dans la plage
  const rangeError = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return false;
    const ci = new Date(form.checkIn);
    const co = new Date(form.checkOut);
    if (co <= ci) return false;
    return rangeContainsUnavailable(form.checkIn, form.checkOut);
  }, [form.checkIn, form.checkOut]);

  // Le formulaire est complet quand tous les champs requis sont remplis
  const isFormComplete = useMemo(() => (
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.phone.trim() !== ""
  ), [form.name, form.email, form.phone]);

  const nightsCount = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const ci = new Date(form.checkIn);
    const co = new Date(form.checkOut);
    return Math.max(0, Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)));
  }, [form.checkIn, form.checkOut]);

  const breakdown = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return null;
    const ci = new Date(form.checkIn);
    const co = new Date(form.checkOut);
    if (co <= ci) return null;
    return calculatePrice(ci, co, lang);
  }, [form.checkIn, form.checkOut, lang]);

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim()) errs.name = dict.errors.required;
    if (!form.email.trim()) errs.email = dict.errors.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = dict.errors.invalidEmail;
    if (!form.phone.trim()) errs.phone = dict.errors.required;
    if (form.adults + form.children > pricingConfig.maxGuests)
      errs.adults = dict.errors.maxGuests;
    if (breakdown?.hasClosedDays || rangeError) errs.checkIn = dict.errors.closedPeriod;
    if (nightsCount > 0 && nightsCount < MIN_NIGHTS) {
      errs.checkIn = dict.errors.minStay.replace("{min}", String(MIN_NIGHTS));
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Libellés localisés du message WhatsApp
    const labels = {
      fr: {
        title:    "*Nouvelle demande de réservation — Vila Caju*",
        checkIn:  "Arrivée",
        checkOut: "Départ",
        guests:   (a: number, c: number) => `${a} adulte${a > 1 ? "s" : ""}${c > 0 ? `, ${c} enfant${c > 1 ? "s" : ""}` : ""}`,
        name:     "Nom",
        email:    "Email",
        phone:    "Tél",
        msg:      "Message",
        total:    "Total estimé",
      },
      en: {
        title:    "*New booking request — Vila Caju*",
        checkIn:  "Check-in",
        checkOut: "Check-out",
        guests:   (a: number, c: number) => `${a} adult${a > 1 ? "s" : ""}${c > 0 ? `, ${c} child${c > 1 ? "ren" : ""}` : ""}`,
        name:     "Name",
        email:    "Email",
        phone:    "Phone",
        msg:      "Message",
        total:    "Estimated total",
      },
      pt: {
        title:    "*Nova solicitação de reserva — Vila Caju*",
        checkIn:  "Chegada",
        checkOut: "Saída",
        guests:   (a: number, c: number) => `${a} adulto${a > 1 ? "s" : ""}${c > 0 ? `, ${c} criança${c > 1 ? "s" : ""}` : ""}`,
        name:     "Nome",
        email:    "Email",
        phone:    "Tel",
        msg:      "Mensagem",
        total:    "Total estimado",
      },
    } as const;

    const l = labels[lang];

    const message = [
      l.title,
      ``,
      `${l.checkIn}: ${form.checkIn}`,
      `${l.checkOut}: ${form.checkOut}`,
      `${l.guests(form.adults, form.children)}`,
      ``,
      `${l.name}: ${form.name}`,
      `${l.email}: ${form.email}`,
      `${l.phone}: ${form.phone}`,
      form.message ? `${l.msg}: ${form.message}` : "",
      ``,
      breakdown
        ? `${l.total}: ${
            lang === "pt"
              ? formatCurrency(breakdown.total, "BRL", lang)
              : formatCurrency(brlToEur(breakdown.total), "EUR", lang)
          }`
        : "",
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

        {/* Alerte durée minimale */}
        {nightsCount > 0 && nightsCount < MIN_NIGHTS && !rangeError && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-soft px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 font-medium">
              {dict.errors.minStay.replace("{min}", String(MIN_NIGHTS))}
            </p>
          </div>
        )}

        {/* Alerte dates non disponibles */}
        {rangeError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-soft px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">
              {lang === "fr"
                ? "Cette période contient des dates déjà réservées ou en fermeture annuelle."
                : lang === "pt"
                ? "Este período contém datas já reservadas ou em fechamento anual."
                : "This period contains already booked or closed dates."}
            </p>
          </div>
        )}

        {/* Indicateur champs manquants */}
        {!isFormComplete && (
          <p className="text-sm text-charcoal-400 text-center">
            {lang === "fr"
              ? "Remplissez tous les champs pour envoyer votre demande."
              : lang === "pt"
              ? "Preencha todos os campos para enviar sua solicitação."
              : "Fill in all fields to send your request."}
          </p>
        )}

        <Button
          type="submit"
          variant="whatsapp"
          size="lg"
          className="w-full"
          disabled={!isFormComplete || rangeError || (nightsCount > 0 && nightsCount < MIN_NIGHTS)}
        >
          <MessageCircle className="w-5 h-5" />
          {dict.submit}
        </Button>
      </form>

      {/* Sidebar : calendrier + récapitulatif */}
      <div>
        <div className="lg:sticky lg:top-24 space-y-6">
        {/* Calendrier de disponibilité */}
        <div className="card-organic p-6">
          <AvailabilityCalendar
            lang={lang}
            onDatesChange={handleCalendarDatesChange}
            initialCheckIn={calendarInitialCheckIn}
            initialCheckOut={calendarInitialCheckOut}
          />
        </div>

        {/* Récapitulatif */}
        <div className="card-organic p-6">
          <h3 className="font-heading text-xl font-bold text-charcoal-800 mb-4">
            {dict.summary}
          </h3>

          {breakdown && breakdown.nights > 0 ? (
            <div className="space-y-3">
              {(() => {
                // FR/EN → EUR en principal, PT → BRL en principal
                const isPt = lang === "pt";
                const primary   = (brl: number) => isPt ? formatCurrency(brl, "BRL", lang) : formatCurrency(brlToEur(brl), "EUR", lang);
                const secondary = (brl: number) => isPt ? `~${formatCurrency(brlToEur(brl), "EUR", lang)}` : `~${formatCurrency(brl, "BRL", lang)}`;

                return (
                  <>
                    {breakdown.nightlyBreakdown.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm text-charcoal-700">
                        <span>{item.label} ({item.nights} {dict.nights})</span>
                        <span>{primary(item.subtotal)}</span>
                      </div>
                    ))}

                    <div className="border-t border-sand-200 pt-3 flex justify-between font-bold text-charcoal-800">
                      <span>{dict.total}</span>
                      <div className="text-right">
                        <div>{primary(breakdown.total)}</div>
                        <div className="text-sm font-normal text-sand-500">
                          {secondary(breakdown.total)}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Politique d'annulation */}
              <div className="mt-4 border-t border-sand-200 pt-4">
                <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-2">
                  {dict.cancellationPolicy}
                </p>
                <div className="flex items-start gap-1.5">
                  <ShieldX className="w-4 h-4 text-terracotta-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-charcoal-700/80">
                    {lang === "fr"
                      ? "Les séjours sont fermes et définitifs — aucun remboursement en cas d'annulation."
                      : lang === "pt"
                      ? "As reservas são firmes e definitivas — sem reembolso em caso de cancelamento."
                      : "Bookings are firm and final — no refund in case of cancellation."}
                  </span>
                </div>
              </div>
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
