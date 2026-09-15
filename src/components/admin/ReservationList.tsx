"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, ChevronDown, ChevronUp, Pencil, CalendarX } from "lucide-react";
import type { Reservation, ReservationStatus, Season } from "@/lib/supabase/types";
import ConfirmModal from "./ConfirmModal";
import ReservationFormModal from "./ReservationFormModal";
import EmptyState from "./EmptyState";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import { useToast } from "./ToastProvider";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatBRL(amount: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
}

const STATUS_ORDER: Extract<ReservationStatus, "pending" | "confirmed" | "declined">[] = ["pending", "confirmed", "declined"];

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending:   "En attente",
  confirmed: "Confirmées",
  cancelled: "Annulées",
  declined:  "Déclinées",
};

const STATUS_BADGE: Record<ReservationStatus, string> = {
  pending:   "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
  declined:  "bg-rose-100 text-rose-600",
};

// ─── Carte réservation ────────────────────────────────────────────────────────

interface ReservationCardProps {
  reservation: Reservation;
  onConfirm: (reservation: Reservation) => void;
  onDecline: (reservation: Reservation) => void;
  onDelete: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  actionLoading: string | null;
}

function ReservationCard({ reservation: r, onConfirm, onDecline, onDelete, onEdit, actionLoading }: ReservationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isLoading = actionLoading === r.id;

  return (
    <div id={`resa-${r.id}`} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm scroll-mt-4">
      {/* En-tête */}
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 text-sm truncate">{r.guest_name}</p>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_BADGE[r.status]}`}>
              {r.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatDate(r.check_in)} → {formatDate(r.check_out)} · {r.guests_count} pers.
          </p>
          <p className="text-sm font-semibold text-terracotta-600 mt-1">
            <CurrencyDisplay amountBRL={r.total_price} lang="fr" />
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {r.status === "pending" && (
            <button
              onClick={() => onConfirm(r)}
              disabled={isLoading}
              title="Confirmer"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 text-green-600 disabled:opacity-40 transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          {r.status === "pending" && (
            <button
              onClick={() => onDecline(r)}
              disabled={isLoading}
              title="Décliner"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 disabled:opacity-40 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(r)}
            disabled={isLoading}
            title="Supprimer"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-500 disabled:opacity-40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(r)}
            title="Modifier"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
            aria-label="Détails"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Détails expandables */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600 bg-gray-50">
          <Detail label="Email"     value={r.guest_email} />
          <Detail label="Téléphone" value={r.guest_phone ?? "—"} />
          <Detail label="Pays"      value={r.guest_country ?? "—"} />
          <div>
            <p className="text-gray-400 font-medium mb-0.5">Prix/nuit</p>
            {r.price_per_night ? (
              <p className="text-gray-700"><CurrencyDisplay amountBRL={r.price_per_night} lang="fr" /></p>
            ) : (
              <p className="text-gray-700">—</p>
            )}
          </div>
          {r.message && (
            <div className="sm:col-span-2">
              <p className="text-gray-400 font-medium mb-0.5">Notes / Options</p>
              <p className="text-gray-700 leading-relaxed">{r.message}</p>
            </div>
          )}
          <Detail label="Créée le" value={new Date(r.created_at).toLocaleString("fr-FR")} />
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-400 font-medium mb-0.5">{label}</p>
      <p className="text-gray-700">{value}</p>
    </div>
  );
}

// ─── Composant principal ──────────────────────────────────────────────────────

interface ReservationListProps {
  reservations: Reservation[];
  seasons: Season[];
  cleaningFee: number;
  blockedDates: string[];
}

export default function ReservationList({ reservations, seasons, cleaningFee, blockedDates }: ReservationListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError,   setActionError]   = useState<string | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

  // Modale de confirmation (confirmer, décliner ou supprimer)
  const [modalAction, setModalAction] = useState<{
    reservation: Reservation;
    kind: "confirm" | "decline" | "delete";
  } | null>(null);

  function requestConfirm(reservation: Reservation) {
    setModalAction({ reservation, kind: "confirm" });
  }

  function requestDecline(reservation: Reservation) {
    setModalAction({ reservation, kind: "decline" });
  }

  function requestDelete(reservation: Reservation) {
    setModalAction({ reservation, kind: "delete" });
  }

  async function executeAction() {
    if (!modalAction) return;
    const { reservation, kind } = modalAction;

    setActionLoading(reservation.id);
    setActionError(null);
    setModalAction(null);

    const res = await fetch(`/api/admin/reservations/${reservation.id}`, {
      method: kind === "delete" ? "DELETE" : "PATCH",
      headers: kind === "delete" ? undefined : { "Content-Type": "application/json" },
      body: kind === "confirm"
        ? JSON.stringify({ status: "confirmed" })
        : kind === "decline"
          ? JSON.stringify({ status: "declined" })
          : undefined,
    });

    setActionLoading(null);

    if (!res.ok && res.status !== 204) {
      const data = await res.json() as { error: string };
      const errorMsg = typeof data.error === "string" ? data.error : "Erreur serveur";
      setActionError(errorMsg);
      toast("error", errorMsg);
      return;
    }

    const successMessages: Record<typeof kind, string> = {
      confirm: `Réservation de ${reservation.guest_name} confirmée`,
      decline: `Réservation de ${reservation.guest_name} déclinée`,
      delete:  `Réservation de ${reservation.guest_name} supprimée`,
    };
    toast("success", successMessages[kind]);
    router.refresh();
  }

  function handleEditSaved() {
    setEditingReservation(null);
    toast("success", "Réservation modifiée");
    router.refresh();
  }

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    items: reservations.filter((r) => r.status === status),
  }));

  const total = reservations.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800 text-base">
          Réservations <span className="text-gray-400 font-normal text-sm">({total})</span>
        </h2>
        {actionError && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
            {actionError}
          </p>
        )}
      </div>

      <div className="space-y-8">
        {grouped.map(({ status, items }) =>
          items.length === 0 ? null : (
            <section key={status}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {STATUS_LABELS[status]} ({items.length})
              </h3>
              <div className="space-y-3">
                {items.map((r) => (
                  <ReservationCard
                    key={r.id}
                    reservation={r}
                    onConfirm={requestConfirm}
                    onDecline={requestDecline}
                    onDelete={requestDelete}
                    onEdit={setEditingReservation}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
            </section>
          ),
        )}

        {total === 0 && (
          <EmptyState
            icon={CalendarX}
            title="Aucune réservation pour le moment"
            hint="Les nouvelles demandes reçues depuis le site apparaîtront ici automatiquement."
          />
        )}
      </div>

      {/* Modale de confirmation */}
      <ConfirmModal
        open={modalAction !== null}
        title={
          modalAction?.kind === "confirm"
            ? "Confirmer cette réservation ?"
            : modalAction?.kind === "decline"
              ? "Décliner cette demande ?"
              : "Supprimer cette réservation ?"
        }
        description={
          modalAction
            ? `${modalAction.reservation.guest_name} · ${formatDate(modalAction.reservation.check_in)} → ${formatDate(modalAction.reservation.check_out)} · ${formatBRL(modalAction.reservation.total_price)}${
                modalAction.kind === "delete"
                  ? " — définitif, non récupérable."
                  : modalAction.kind === "decline"
                    ? " — les dates redeviennent disponibles, la demande reste consultable dans \"Déclinées\"."
                    : ""
              }`
            : ""
        }
        confirmLabel={
          modalAction?.kind === "confirm"
            ? "Confirmer"
            : modalAction?.kind === "decline"
              ? "Décliner"
              : "Supprimer"
        }
        variant={modalAction?.kind === "delete" ? "danger" : "default"}
        loading={actionLoading !== null}
        onConfirm={executeAction}
        onCancel={() => setModalAction(null)}
      />

      {/* Modale d'édition */}
      {editingReservation && (
        <ReservationFormModal
          mode="edit"
          seasons={seasons}
          cleaningFee={cleaningFee}
          blockedDates={blockedDates}
          reservation={editingReservation}
          onClose={() => setEditingReservation(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
