import { getSettings } from "@/lib/supabase/queries";
import AdminSettings from "@/components/admin/AdminSettings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const result = await getSettings();

  if (!result.data) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-8">
        <p className="text-sm text-red-600">
          Impossible de charger les paramètres. Vérifie que la table `settings` existe dans Supabase.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Paramètres</h1>
        <p className="text-sm text-gray-500">Configuration générale de la villa</p>
      </div>
      <AdminSettings settings={result.data} />
    </div>
  );
}
