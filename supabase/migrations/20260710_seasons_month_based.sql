-- Simplifie les saisons : elles se répètent chaque année (mois/jour uniquement),
-- au lieu d'être ressaisies chaque année avec des dates complètes.
-- ATTENTION : cette migration remplace le contenu de la table `seasons`.
-- Les saisons existantes sont supprimées — il faudra les recréer une fois via l'admin
-- (elles s'appliqueront ensuite indéfiniment, chaque année, sans ressaisie).

truncate table public.seasons;

alter table public.seasons
  drop column if exists year,
  drop column if exists date_start,
  drop column if exists date_end;

alter table public.seasons
  add column if not exists start_month integer not null default 1,
  add column if not exists start_day   integer not null default 1,
  add column if not exists end_month   integer not null default 1,
  add column if not exists end_day     integer not null default 1;

alter table public.seasons
  add constraint seasons_start_month_range check (start_month between 1 and 12),
  add constraint seasons_end_month_range   check (end_month between 1 and 12),
  add constraint seasons_start_day_range   check (start_day between 1 and 31),
  add constraint seasons_end_day_range     check (end_day between 1 and 31);
