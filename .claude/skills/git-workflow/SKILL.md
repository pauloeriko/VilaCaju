---
name: git-workflow
description: >
  Workflow Git, conventions de commits, branching strategy, PRs. Charger
  automatiquement lors de discussions sur commits, branches, pull requests,
  ou workflow de développement.
---

# Git Workflow — Conventions et bonnes pratiques

## Commits — Conventional Commits

**Format :** `type(scope): description`

```
# Types
feat:     Nouvelle fonctionnalité
fix:      Correction de bug
refactor: Refactoring sans changement de comportement
test:     Ajout ou modification de tests
docs:     Documentation uniquement
style:    Formatage, espaces (pas de changement logique)
perf:     Amélioration des performances
chore:    Maintenance, dépendances, config
ci:       Pipeline CI/CD

# Exemples
feat(auth): ajouter connexion OAuth avec Google
fix(orders): corriger calcul total avec remise > 100%
refactor(user-service): extraire validation email dans helper
test(payment): ajouter tests cas limites stripe timeout
perf(orders): ajouter index user_id pour query listing
docs(api): documenter endpoints authentication

# Commit avec corps (changement important)
feat(orders)!: changer format réponse API commandes

BREAKING CHANGE: le champ `total` devient `totalAmount` (Decimal string)
Migration nécessaire côté client.

Closes #234
```

**Règles :**
- Description en français, impératif présent
- Pas de point final
- Max 72 caractères pour la première ligne
- `!` après le type pour un breaking change

---

## Branching Strategy — Git Flow simplifié

```
main ──────────────────────────────────────── production stable
  │
  └── develop ─────────────────────────────── intégration continue
        │
        ├── feature/user-authentication ──── feature en cours
        ├── feature/payment-integration
        ├── fix/order-total-calculation ──── bugfix
        └── hotfix/critical-security-patch ─ fix urgent sur main
```

**Nommage des branches :**
```bash
feature/description-courte      # Nouvelle feature
fix/description-du-bug          # Bugfix
refactor/ce-qui-est-refactorisé
hotfix/problème-critique
chore/mise-a-jour-dependances
```

---

## Workflow quotidien

```bash
# 1. Partir toujours d'une branche à jour
git checkout main
git pull origin main
git checkout -b feature/ma-nouvelle-feature

# 2. Commits atomiques pendant le développement
# Un commit = un changement logique complet
git add src/services/user-service.ts
git add tests/services/user-service.test.ts
git commit -m "feat(user): ajouter validation email lors inscription"

# 3. Synchroniser régulièrement avec main
git fetch origin
git rebase origin/main  # Préférer rebase à merge pour garder historique propre

# 4. Avant de pousser
npm test                    # ou pytest
npm run lint               # ou ruff check .
git push origin feature/ma-nouvelle-feature

# 5. Créer la PR
# Via GitHub CLI :
gh pr create --title "feat(user): ajouter validation email" --body "..."
```

---

## Pull Requests — template

```markdown
## Description
Bref résumé de ce qui change et pourquoi.

## Type de changement
- [ ] Nouvelle feature
- [ ] Bug fix
- [ ] Refactoring
- [ ] Breaking change

## Tests
- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Tests d'intégration ajoutés/mis à jour
- [ ] Tests manuels effectués

## Checklist
- [ ] Code self-reviewé
- [ ] Pas de secrets ou données sensibles exposés
- [ ] Documentation mise à jour si nécessaire
- [ ] Migrations BDD incluses et testées

## Screenshots (si UI)
[Avant / Après]
```

---

## Ce qu'il ne faut jamais faire

```bash
# ❌ Pusher directement sur main/develop
git push origin main

# ❌ Force push sur une branche partagée
git push --force origin develop

# ❌ Commits fourre-tout
git commit -m "fix stuff"
git commit -m "wip"
git commit -m "changes"

# ❌ Committer des fichiers sensibles
git add .env           # Jamais
git add *.key          # Jamais
git add credentials.json  # Jamais

# ✅ Si secrets commités par accident — agir IMMÉDIATEMENT
# 1. Invalider le secret (regénérer la clé API)
# 2. git filter-branch ou BFG Repo Cleaner pour nettoyer l'historique
# 3. Force push + prévenir l'équipe
```

---

## .gitignore — éléments essentiels

```gitignore
# Secrets — OBLIGATOIRE
.env
.env.*
!.env.example
*.key
*.pem
credentials.json
secrets/

# Dépendances
node_modules/
.venv/
__pycache__/
*.pyc
.pytest_cache/

# Build
dist/
build/
.next/
*.egg-info/

# IDE
.vscode/settings.json
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Claude Code worktrees
.claude/worktrees/
```

---

## Git hooks locaux (optionnel mais utile)

```bash
# .git/hooks/pre-commit (ou via husky)
#!/bin/sh

# Bloquer si fichiers .env dans le staging
if git diff --cached --name-only | grep -qE '\.env'; then
  echo "❌ Impossible de committer des fichiers .env"
  exit 1
fi

# Lancer les tests sur les fichiers modifiés
npm run lint --fix
npm test -- --passWithNoTests

echo "✅ Pre-commit checks passed"
```

---

## Checklist Git avant PR

- [ ] Branche à jour avec main (`git rebase origin/main`)
- [ ] Commits atomiques avec messages Conventional Commits
- [ ] Pas de `console.log` / `print` de debug oubliés
- [ ] Pas de fichiers `.env` ou secrets dans les commits
- [ ] Tests passent localement
- [ ] Lint passent localement
- [ ] Code self-reviewé (lire son propre diff)
- [ ] PR description remplie avec contexte
