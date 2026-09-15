"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Check, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Season, SeasonName } from "@/lib/supabase/types";
import EmptyState from "./EmptyState";
import CurrencyDisplay from "@/components/ui/CurrencyDisplay";
import { useToast } from "./ToastProvider";

// ─── Labels & couleurs ───────────────────────────────────────────────────────

const SEASON_LABELS: Record<SeasonName, string> = {
  low: "Basse saison",
  mid: "Moyenne saison",
  high: "Haute saison",
  peak: "Très haute saison",
  closed: "Fermé",
};

const SEASON_COLORS: Record<SeasonName, string> = {
  low: "bg-blue-100 text-blue-700",
  mid: "bg-amber-100 text-amber-700",
  high: "bg-terracotta-100 text-terracotta-700",
  peak: "bg-red-100 text-red-700",
  closed: "bg-gray-100 text-gray-600",
};

const SEASON_ORDER: SeasonName[] = ["low", "mid", "high", "peak", "closed"];

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function formatMonthDay(month: number, day: number): string {
  return `${day} ${MONTHS_FR[month - 1].slice(0, 3)}`;
}

// ─── Formulaire période (mois/jour uniquement) ─────────────────────────────

interface PeriodFormData {
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
}

function PeriodForm({
  initial, onSubmit, onCancel, loading, error,
}: {
  initial: PeriodFormData;
  onSubmit: (data: PeriodFormData) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | null;
}) {
  const [form, setForm] = useState<PeriodFormData>(initial);

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}
      className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Début</label>
          <div className="flex gap-2">
            <select
              value={form.start_month}
              onChange={(e) => setForm({ ...form, start_month: Number(e.target.value) })}
              className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
            >
              {MONTHS_FR.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <input
              type="number" min={1} max={31} value={form.start_day}
              onChange={(e) => setForm({ ...form, start_day: Number(e.target.value) })}
              className="w-14 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Fin</label>
          <div className="flex gap-2">
            <select
              value={form.end_month}
              onChange={(e) => setForm({ ...form, end_month: Number(e.target.value) })}
              className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
            >
              {MONTHS_FR.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <input
              type="number" min={1} max={31} value={form.end_day}
              onChange={(e) => setForm({ ...form, end_day: Number(e.target.value) })}
              className="w-14 px-2 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-100">
          Annuler
        </button>
        <button type="submit" disabled={loading} className="flex-1 py-1.5 rounded-lg bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-medium disabled:opacity-60">
          {loading ? "..." : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}

// ─── Groupe (un type de saison + ses périodes) ─────────────────────────────

interface SeasonGroupProps {
  name: SeasonName;
  periods: Season[];
  onRefresh: () => void;
}

function SeasonGroup({ name, periods, onRefresh }: SeasonGroupProps) {
  const { toast } = useToast();
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceDraft, setPriceDraft] = useState(String(periods[0].price_per_night));
  const [minNightsDraft, setMinNightsDraft] = useState(String(periods[0].min_nights));
  const [addingPeriod, setAddingPeriod] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function savePrice() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/seasons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        price_per_night: Number(priceDraft),
        min_nights: Number(minNightsDraft),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json() as { error: string };
      setError(data.error);
      return;
    }
    setEditingPrice(false);
    toast("success", `Tarif "${SEASON_LABELS[name]}" mis à jour (${periods.length} période${periods.length > 1 ? "s" : ""})`);
    onRefresh();
  }

  async function addPeriod(data: PeriodFormData) {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        ...data,
        price_per_night: periods[0].price_per_night,
        min_nights: periods[0].min_nights,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const resBody = await res.json() as { error: string };
      setError(resBody.error);
      return;
    }
    setAddingPeriod(false);
    toast("success", "Période ajoutée");
    onRefresh();
  }

  async function editPeriod(id: string, data: PeriodFormData) {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/seasons/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);
    if (!res.ok) {
      const resBody = await res.json() as { error: string };
      setError(resBody.error);
      return;
    }
    setEditingPeriodId(null);
    toast("success", "Période modifiée");
    onRefresh();
  }

  async function deletePeriod(id: string) {
    setLoading(true);
    const res = await fetch(`/api/admin/seasons/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok && res.status !== 204) {
      const resBody = await res.json() as { error: string };
      toast("error", resBody.error);
      return;
    }
    setDeleteConfirm(null);
    toast("success", "Période supprimée");
    onRefresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Tarif du type de saison */}
      <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-gray-100 bg-gray-50/60">
        <span className={cn("text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap", SEASON_COLORS[name])}>
          {SEASON_LABELS[name]}
        </span>

        {editingPrice ? (
          <div className="flex items-center gap-2">
            <input
              type="number" min={0} step={50} value={priceDraft}
              onChange={(e) => setPriceDraft(e.target.value)}
              className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
            />
            <span className="text-xs text-gray-400">/ nuit · min</span>
            <input
              type="number" min={1} value={minNightsDraft}
              onChange={(e) => setMinNightsDraft(e.target.value)}
              className="w-14 px-2 py-1 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
            />
            <span className="text-xs text-gray-400">nuits</span>
            <button onClick={savePrice} disabled={loading} className="w-7 h-7 flex items-center justify-center rounded-full bg-green-50 hover:bg-green-100 text-green-600 disabled:opacity-40">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setEditingPrice(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setPriceDraft(String(periods[0].price_per_night));
              setMinNightsDraft(String(periods[0].min_nights));
              setEditingPrice(true);
            }}
            className="group flex items-center gap-2 text-sm"
          >
            <span className="font-semibold text-gray-900"><CurrencyDisplay amountBRL={periods[0].price_per_night} lang="fr" /></span>
            <span className="text-gray-400">/ nuit · min {periods[0].min_nights} nuits</span>
            <Pencil className="w-3.5 h-3.5 text-gray-300 group-hover:text-terracotta-500" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border-b border-red-200 px-5 py-2">{error}</p>
      )}

      {/* Périodes */}
      <div className="px-5 py-3 space-y-2">
        {periods.map((p) => (
          <div key={p.id}>
            {editingPeriodId === p.id ? (
              <PeriodForm
                initial={{ start_month: p.start_month, start_day: p.start_day, end_month: p.end_month, end_day: p.end_day }}
                onSubmit={(data) => editPeriod(p.id, data)}
                onCancel={() => setEditingPeriodId(null)}
                loading={loading}
                error={null}
              />
            ) : (
              <div className="flex items-center justify-between gap-3 py-1">
                <p className="text-sm text-gray-700">
                  {formatMonthDay(p.start_month, p.start_day)} → {formatMonthDay(p.end_month, p.end_day)}
                  <span className="text-gray-400"> · chaque année</span>
                </p>
                <div className="flex items-center gap-1 shrink-0">
                  {deleteConfirm === p.id ? (
                    <>
                      <button onClick={() => deletePeriod(p.id)} disabled={loading} className="w-7 h-7 flex items-center justify-center rounded-full bg-red-50 hover:bg-red-100 text-red-600 disabled:opacity-40" title="Confirmer">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirm(null)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400" title="Annuler">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => setEditingPeriodId(p.id)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600" title="Modifier les dates">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500"
                        title={periods.length === 1 ? "Supprimer cette saison" : "Supprimer cette période"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {addingPeriod ? (
          <PeriodForm
            initial={{ start_month: 1, start_day: 1, end_month: 1, end_day: 31 }}
            onSubmit={addPeriod}
            onCancel={() => setAddingPeriod(false)}
            loading={loading}
            error={null}
          />
        ) : (
          <button
            onClick={() => setAddingPeriod(true)}
            className="text-xs text-terracotta-600 hover:text-terracotta-700 font-medium flex items-center gap-1 pt-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une période pour cette saison
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Formulaire nouvelle saison (type inédit) ──────────────────────────────

interface NewSeasonFormData {
  name: SeasonName;
  price_per_night: number;
  min_nights: number;
  start_month: number;
  start_day: number;
  end_month: number;
  end_day: number;
}

// ─── Composant principal ───────────────────────────────────────────────────

interface SeasonManagerProps {
  seasons: Season[];
}

export default function SeasonManager({ seasons }: SeasonManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [showNewForm, setShowNewForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<SeasonName, Season[]>();
    for (const s of seasons) {
      const list = map.get(s.name) ?? [];
      list.push(s);
      map.set(s.name, list);
    }
    return map;
  }, [seasons]);

  const availableNames = SEASON_ORDER.filter((n) => !grouped.has(n));

  const [newForm, setNewForm] = useState<NewSeasonFormData>({
    name: availableNames[0] ?? "mid",
    price_per_night: 5000,
    min_nights: 3,
    start_month: 1,
    start_day: 1,
    end_month: 1,
    end_day: 31,
  });

  function openNewForm() {
    setNewForm({
      name: availableNames[0] ?? "mid",
      price_per_night: 5000,
      min_nights: 3,
      start_month: 1,
      start_day: 1,
      end_month: 1,
      end_day: 31,
    });
    setError(null);
    setShowNewForm(true);
  }

  function refresh() {
    router.refresh();
  }

  async function handleCreateNew(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/admin/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json() as { error: string };
      setError(data.error);
      return;
    }

    setShowNewForm(false);
    toast("success", "Saison créée");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Avertissement effet immédiat */}
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        Les prix que tu modifies ici sont affichés immédiatement aux visiteurs du site, et se répètent chaque année automatiquement — vérifie bien avant d&apos;enregistrer.
      </p>

      {/* Bouton ajouter un type de saison inédit */}
      {availableNames.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajouter un type de saison
          </button>
        </div>
      )}

      {/* Formulaire nouveau type de saison */}
      {showNewForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800">Nouveau type de saison</h3>
            <button onClick={() => setShowNewForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateNew} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Type</label>
              <select
                value={newForm.name}
                onChange={(e) => setNewForm({ ...newForm, name: e.target.value as SeasonName })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
              >
                {availableNames.map((n) => (
                  <option key={n} value={n}>{SEASON_LABELS[n]}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Début</label>
                <div className="flex gap-2">
                  <select
                    value={newForm.start_month}
                    onChange={(e) => setNewForm({ ...newForm, start_month: Number(e.target.value) })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
                  >
                    {MONTHS_FR.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                  <input
                    type="number" min={1} max={31} value={newForm.start_day}
                    onChange={(e) => setNewForm({ ...newForm, start_day: Number(e.target.value) })}
                    className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Fin</label>
                <div className="flex gap-2">
                  <select
                    value={newForm.end_month}
                    onChange={(e) => setNewForm({ ...newForm, end_month: Number(e.target.value) })}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
                  >
                    {MONTHS_FR.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                  <input
                    type="number" min={1} max={31} value={newForm.end_day}
                    onChange={(e) => setNewForm({ ...newForm, end_day: Number(e.target.value) })}
                    className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Prix / nuit (BRL)</label>
                <input
                  type="number" min={0} step={100} value={newForm.price_per_night}
                  onChange={(e) => setNewForm({ ...newForm, price_per_night: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Nuits minimum</label>
                <input
                  type="number" min={1} value={newForm.min_nights}
                  onChange={(e) => setNewForm({ ...newForm, min_nights: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-400/50"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowNewForm(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="flex-1 py-2 rounded-lg bg-terracotta-500 hover:bg-terracotta-600 text-white text-sm font-medium disabled:opacity-60 transition-colors">
                {loading ? "..." : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste groupée par type de saison */}
      {seasons.length === 0 ? (
        <EmptyState
          icon={Sun}
          title="Aucune saison configurée"
          hint="Ajoute un type de saison pour définir tes tarifs — c'est ce qui détermine le prix affiché aux visiteurs, chaque année."
        />
      ) : (
        <div className="space-y-4">
          {SEASON_ORDER.filter((n) => grouped.has(n)).map((name) => (
            <SeasonGroup key={name} name={name} periods={grouped.get(name)!} onRefresh={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}
