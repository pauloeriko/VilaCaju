# Audit — Espace Admin Vila Caju

Date de l'audit : 2026-09-14
Mode : audit uniquement, aucune modification de code effectuée.
Branche : `main` (aucun commit local depuis `8954fb4`, tout ce qui suit est **non commité**).

---

## 1. État des lieux général

L'espace admin (`/[lang]/admin`) est fonctionnellement avancé : authentification Supabase, CRUD réservations, calendrier interactif avec blocage/déblocage et conversion blocage→réservation, gestion des saisons/tarifs, page paramètres. Le code est propre, bien commenté aux endroits utiles, sans `TODO`/`FIXME`/données mock, et gère les erreurs explicitement partout (aucun `catch` vide).

Deux lacunes structurantes ressortent :
1. **Pas de réinitialisation de mot de passe self-service** — si le père oublie son mot de passe, il est bloqué sans recours autonome. C'est le point le plus critique vu l'objectif explicite du projet ("qu'il puisse gérer seul, sans mon aide").
2. **RLS des tables `reservations`, `blocked_dates`, `seasons` non vérifiable depuis le repo** — aucune migration n'existe pour leur création/policies (seules `settings` et l'évolution de `seasons` vers un format mois/jour sont versionnées). Le contournement systématique de RLS via le client `service_role` rend cela non bloquant pour le fonctionnement, mais c'est un angle mort à vérifier directement dans le dashboard Supabase.

Rien dans le code de l'admin ne semble non fonctionnel ou expérimental : pas de mock data, pas de `console.log` de debug (un seul `console.error` légitime pour un cas best-effort). Le principal travail restant est UX (confirmations destructrices incohérentes selon les écrans) et sécurité (auth de secours, vérification RLS).

---

## 2. Résumé des fichiers modifiés/ajoutés non commités

### Fichiers admin (nouveaux — détaillés en section 3)
`src/app/[lang]/admin/**`, `src/app/api/admin/**`, `src/components/admin/**`, `src/lib/pricing.ts`, `src/lib/supabase/browser.ts`, `src/lib/supabase/utils.ts`, `src/lib/whatsapp.ts`, `supabase/migrations/**`, `src/hooks/useEscapeKey.ts` : voir section 3 pour le détail rôle par rôle.

