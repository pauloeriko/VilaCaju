"use client";

import { useMemo, useState } from "react";
import { X, Pencil } from "lucide-react";
import { calculatePrice } from "@/lib/pricing";
import { brlToEur, formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import AvailabilityCalendar from "@/components/pricing/AvailabilityCalendar";
import type { Reservation, Season } from "@/lib/supabase/types";

interface ReservationFormModalProps {
  mode: "create" | "edit";
  seasons: Season[];
  cleaningFee: number;
  blockedDates: string[];
  reservation?: Reservation;
  initialDates?: { check_in: string; check_out: string };
  convertBlockedDateId?: string;
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  guest_country: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  price_per_night: number;
  total_price: number;
  message: string;
  confirmed: boolean;
}

function toForm(reservation?: Reservation, initialDates?: { check_in: string; check_out: string }): FormState {
  if (!reservation) {
    return {
      guest_name: "", guest_email: "", guest_phone: "", guest_country: "",
      check_in: initialDates?.check_in ?? "", check_out: initialDates?.check_out ?? "", guests_count: 2,
      price_per_night: 0, total_price: 0, message: "", confirmed: false,
    };
  }
  return {
    guest_name: reservation.guest_name,
    guest_email: reservation.guest_email,
    guest_phone: reservation.guest_phone ?? "",
    guest_country: reservation.guest_country ?? "",
    check_in: reservation.check_in,
    check_out: reservation.check_out,
    guests_count: reservation.guests_count,
    price_per_night: reservation.price_per_night ?? 0,
    total_price: reservation.total_price,
    message: reservation.message ?? "",
    confirmed: reservation.status === "confirmed",
  };
}

function parseLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function expandRange(start: string, end: string): string[] {
  if (!start || !end) return [];
  const dates: string[] = [];
  const current = parseLocal(start);
  const last = parseLocal(end);
  while (current < last) {
    dates.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}-${String(current.getDate()).padStart(2, "0")}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-400/50 focus:border-terracotta-400";

export default function ReservationFormModal({
  mode, seasons, cleaningFee, blockedDates, reservation, initialDates, convertBlockedDateId, onClose, onSaved,
}: ReservationFormModalProps) {
  const [form, setForm] = useState<FormState>(() => toForm(reservation, initialDates));
  const [priceLocked, setPriceLocked] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { eurRate } = useCurrency();

  useEscapeKey(onClose);

  // Une réservation (ou le blocage qu'on est en train de convertir) ne doit pas
  // se bloquer elle-même dans le calendrier de sélection.
  const selectableBlockedDates = useMemo(() => {
    const ownRange = reservation
      ? expandRange(reservation.check_in, reservation.check_out)
      : initialDates
      ? expandRange(initialDates.check_in, initialDates.check_out)
      : [];
    const ownSet = new Set(ownRange);
    return blockedDates.filter((d) => !ownSet.has(d));
  }, [blockedDates, reservation, initialDates]);

  function updateDates(checkIn: string, checkOut: string) {
    const next: Partial<FormState> = { check_in: checkIn, check_out: checkOut };

    if (priceLocked && checkIn && checkOut && seasons.length > 0) {
      const ci = parseLocal(checkIn);
      const co = parseLocal(checkOut);
      if (co > ci) {
        const result = calculatePrice(ci, co, seasons, cleaningFee);
        if (result) {
          next.price_per_night = result.pricePerNight;
          next.total_price = result.totalPrice;
        }
      }
    }

    setForm((f) => ({ ...f, ...next }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!form.check_in || !form.check_out) {
      setError("Sélectionne les dates d'arrivée et de départ dans le calendrier.");
      setLoading(false);
      return;
    }

    // En édition, un champ optionnel vidé doit effacer la valeur (null) plutôt que
    // d'être omis (undefined), sans quoi l'ancienne valeur resterait en base.
    const empty = mode === "edit" ? null : undefined;

    const payload = {
      guest_name: form.guest_name.trim(),
      guest_email: form.guest_email.trim(),
      guest_phone: form.guest_phone.trim(),
      guest_country: form.guest_country.trim() || empty,
      check_in: form.check_in,
      check_out: form.check_out,
      guests_count: form.guests_count,
      price_per_night: form.price_per_night || empty,
      total_price: form.total_price,
      message: form.message.trim() || empty,
    };

    const url = mode === "create"
      ? "/api/admin/reservations"
      : `/api/admin/reservations/${reservation!.id}`;
    const method = mode === "create" ? "POST" : "PUT";
    const body = mode === "create"
      ? { ...payload, confirmed: form.confirmed, convertBlockedDateId }
      : payload;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json() as { error: string };
      setError(typeof data.error === "string" ? data.error : "Erreur serveur");
      return;
    }

    onSaved();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="font-semibold text-gray-800">
            {mode === "create" ? "Nouvelle réservation" : "Modifier la réservation"}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-xs text-gray-400 -mt-3">
            {convertBlockedDateId
              ? "Sélectionne les dates exactes de cette réservation. Si elles ne couvrent qu'une partie du blocage, le reste restera bloqué — pratique pour créer plusieurs réservations à partir d'un même blocage (ex: un mois entier réparti en 3 séjours)."
              : mode === "create"
              ? "Pour une réservation reçue par téléphone ou email. Les dates déjà prises sont grisées."
              : "Les dates bloquées seront automatiquement mises à jour."}
          </p>

          {/* Calendrier de sélection des dates */}
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
            <AvailabilityCalendar
              lang="fr"
              blockedDates={selectableBlockedDates}
              seasons={seasons}
              onDatesChange={updateDates}
              initialCheckIn={form.check_in || null}
              initialCheckOut={form.check_out || null}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nom du client">
              <input
                required value={form.guest_name}
                onChange={(e) => setForm({ ...form, guest_name: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Email">
              <input
                type="email" required value={form.guest_email}
                onChange={(e) => setForm({ ...form, guest_email: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Téléphone">
              <input
                required value={form.guest_phone}
                onChange={(e) => setForm({ ...form, guest_phone: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Pays (optionnel)">
              <input
                value={form.guest_country}
                onChange={(e) => setForm({ ...form, guest_country: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Nombre de personnes">
              <input
                type="number" min={1} max={17} required value={form.guests_count}
                onChange={(e) => setForm({ ...form, guests_count: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Prix — calculé automatiquement, verrouillé par défaut */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-600">Prix (calculé automatiquement selon la saison)</p>
              {priceLocked ? (
                <button
                  type="button"
                  onClick={() => setPriceLocked(false)}
                  className="flex items-center gap-1 text-xs text-terracotta-600 hover:text-terracotta-700 font-medium"
                >
                  <Pencil className="w-3 h-3" />
                  Modifier manuellement
                </button>
              ) : (
                <span className="text-xs text-amber-600 font-medium">Modification manuelle activée</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Prix / nuit (BRL)">
                {priceLocked ? (
                  <p className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                    {form.price_per_night > 0
                      ? `${form.price_per_night.toLocaleString("pt-BR")} (~${formatCurrency(brlToEur(form.price_per_night, eurRate), "EUR", "fr")})`
                      : "—"}
                  </p>
                ) : (
                  <input
                    type="number" min={0} step={50} value={form.price_per_night}
                    onChange={(e) => setForm({ ...form, price_per_night: Number(e.target.value) })}
                    className={inputClass}
                  />
                )}
              </Field>
              <Field label="Prix total (BRL)">
                {priceLocked ? (
                  <p className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-900">
                    {form.total_price > 0
                      ? `${form.total_price.toLocaleString("pt-BR")} (~${formatCurrency(brlToEur(form.total_price, eurRate), "EUR", "fr")})`
                      : "—"}
                  </p>
                ) : (
                  <input
                    type="number" min={0} step={50} required value={form.total_price}
                    onChange={(e) => setForm({ ...form, total_price: Number(e.target.value) })}
                    className={inputClass}
                  />
                )}
              </Field>
            </div>
            {priceLocked && form.total_price === 0 && (
              <p className="text-[11px] text-gray-400 mt-2">Sélectionne des dates dans le calendrier pour calculer le prix.</p>
            )}
          </div>

          <Field label="Notes / Options (optionnel)">
            <textarea
              rows={2} value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className={`${inputClass} resize-none`}
            />
          </Field>

          {mode === "create" && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox" checked={form.confirmed}
                onChange={(e) => setForm({ ...form, confirmed: e.target.checked })}
                className="rounded border-gray-300"
              />
              Marquer comme confirmée immédiatement (déjà actée avec le client)
            </label>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2 rounded-lg bg-terracotta-500 hover:bg-terracotta-600 text-white text-sm font-medium disabled:opacity-60 transition-colors"
            >
              {loading ? "..." : mode === "create" ? "Créer" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
