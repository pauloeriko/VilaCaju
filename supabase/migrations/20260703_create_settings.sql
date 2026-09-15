-- Table de paramètres généraux de la villa (une seule ligne, singleton)
-- Remplace les valeurs codées en dur (frais de ménage, taux EUR/BRL, n° WhatsApp)
-- pour les rendre éditables depuis l'admin.

create table if not exists public.settings (
  id integer primary key default 1,
  cleaning_fee numeric not null default 800,
  eur_rate numeric not null default 5.8,
  whatsapp_number text not null default '',
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

insert into public.settings (id, cleaning_fee, eur_rate, whatsapp_number)
values (1, 800, 5.8, '33759568241')
on conflict (id) do nothing;

alter table public.settings enable row level security;

-- Lecture publique (nécessaire : le site public affiche le prix du ménage et le taux EUR)
create policy "settings_public_read" on public.settings
  for select using (true);

-- Aucune policy d'écriture : les mises à jour passent uniquement par le client
-- service role (createAdminClient) depuis les routes admin, qui contourne RLS.