### Fichiers modifiés hors admin (refactor du site public, lié)
- **`src/lib/supabase/queries.ts`** (+324/-0 lignes nettes) — passe de simples lectures publiques à un module complet : CRUD réservations/saisons/settings via `createAdminClient`, `isRangeBlocked`, conversion blocage→réservation. Cœur de la logique métier partagée admin + site public.
- **`src/lib/supabase/server.ts`** — ajout de `createAdminClient()` (client `service_role`, bypass RLS) à côté du client SSR existant ; commentaire explicite sur pourquoi il doit rester indépendant de la session cookie.
- **`src/lib/supabase/types.ts`** — types étendus (`SeasonName`, `SeasonInsert/Update`, `SettingsUpdate`, `ReservationInsert` avec `season_snapshot`).
- **`src/middleware.ts`** — ajout de la protection des routes `/[lang]/admin/*` (redirection vers `/login` si non authentifié, et inverse), en plus de la logique i18n existante.
- **`src/lib/pricing/calculator.ts`** et **`src/lib/pricing/availability.ts`** (supprimés) — remplacés par `src/lib/pricing.ts`, unifiant le calcul de prix par saison (source unique utilisée par le site public et l'admin).
- **`src/components/booking/BookingForm.tsx`** (+/-459 lignes), **`src/components/landing/HeroDatePicker.tsx`** (+405 lignes), **`src/components/pricing/PriceCalculator.tsx`**, **`AvailabilityCalendar.tsx`**, **`TarifsCalendarSync.tsx`** — adaptés au nouveau moteur de prix Supabase (`seasons` réelles au lieu de valeurs codées en dur) et à `isRangeBlocked`.
- **`src/lib/currency/CurrencyContext.tsx`**, **`src/components/ui/CurrencyDisplay.tsx`** — le taux EUR/BRL vient désormais de la table `settings` (éditable en admin) au lieu d'être codé en dur.
- **`src/dictionaries/{fr,en,pt}.json`**, **`src/app/[lang]/{layout,page}.tsx`**, **`reserver/page.tsx`**, **`tarifs/page.tsx`**, **`Navbar.tsx`**, **`HeroSection.tsx`**, **`PricingSection.tsx`**, **`PriceCard.tsx`**, **`utils.ts`** — ajustements mineurs de contenu/i18n et de branchement aux nouvelles données.
- **`package.json` / `package-lock.json`** — ajout de la dépendance `zod` (validation des payloads API). *Modification de `package.json` non signalée avant coup selon la règle CLAUDE.md "jamais modifier package.json sans prévenir" — à valider avec l'utilisateur.*
- **`.env.example`** — ajout de `NEXT_PUBLIC_WHATSAPP_OWNER=` (variable non trouvée utilisée dans le code admin actuel — `whatsapp_number` vient de la table `settings`, pas de l'env — à vérifier si résiduel).
- **`.claude/settings.local.json`** — permissions Claude Code locales (curl, tsc, find, pkill) ; hors périmètre fonctionnel.

### Fichiers `.next/**` (build)
~511 fichiers de build supprimés/modifiés — artefacts de compilation, sans intérêt pour la revue, à ne pas committer (déjà couverts par `.gitignore` en théorie — vérifier qu'ils ne sont pas suivis par git).

---

## 3. Routes, pages et composants admin

| Chemin | Rôle |
|---|---|
| `src/middleware.ts` | Protège `/[lang]/admin/*` : redirige vers `/login` si non connecté, vers `/admin` si déjà connecté et sur `/login`. |
| `src/app/[lang]/admin/layout.tsx` | Layout serveur : vérifie la session, charge `settings` (taux EUR), monte sidebar/header/toasts si connecté, sinon rend uniquement `children` (page login). |
| `src/app/[lang]/admin/loading.tsx` | Skeleton de chargement générique. |
| `src/app/[lang]/admin/login/page.tsx` | Formulaire de connexion email/mot de passe via `supabase.auth.signInWithPassword`. Traduit 2 messages d'erreur connus, fallback générique sinon. |
| `src/app/[lang]/admin/page.tsx` | Page « Réservations » : calendrier + liste filtrable/triable. |
| `src/app/[lang]/admin/seasons/page.tsx` | Page « Saisons & Tarifs ». |
| `src/app/[lang]/admin/seasons/loading.tsx`, `settings/loading.tsx` | Skeletons de chargement par route. |
| `src/app/[lang]/admin/settings/page.tsx` | Page « Paramètres » (frais de ménage, taux EUR, n° WhatsApp). |
| `src/app/api/admin/reservations/route.ts` | `POST` — création manuelle d'une réservation (ex: reçue par téléphone), avec vérification anti-chevauchement et conversion optionnelle d'un blocage. |
| `src/app/api/admin/reservations/[id]/route.ts` | `PATCH` (confirmer), `PUT` (éditer), `DELETE` (supprimer définitivement) une réservation. |
| `src/app/api/admin/blocked-dates/route.ts` | `POST` — bloquer manuellement une plage de dates. |
| `src/app/api/admin/blocked-dates/[id]/route.ts` | `DELETE` — débloquer une plage (limité aux blocages `source: "manual"`). |
| `src/app/api/admin/seasons/route.ts` | `GET` (liste), `POST` (créer une période), `PATCH` (tarif groupé par type de saison). |
| `src/app/api/admin/seasons/[id]/route.ts` | `PUT` (éditer une période), `DELETE` (supprimer une période). |
| `src/app/api/admin/settings/route.ts` | `PATCH` — mettre à jour frais de ménage / taux EUR / n° WhatsApp. |
| `src/app/api/admin/logout/route.ts` | `GET` — déconnexion + redirection vers login. |
| `src/app/api/reservations/route.ts` | Endpoint **public** (site vitrine) de création de réservation, avec notification WhatsApp. |
| `src/components/admin/AdminSidebar.tsx` | Navigation latérale (Réservations/Saisons/Paramètres), collapsible, drawer mobile, bouton déconnexion. |
| `src/components/admin/AdminHeader.tsx` | Fil d'Ariane + lien "voir le site". |
| `src/components/admin/AdminCalendar.tsx` | Calendrier multi-mois interactif : sélection de plage pour bloquer, clic sur blocage manuel pour débloquer ou convertir en réservation, popover détail réservation. |
| `src/components/admin/ReservationPageClient.tsx` | Orchestration client de la page réservations (bouton créer, filtres, liste). |
| `src/components/admin/ReservationFilters.tsx` | Recherche texte, filtre par statut, tri. |
| `src/components/admin/ReservationList.tsx` | Liste groupée par statut, actions confirmer/modifier/supprimer avec `ConfirmModal`. |
| `src/components/admin/ReservationFormModal.tsx` | Formulaire création/édition réservation avec calcul de prix automatique (verrouillable). |
| `src/components/admin/SeasonManager.tsx` | CRUD complet des saisons/périodes tarifaires, avec avertissement d'effet immédiat sur le site public. |
| `src/components/admin/AdminSettings.tsx` | Édition inline des paramètres généraux. |
| `src/components/admin/ConfirmModal.tsx` | Modale de confirmation générique (variant `danger`/`default`). |
| `src/components/admin/ToastProvider.tsx` | Système de notifications toast (succès/erreur). |
| `src/components/admin/EmptyState.tsx`, `PageSkeleton.tsx`, `AnimatedCard.tsx` | Composants UI utilitaires. |
| `src/lib/supabase/browser.ts` | Client Supabase navigateur (utilisé par la page login). |
| `src/lib/supabase/utils.ts` | `expandBlockedRanges` — utilitaire de conversion plages → dates individuelles. |
| `src/lib/pricing.ts` | Moteur de calcul de prix par saison (partagé site public + admin). |
| `src/lib/whatsapp.ts` | Construction de l'URL de notification WhatsApp au propriétaire. |
| `src/hooks/useEscapeKey.ts` | Hook fermeture modale via touche Échap. |
| `supabase/migrations/20260703_create_settings.sql` | Création table `settings` + RLS (lecture publique, écriture via service role uniquement). |
| `supabase/migrations/20260710_seasons_month_based.sql` | Migration `seasons` vers un format mois/jour récurrent annuel (⚠️ `truncate table` — destructif, à appliquer consciemment). |

---

## 4. Authentification admin — analyse

**Mécanisme :** Supabase Auth (email/mot de passe), session gérée par cookies via `@supabase/ssr`.

- Le **middleware** (`src/middleware.ts`) intercepte toute requête vers `/[lang]/admin*`, vérifie `supabase.auth.getUser()`, redirige vers `/login` si absent.
- Le **layout admin** refait une vérification serveur (`createClient().auth.getUser()`) avant de monter la sidebar/contenu — défense en profondeur cohérente.
- **Chaque route API `/api/admin/*`** revérifie explicitement `getUser()` côté serveur avant toute lecture/écriture (commentaire "double check côté serveur" dans le code) — bon réflexe puisque le matcher du middleware exclut `/api` (`config.matcher: [... "(?!_next|api|...)"]`). Sans cette double vérification, les routes `/api/admin/*` seraient accessibles sans authentification.
- Les écritures passent par `createAdminClient()` (clé `service_role`), qui **contourne RLS** — la seule barrière de sécurité est donc le `if (!user)` de chaque route, pas les policies Supabase.
- **Déconnexion** : lien simple vers `GET /api/admin/logout`.

**Ce qui manque :**
- **Aucun flux de réinitialisation de mot de passe** (`resetPasswordForEmail` absent du code, confirmé par recherche globale). Aucun lien "mot de passe oublié" sur la page login.
- Aucune gestion de session expirée avec message clair (l'utilisateur est juste redirigé silencieusement vers login).
- Pas de séparation de rôles (un seul niveau "admin" = tout utilisateur Supabase Auth valide a accès total) — acceptable vu qu'un seul utilisateur (le père) est prévu, mais à documenter comme choix assumé.
- Pas de protection anti-brute-force visible au-delà de ce que Supabase Auth fait par défaut.

---

## 5. Recherche TODO / FIXME / console.log / mock data

Résultat : **rien à signaler.**
- Aucun `TODO`, `FIXME`, `mock`, `dummy`, ou donnée placeholder dans `src/app/[lang]/admin`, `src/app/api/admin`, `src/components/admin`.
- Un seul `console.error` (`src/app/api/admin/reservations/route.ts:90`), légitime : log d'un échec best-effort lors de la division d'un blocage converti, sans impacter la réponse HTTP.

---

## 6. Croisement avec Supabase — RLS et écritures admin

- **`settings`** : RLS activé, `select` public autorisé, **aucune policy d'écriture** — les `UPDATE` ne peuvent passer que par le `service_role` client (`createAdminClient`), ce que fait bien `updateSettings()`. Cohérent et documenté dans la migration.
- **`seasons`** : la migration modifie le schéma (colonnes mois/jour) mais **ne définit ni ne montre de policies RLS** dans le repo — probablement configurées ailleurs (dashboard Supabase) lors de la création initiale de la table (non versionnée ici). Le code admin (`createSeason`, `updateSeason`, `deleteSeason`, `updateSeasonsByName`) utilise systématiquement `createAdminClient()`, donc **fonctionnera quelle que soit la policy RLS en place** puisqu'elle est contournée.
- **`reservations`** et **`blocked_dates`** : mêmes constats — toutes les écritures admin (`createReservation`, `updateReservationStatus`, `updateReservationDetails`, `deleteReservation`, insert/delete de `blocked_dates`) passent par `createAdminClient()`. Les lectures publiques (`getBlockedDates`, `isRangeBlocked`) utilisent le client standard, donc **dépendent** de policies RLS `select` correctement configurées sur Supabase (non vérifiables depuis ce repo).

**Conclusion :** les écritures nécessaires depuis l'admin (create/update/delete sur les 3 tables) **fonctionnent indépendamment de l'état des policies RLS**, car elles utilisent la clé `service_role`. Le risque n'est donc pas "l'admin ne peut pas écrire", mais l'inverse : **si RLS est mal configuré (ex: policy `select`/`insert` publique trop permissive sur `reservations`), les emails/téléphones clients ou les prix pourraient être exposés ou falsifiables depuis le site public**, sans que rien dans ce repo ne permette de le vérifier. **Recommandation : vérifier manuellement dans le dashboard Supabase que RLS est activé sur `reservations`, `blocked_dates`, `seasons`, avec des policies restrictives (lecture publique limitée aux champs nécessaires pour `blocked_dates`/`seasons`, aucun accès public à `reservations`).**

---

## Fait

- ✅ Authentification Supabase (email/mot de passe) avec double vérification middleware + route handlers.
- ✅ Liste des réservations (calendrier + liste filtrable/triable, groupée par statut).
- ✅ Bloquer/débloquer des dates manuellement (calendrier interactif, `ConfirmModal`).
- ✅ Attribuer des dates bloquées à une réservation précise (flux "convertir un blocage en réservation", avec split du reliquat — fonctionnalité assez sophistiquée).
- ✅ Modifier les saisons/tarifs (CRUD complet par période + mise à jour groupée par type de saison).
- ✅ Toasts de succès/erreur cohérents sur toutes les actions.
- ✅ Validation serveur systématique (Zod) sur tous les endpoints admin.
- ✅ Anti-chevauchement de dates vérifié côté serveur avant toute création/édition de réservation.

## Partiel

- ⚠️ **Confirmations avant action destructrice** : présentes mais incohérentes selon l'écran.
  - Suppression réservation / déblocage de dates → `ConfirmModal` complet avec description explicite et variant `danger`. Bon niveau.
  - Suppression d'une période de saison → confirmation inline (icône poubelle → icônes check/croix), sans texte d'avertissement sur la conséquence (le tarif disparaît immédiatement du site public). Fonctionnel mais moins clair pour un non-technicien qu'une vraie modale.
- ⚠️ **Messages d'erreur compréhensibles** : bons messages métier en français pour les cas prévus (dates invalides, chevauchement, non autorisé), mais certains chemins renvoient directement `error.message` de Postgres/Supabase brut au client (ex: `getSettings`, plusieurs fonctions de `queries.ts` retournent `error.message` tel quel, remonté jusqu'au toast) — un message Postgres peut être incompréhensible pour le père en cas d'erreur inattendue.
- ⚠️ **UX/UI** : globalement propre et soigné (design cohérent, responsive avec drawer mobile, skeletons de chargement), mais quelques incohérences de pattern de confirmation (voir ci-dessus) et pas de retour visuel en cas de perte de connexion réseau pendant une action.

## Manquant

- ❌ **Récupération de mot de passe self-service** — point le plus important du brief : aucun `resetPasswordForEmail`, aucun lien "mot de passe oublié" sur `/admin/login`. Si le père oublie son mot de passe, il n'a aucun moyen de se reconnecter seul.
- ❌ **Vérification/documentation des policies RLS** pour `reservations`, `blocked_dates`, `seasons` — non versionnées dans le repo, donc non auditable statiquement.
- ❌ Pas de page ou lien "aide" / contact support dans l'admin pour un utilisateur bloqué.

---

## Risques

### Sécurité
1. **P0 — Pas de reset de mot de passe** → risque de blocage total et permanent de l'accès admin sans intervention technique (toi). C'est un risque opérationnel autant que sécurité.
2. **P1 — RLS non vérifiable** sur `reservations`/`blocked_dates`/`seasons` → si mal configuré côté Supabase, des données clients (email, téléphone) pourraient être lisibles publiquement, ou falsifiables via l'API publique. Le repo ne prouve pas que c'est bien configuré.
3. **P2 — Erreurs Postgres brutes remontées au client** dans certains chemins (`error.message` direct) → fuite mineure d'information technique (nom de colonne, contrainte SQL) en cas d'erreur inattendue, sans être exploitable directement mais pas idéal.
4. **P2 — `package.json` modifié** (ajout `zod`) sans validation préalable de l'utilisateur, contrairement à la règle CLAUDE.md "jamais modifier package.json sans prévenir" — à confirmer que c'était voulu.

### UX
1. **P1 — Incohérence des confirmations destructrices** entre réservations (modale claire) et saisons (confirmation inline discrète) → risque qu'un non-technicien supprime une période tarifaire par erreur sans bien mesurer l'impact.
2. **P2 — Fichiers dépassant la limite de 300 lignes** fixée par CLAUDE.md : `SeasonManager.tsx` (553), `AdminCalendar.tsx` (474), `BookingForm.tsx` (491), `HeroDatePicker.tsx` (426), `queries.ts` (407), `ReservationFormModal.tsx` (359), `ReservationList.tsx` (301). Pas un risque fonctionnel, mais un écart aux règles du projet qui nuira à la maintenabilité à long terme.
3. **P2 — `NEXT_PUBLIC_WHATSAPP_OWNER`** ajouté à `.env.example` mais semble ne plus être utilisé (le numéro WhatsApp vient désormais de la table `settings`) — à nettoyer ou clarifier si c'est un fallback voulu.

---

## Recommandations priorisées

### P0 — à faire avant que le père utilise l'admin en autonomie
1. Ajouter un flux "Mot de passe oublié" sur `/admin/login` (`supabase.auth.resetPasswordForEmail` + page de définition du nouveau mot de passe). C'est le point bloquant n°1 pour l'objectif du projet.
2. Vérifier manuellement dans le dashboard Supabase que RLS est activé et correctement restrictif sur `reservations`, `blocked_dates`, `seasons` (lecture publique minimale, aucune écriture publique).

### P1 — à faire rapidement après
3. Harmoniser les confirmations destructrices : utiliser `ConfirmModal` (avec description explicite de l'impact) pour la suppression de période de saison, comme pour les réservations.
4. Remplacer les remontées directes de `error.message` Postgres par des messages métier traduits (comme déjà fait pour les cas de chevauchement/dates invalides), avec fallback générique pour les erreurs inattendues.
5. Clarifier/documenter le choix "un seul rôle admin" (pas de séparation de droits) — acceptable ici mais à confirmer explicitement.

### P2 — amélioration continue
6. Refactorer les fichiers dépassant 300 lignes (`SeasonManager.tsx`, `AdminCalendar.tsx`, `queries.ts`, etc.) en sous-modules, conformément aux règles CLAUDE.md.
7. Nettoyer `NEXT_PUBLIC_WHATSAPP_OWNER` dans `.env.example` si non utilisé.
8. Confirmer avec l'utilisateur l'ajout de `zod` dans `package.json` (règle "jamais sans prévenir").
9. Vérifier que les artefacts `.next/**` modifiés/supprimés ne sont pas suivis par git (ajouter au `.gitignore` si ce n'est pas déjà le cas), pour éviter de polluer les futurs commits.
