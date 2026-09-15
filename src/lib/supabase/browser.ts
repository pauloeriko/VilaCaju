import { createBrowserClient } from "@supabase/ssr";

// Client Supabase côté navigateur — uniquement pour les Client Components
// Gère automatiquement les cookies de session via le navigateur
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
