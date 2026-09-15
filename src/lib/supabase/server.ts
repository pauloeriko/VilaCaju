import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Client Supabase côté serveur — pour les Server Components et Route Handlers
// Utilise les cookies Next.js pour la gestion de session
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options)
            } catch {
              // Attendu depuis un Server Component : `cookies().set()` y est
              // interdit. Le middleware gère déjà le refresh de session.
            }
          })
        },
      },
    },
  )
}

// Client admin avec service role — jamais exposé côté navigateur
// Réservé aux Route Handlers et Server Actions nécessitant un accès sans RLS
//
// Important : n'utilise PAS le client "SSR" lié aux cookies (createServerClient).
// Ce dernier réattache la session de l'utilisateur connecté à chaque requête, ce qui
// écrase les droits service_role par ceux de l'utilisateur admin authentifié et fait
// échouer les écritures avec "new row violates row-level security policy". Le client
// admin doit rester complètement indépendant de la session en cours.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
