import { getAllSeasons } from "@/lib/supabase/queries";
import SeasonManager from "@/components/admin/SeasonManager";

export const dynamic = "force-dynamic";

export default async function SeasonsPage() {
  const result = await getAllSeasons();
  const seasons = result.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Saisons & Tarifs</h1>
        <p className="text-sm text-gray-500">Configurez les saisons, prix par nuit et séjours minimum</p>
      </div>
      <SeasonManager seasons={seasons} />
    </div>
  );
}
