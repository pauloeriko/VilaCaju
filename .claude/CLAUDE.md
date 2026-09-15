# Vila Caju — Instructions permanentes pour Claude

## IDENTITÉ DU PROJET

**Projet :** Vila Caju — Site vitrine et réservation pour location immobilière de luxe à Pontal de Maceió, Brésil  
**Type :** Website + API  
**Stack (vérifiée dans le repo au 2026-09-15) :**
- Frontend : Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- Backend : pas de service séparé — la logique serveur (réservations, saisons, blocages, paramètres) vit entièrement dans les Route Handlers Next.js (`src/app/api/**`), avec `@supabase/supabase-js` (client `service_role`) pour les opérations admin qui doivent contourner RLS
- Validation des payloads API : Zod
- BDD : Supabase (PostgreSQL), migrations SQL versionnées dans `supabase/migrations/`
- Auth : Supabase Auth (email/mot de passe), protection des routes `/[lang]/admin/*` via `src/middleware.ts`
- Déploiement : non vérifiable depuis le repo (pas de `vercel.json`, pas de dossier `.vercel/`) — présumé Vercel vu la stack Next.js, à confirmer avec l'utilisateur

**Écart avec une version antérieure de ce document :** un backend FastAPI (Python) et un déploiement Railway/Render étaient mentionnés ici, mais aucun code Python, `requirements.txt` ni dossier `api/` FastAPI n'existe dans le repo — c'est un choix d'architecture abandonné ou jamais concrétisé, pas un oubli à corriger dans le code. Les Route Handlers Next.js couvrent aujourd'hui le même besoin. Ne pas réintroduire FastAPI par réflexe ; un service backend séparé ne redeviendrait pertinent que pour un besoin qui ne rentre pas dans le modèle request/response de Next.js (ex : job asynchrone long, worker de queue, cron indépendant du frontend, traitement lourd) — à évaluer explicitement le cas échéant, pas à supposer.

**Contexte métier :**
- Villa jusqu'à 17 personnes, location saisonnière haut de gamme
- 3 saisons tarifaires : Basse, Haute, Très Haute
- Site trilingue : Français, Anglais, Portugais
- Cible : clientèle CSP+ internationale et locale

---

## WORKFLOW OBLIGATOIRE — SANS EXCEPTION

**Avant toute modification de code existant :**
1. Lire les fichiers concernés
2. Expliquer ce qui va changer ET pourquoi en 2-3 lignes
3. Attendre une validation explicite avant d'écrire

**Pour toute nouvelle feature :**
1. Proposer le plan (fichiers à créer/modifier, dépendances)
2. Attendre validation
3. Écrire les tests d'abord (TDD)
4. Implémenter le minimum pour faire passer les tests
5. Commit atomique avec message clair

**Si incertain sur quoi que ce soit → demander, ne jamais deviner.**

---

## RÈGLES ABSOLUES — NON NÉGOCIABLES

- Jamais modifier `.env`, `.env.*`, fichiers de credentials
- Jamais modifier `package.json` ou `requirements.txt` sans prévenir
- Jamais de `git push --force` ni `DROP TABLE` sans confirmation explicite
- Jamais de `any` en TypeScript, jamais de `# type: ignore` en Python sans justification
- Fonctions < 25 lignes. Classes < 200 lignes. Fichiers < 300 lignes.
- 1 responsabilité par fonction, 1 responsabilité par classe (SOLID-S)
- Toujours gérer les erreurs explicitement — jamais de `except: pass` ni `.catch(() => {})`
- Noms de variables/fonctions en anglais, commentaires en français si nécessaire

*Note : les mentions Python (`requirements.txt`, `# type: ignore`, `except: pass`) restent dans ces règles au cas où un backend Python serait introduit plus tard (voir section Stack) ; elles sont dormantes tant qu'aucun fichier `.py` n'existe dans le repo.*

---

## COMMANDES DU PROJET
```bash
# Développement
npm run dev                              # Next.js sur localhost:3000 (pas de backend séparé à lancer)

# Tests
# Aucun framework de test n'est configuré actuellement (pas de Jest ni équivalent,
# aucun fichier *.test.*/*.spec.*, pas de dossier tests/). Gap connu, prévu en fin
# de roadmap admin (phase QA) — /testing-strategy doit proposer une mise en place,
# pas supposer qu'un test runner existe déjà.

# Lint / Format
npm run lint                             # next lint — ESLint est une dépendance installée
                                          # mais AUCUNE config (.eslintrc/eslint.config.*)
                                          # n'existe encore : la 1ère exécution demande un
                                          # choix interactif (Strict/Base). À finaliser.

# Build
npm run build                            # Next.js production
```

Pas de Python dans ce projet : `pytest`, `ruff`, `black` ne s'appliquent pas.

---

## ARCHITECTURE — FICHIERS CRITIQUES (structure réelle du repo)
```
src/
  app/
    [lang]/           → Pages App Router par langue (site public + /admin/*)
    api/              → Route Handlers Next.js = la couche "backend" du projet
                        (admin/reservations, admin/seasons, admin/blocked-dates,
                        admin/settings, reservations publiques...)
  components/
    ui/               → Composants génériques (Button, CurrencyDisplay...)
    admin/            → Composants de l'espace admin (calendrier, listes, modales)
    booking/, landing/, pricing/, villa/, faq/, reviews/, layout/
                      → Composants métier, découpés par domaine plutôt que sous un
                        dossier "features/" unique (différence avec la structure
                        initialement décrite ici)
  lib/                → Utilitaires partagés : supabase/ (clients + queries.ts),
                        pricing.ts, currency/, i18n/ (logique de routing des langues),
                        whatsapp.ts, utils.ts
  types/              → Types TypeScript globaux (index.ts)
  dictionaries/       → Fichiers de traduction fr.json / en.json / pt.json
                        (le dossier i18n/ existant contient la logique, pas les
                        fichiers de traduction eux-mêmes)
  hooks/              → Hooks React custom (useEscapeKey, useScrollDirection...)
  data/               → Contenu statique versionné (villa, destination, faq, reviews...)
  middleware.ts       → Protection des routes /[lang]/admin/* + routing i18n

supabase/
  migrations/         → Migrations SQL versionnées (settings, seasons...)

tests/                → N'existe pas encore dans ce repo (voir section Commandes) —
                        conservé ici comme structure cible, pas comme état actuel.
```

Le bloc `api/ → FastAPI (models/services/routes)` décrit dans une version antérieure de ce document ne correspond à aucun dossier réel : voir la note dans la section Stack ci-dessus.

---

## SKILLS DISPONIBLES

| Commande | Quand Claude la charge |
|---|---|
| `/solid-principles` | Conception de classes, architecture, refactoring |
| `/clean-code` | Écriture ou review de toute fonction/module |
| `/python-conventions` | Tout code Python / FastAPI (aucun actuellement dans ce repo — voir section Stack) |
| `/js-ts-conventions` | Tout code JavaScript / TypeScript / React |
| `/api-design` | Création ou modification d'endpoints API |
| `/security` | Auth, données utilisateur, inputs, secrets |
| `/testing-strategy` | Écriture ou review de tests |
| `/error-handling` | Gestion d'erreurs, exceptions, Result types |
| `/performance` | Optimisation, queries, rendering |
| `/database-design` | Schéma Supabase, migrations, requêtes |
| `/git-workflow` | Commits, branches, PRs |
| `/code-review` | Review de code, checklist qualité |

---

*Dernière mise à jour : 2026-09-15 — stack revérifiée contre l'état réel du repo*