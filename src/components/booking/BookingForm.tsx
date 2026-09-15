"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MessageCircle, ShieldX, AlertTriangle, CheckCircle } from "lucide-react";
import { calculatePrice } from "@/lib/pricing";
import { formatCurrency, brlToEur } from "@/lib/utils";
import { pricingConfig } from "@/lib/pricing/seasons";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Season } from "@/lib/supabase/types";
import DatePicker from "./DatePicker";
import GuestCounter from "./GuestCounter";
import Button from "@/components/ui/Button";
import AvailabilityCalendar from "@/components/pricing/AvailabilityCalendar";

type SubmitState = "idle" | "loading" | "success" | "error";

interface BookingFormProps {
  lang: Locale;
  dict: Dictionary["booking"];
  blockedDates: string[];
  seasons: Season[];
  cleaningFee: number;
}

interface FormState {
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}

function rangeHasBlockedDate(checkIn: string, checkOut: string, blocked: string[]): boolean {
  if (!checkIn || !checkOut) return false;
  const blockedSet = new Set(blocked);
  const [ciY, ciM, ciD] = checkIn.split("-").map(Number);
  const [coY, coM, coD] = checkOut.split("-").map(Number);
  const current = new Date(ciY, ciM - 1, ciD);
  const end = new Date(coY, coM - 1, coD);

  while (current < end) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`;
    if (blockedSet.has(key)) return true;
    current.setDate(current.getDate() + 1);
  }
  return false;
}

export default function BookingForm({ lang, dict, blockedDates, seasons, cleaningFee }: BookingFormProps) {
  const searchParams = useSearchParams();
  const { eurRate } = useCurrency();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckout = new Date(tomorrow);
  defaultCheckout.setDate(defaultCheckout.getDate() + 3);

  function toLocalStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  const urlCheckIn  = searchParams.get("checkIn")  ?? toLocalStr(tomorrow);
  const urlCheckOut = searchParams.get("checkOut") ?? toLocalStr(defaultCheckout);

  const [form, setForm] = useState<FormState>({
    checkIn:  urlCheckIn,
    checkOut: urlCheckOut,
    adults:   2,
    children: 0,
    name:     "",
    email:    "",
    phone:    "",
    country:  "",
    message:  "",
  });

  const [errors, setErrors]           = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  // Parse YYYY-MM-DD en heure locale (évite le décalage UTC en fuseau négatif)
  function parseLocal(str: string): Date {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const rangeBlocked = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return false;
    const ci = parseLocal(form.checkIn);
    const co = parseLocal(form.checkOut);
    if (co <= ci) return false;
    return rangeHasBlockedDate(form.checkIn, form.checkOut, blockedDates);
  }, [form.checkIn, form.checkOut, blockedDates]);

  const nightsCount = useMemo(() => {
    if (!form.checkIn || !form.checkOut) return 0;
    const ci = parseLocal(form.checkIn);
    const co = parseLocal(form.checkOut);
    return Math.max(0, Math.round((co.getTime() - ci.getTime()) / (1000 * 60 * 60 * 24)));
  }, [form.checkIn, form.checkOut]);

  const priceResult = useMemo(() => {
    if (!form.checkIn || !form.checkOut || seasons.length === 0) return null;
    const ci = parseLocal(form.checkIn);
    const co = parseLocal(form.checkOut);
    if (co <= ci) return null;
    return calculatePrice(ci, co, seasons, cleaningFee);
  }, [form.checkIn, form.checkOut, seasons, cleaningFee]);

  const isSeasonClosed = priceResult?.season.name === "closed";
  const minNights = priceResult?.minNights ?? 3;

  const isFormComplete = useMemo(() => (
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.phone.trim() !== ""
  ), [form.name, form.email, form.phone]);

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState, string>> = {};

    if (!form.name.trim())  errs.name  = dict.errors.required;
    if (!form.email.trim()) errs.email = dict.errors.required;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = dict.errors.invalidEmail;
    if (!form.phone.trim()) errs.phone = dict.errors.required;

    if (form.adults + form.children > pricingConfig.maxGuests)
      errs.adults = dict.errors.maxGuests;
    if (isSeasonClosed)
      errs.checkIn = dict.errors.closedPeriod;
    else if (rangeBlocked)
      errs.checkIn = dict.errors.unavailableDates;
    else if (nightsCount > 0 && nightsCount < minNights)
      errs.checkIn = dict.errors.minStay.replace("{min}", String(minNights));

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitState("loading");
    setSubmitError(null);

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest_name:    form.name,
          guest_email:   form.email,
          guest_phone:   form.phone,
          check_in:      form.checkIn,
          check_out:     form.checkOut,
          guests_count:  form.adults + form.children,
          total_price:      priceResult?.totalPrice   ?? 0,
          price_per_night:  priceResult?.pricePerNight ?? undefined,
          season_id:        priceResult?.season.id     ?? undefined,
          guest_country:    form.country  || undefined,
          message:          form.message  || undefined,
        }),
      });

      const json = await response.json() as { success?: boolean; id?: string; whatsappUrl?: string; error?: string };

      if (!response.ok || !json.success) {
        setSubmitState("error");
        setSubmitError(json.error ?? dict.errors.submitError);
        return;
      }

      setWhatsappUrl(json.whatsappUrl ?? null);
      setSubmitState("success");
    } catch {
      setSubmitState("error");
      setSubmitError(dict.errors.submitError);
    }
  }

  const handleCalendarDatesChange = useCallback(
    (checkIn: string, checkOut: string) => {
      setForm((prev) => ({ ...prev, checkIn, checkOut }));
    },
    [],
  );

  const totalGuests = form.adults + form.children;
  const canSubmit   = isFormComplete && !rangeBlocked && !isSeasonClosed && !(nightsCount > 0 && nightsCount < minNights);

  // ── Écran de succès ─────────────────────────────────────────────────────────
  if (submitState === "success") {
    return (
      <div className="max-w-lg mx-auto text-center space-y-6 py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="font-heading text-2xl font-bold text-charcoal-800">
          {dict.successTitle}
        </h2>
        <p className="text-charcoal-600">{dict.successText}</p>
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-6 py-3 rounded-soft hover:bg-[#1ebe5c] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            {dict.successWhatsapp}
          </a>
        )}
      </div>
    );
  }

  // ── Formulaire ──────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Colonne gauche : formulaire */}
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

        {/* Voyageurs */}
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

        {/* Coordonnées */}
        <div className="space-y-4">
          {/* Nom */}
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

          {/* Email */}
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

          {/* Téléphone */}
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

          {/* Pays */}
          <div>
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
              {dict.country}
            </label>
            <input
              type="text"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full px-4 py-3 border border-sand-300 rounded-soft bg-white text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400 transition-colors"
            />
          </div>

          {/* Message */}
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

        {/* Alertes */}
        {nightsCount > 0 && nightsCount < minNights && !rangeBlocked && !isSeasonClosed && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-soft px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 font-medium">
              {dict.errors.minStay.replace("{min}", String(minNights))}
            </p>
          </div>
        )}

        {isSeasonClosed && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-soft px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{dict.errors.closedPeriod}</p>
          </div>
        )}

        {rangeBlocked && !isSeasonClosed && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-soft px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{dict.errors.unavailableDates}</p>
          </div>
        )}

        {submitState === "error" && submitError && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-soft px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{submitError}</p>
          </div>
        )}

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
          disabled={!canSubmit || submitState === "loading"}
        >
          <MessageCircle className="w-5 h-5" />
          {submitState === "loading" ? dict.loading : dict.submit}
        </Button>
      </form>

      {/* Colonne droite : calendrier + récapitulatif */}
      <div>
        <div className="lg:sticky lg:top-24 space-y-6">
          {/* Calendrier de disponibilité */}
          <div className="card-organic p-6">
            <AvailabilityCalendar
              lang={lang}
              blockedDates={blockedDates}
              seasons={seasons}
              onDatesChange={handleCalendarDatesChange}
              initialCheckIn={searchParams.get("checkIn")}
              initialCheckOut={searchParams.get("checkOut")}
            />
          </div>

          {/* Récapitulatif de prix */}
          <div className="card-organic p-6">
            <h3 className="font-heading text-xl font-bold text-charcoal-800 mb-4">
              {dict.summary}
            </h3>

            {priceResult && priceResult.nights > 0 && !isSeasonClosed ? (
              <div className="space-y-3">
                {(() => {
                  const isPt = lang === "pt";
                  const primary   = (brl: number) => isPt ? formatCurrency(brl, "BRL", lang) : formatCurrency(brlToEur(brl, eurRate), "EUR", lang);
                  const secondary = (brl: number) => isPt ? `~${formatCurrency(brlToEur(brl, eurRate), "EUR", lang)}` : `~${formatCurrency(brl, "BRL", lang)}`;

                  const nightsPrice = priceResult.pricePerNight * priceResult.nights;
                  const cleaningFee = priceResult.totalPrice - nightsPrice;

                  return (
                    <>
                      <div className="flex justify-between text-sm text-charcoal-700">
                        <span>
                          {primary(priceResult.pricePerNight)} {dict.perNight} × {priceResult.nights} {dict.nights}
                        </span>
                        <span>{primary(nightsPrice)}</span>
                      </div>

                      {cleaningFee > 0 && (
                        <div className="flex justify-between text-sm text-charcoal-700">
                          <span>{dict.cleaningFee}</span>
                          <span>{primary(cleaningFee)}</span>
                        </div>
                      )}

                      <div className="border-t border-sand-200 pt-3 flex justify-between font-bold text-charcoal-800">
                        <span>{dict.total}</span>
                        <div className="text-right">
                          <div>{primary(priceResult.totalPrice)}</div>
                          <div className="text-sm font-normal text-sand-500">
                            {secondary(priceResult.totalPrice)}
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
                  ? "Sélectionnez vos dates pour voir le prix"
                  : lang === "pt"
                  ? "Selecione suas datas para ver o preço"
                  : "Select your dates to see the price"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
