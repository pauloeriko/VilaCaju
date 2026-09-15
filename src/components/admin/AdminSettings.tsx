"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import type { Settings } from "@/lib/supabase/types";
import { brlToEur, formatCurrency } from "@/lib/utils";
import { useCurrency } from "@/lib/currency/CurrencyContext";
import { useToast } from "./ToastProvider";

interface AdminSettingsProps {
  settings: Settings;
}

interface EditableRowProps {
  label: string;
  value: number | string;
  displayValue: string;
  hint?: string;
  onSave: (value: string) => Promise<void>;
}

function EditableRow({ label, value, displayValue, hint, onSave }: EditableRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    await onSave(draft);
    setLoading(false);
    setEditing(false);
  }

  return (
    <div className="py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{label}</span>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-32 px-2 py-1 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
            />
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 text-green-600 disabled:opacity-40"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setDraft(String(value)); setEditing(false); }}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="group flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-terracotta-600"
          >
            {displayValue}
            <Pencil className="w-3.5 h-3.5 text-gray-300 group-hover:text-terracotta-500" />
          </button>
        )}
      </div>
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function AdminSettings({ settings }: AdminSettingsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { eurRate } = useCurrency();

  async function save(field: string, value: string) {
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: field === "whatsapp_number" ? value : Number(value) }),
    });

    if (!res.ok) {
      const data = await res.json() as { error: string };
      toast("error", typeof data.error === "string" ? data.error : "Erreur serveur");
      return;
    }

    toast("success", "Paramètre mis à jour");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 text-base mb-1">Tarification</h2>
        <p className="text-xs text-gray-400 mb-4">
          Ces valeurs sont utilisées immédiatement dans le calcul des prix affichés aux visiteurs.
        </p>
        <EditableRow
          label="Frais de ménage"
          value={settings.cleaning_fee}
          displayValue={`${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(settings.cleaning_fee)} (~${formatCurrency(brlToEur(settings.cleaning_fee, eurRate), "EUR", "fr")})`}
          hint="Ajouté au total de chaque réservation."
          onSave={(v) => save("cleaning_fee", v)}
        />
        <EditableRow
          label="Taux EUR/BRL"
          value={settings.eur_rate}
          displayValue={`1 EUR = ${settings.eur_rate} BRL`}
          hint="Utilisé pour afficher les prix en euros aux visiteurs européens."
          onSave={(v) => save("eur_rate", v)}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 text-base mb-1">Contact</h2>
        <p className="text-xs text-gray-400 mb-4">
          Numéro utilisé pour être contacté après une nouvelle réservation.
        </p>
        <EditableRow
          label="WhatsApp"
          value={settings.whatsapp_number}
          displayValue={`+${settings.whatsapp_number}`}
          onSave={(v) => save("whatsapp_number", v)}
        />
      </div>

      <p className="text-xs text-gray-400 text-center">
        Clique sur une valeur pour la modifier.
      </p>
    </div>
  );
}
