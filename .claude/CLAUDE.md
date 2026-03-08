# Vila Caju — Instructions permanentes pour Claude

## IDENTITÉ DU PROJET

**Projet :** Vila Caju — Site vitrine et réservation pour location immobilière de luxe à Pontal de Maceió, Brésil  
**Type :** Website + API  
**Stack :**
- Frontend : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Backend : FastAPI (Python) — API de réservation et gestion
- BDD : Supabase (PostgreSQL)
- Déploiement : Vercel (frontend) + Railway ou Render (FastAPI)

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

---

## COMMANDES DU PROJET
```bash
# Développement
npm run dev                              # Next.js sur localhost:3000
uvicorn main:app --reload                # FastAPI sur localhost:8000

# Tests
npm test                                 # Jest
pytest                                   # Python

# Lint / Format
npm run lint                             # ESLint
ruff check . && black .                  # Python

# Build
npm run build                            # Next.js production
```

---

## ARCHITECTURE — FICHIERS CRITIQUES
```
src/
  app/                → App Router Next.js (routes, layouts)
  components/
    ui/               → Composants génériques (Button, Input...)
    features/         → Composants métier (BookingWidget, Calendar...)
  lib/                → Utilitaires partagés, clients Supabase
  types/              → Types TypeScript globaux
  i18n/               → Fichiers de traduction (fr, en, pt)

api/                  → FastAPI
  models/             → Modèles SQLAlchemy / Pydantic
  services/           → Logique métier réservations
  routes/             → Endpoints API

tests/                → Tests unitaires et intégration
```

---

## SKILLS DISPONIBLES

| Commande | Quand Claude la charge |
|---|---|
| `/solid-principles` | Conception de classes, architecture, refactoring |
| `/clean-code` | Écriture ou review de toute fonction/module |
| `/python-conventions` | Tout code Python / FastAPI |
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

*Dernière mise à jour : Février 2026*