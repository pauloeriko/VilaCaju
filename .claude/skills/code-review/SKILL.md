---
name: code-review
description: >
  Checklist complète de review de code. Charger automatiquement lors d'une
  demande de review de code, analyse de qualité, audit de PR, ou quand on
  demande "est-ce que ce code est bon ?".
---

# Code Review — Checklist complète

## Protocole de review

Lors d'une review de code, analyser dans cet ordre :

1. **Sécurité** (bloquant — corriger avant tout)
2. **Exactitude** (bloquant — le code fait-il ce qu'il est censé faire ?)
3. **Maintenabilité** (important)
4. **Performance** (important si applicable)
5. **Style** (cosmétique — signaler mais pas bloquant)

---

## 🔴 Sécurité — BLOQUANT

```
□ Inputs utilisateur validés et sanitisés avant utilisation
□ Pas d'interpolation directe dans les requêtes SQL
□ Pas de secrets / clés API / passwords dans le code
□ Vérification d'autorisation sur les ressources (anti-IDOR)
□ Authentification vérifiée avant accès aux données protégées
□ Pas d'informations sensibles dans les logs
□ Pas de stack traces exposés en production
□ Dépendances avec vulnérabilités connues (npm audit / safety check)
```

---

## 🔴 Exactitude — BLOQUANT

```
□ La logique métier correspond aux spécifications
□ Cas limites gérés (liste vide, null/undefined, valeurs à 0)
□ Erreurs gérées explicitement (pas de silent failures)
□ Conditions de course gérées si code async concurrent
□ Transactions BDD sur les opérations multi-étapes
□ Tests couvrent les happy paths ET les cas d'erreur
```

---

## 🟡 Maintenabilité — IMPORTANT

### SOLID
```
□ S — Chaque classe/fonction a une responsabilité unique
□ O — Nouveau comportement par extension, pas modification
□ L — Sous-classes respectent le contrat des parents
□ I — Interfaces petites et ciblées
□ D — Dépendances injectées, pas instanciées en dur
```

### Clean Code
```
□ Noms révèlent l'intention (pas d'abréviations mystérieuses)
□ Fonctions < 25 lignes avec une seule responsabilité
□ Pas de duplication logique (DRY)
□ Commentaires expliquent le "pourquoi", pas le "quoi"
□ Pas de code commenté (utiliser git)
□ Niveaux d'indentation ≤ 3
□ Max 3-4 paramètres par fonction
```

### Architecture
```
□ Séparation des couches respectée (UI / Service / Repository)
□ Pas de logique métier dans les controllers/handlers
□ Pas d'accès direct à la BDD depuis les composants UI
□ Dépendances vers les abstractions, pas les implémentations
```

---

## 🟡 Performance — IMPORTANT (si applicable)

```
□ Pas de N+1 queries (vérifier eager loading)
□ Index BDD sur les colonnes filtrées/triées
□ Pagination sur les listes (pas de SELECT * sans LIMIT)
□ Opérations async indépendantes parallélisées (Promise.all / asyncio.gather)
□ Pas de calcul coûteux dans des boucles (extraire à l'extérieur)
□ Cache utilisé pour les données stables répétées
```

---

## 🟢 Style — COSMÉTIQUE

```
□ Lint et formatage passent (Prettier/ESLint, ruff/black)
□ Conventions de nommage respectées (snake_case Python, camelCase TS)
□ Imports organisés
□ Pas de console.log / print de debug
□ Typage TypeScript strict (pas de any)
□ Annotations de types Python sur les fonctions publiques
```

---

## Format de sortie pour une review

```markdown
## Review de code — [Nom du fichier/PR]

### 🔴 Bloquants (à corriger avant merge)

**[Ligne X] — Sécurité : SQL Injection potentielle**
```python
# Code actuel
query = f"SELECT * FROM users WHERE email = '{email}'"

# ✅ Corriger avec paramètre
query = "SELECT * FROM users WHERE email = :email"
session.execute(query, {"email": email})
```

**[Ligne Y] — Logique : Cas null non géré**
La fonction retourne `None` si l'utilisateur n'existe pas mais le code l'utilise sans vérification.

---

### 🟡 Améliorations suggérées

**[Ligne Z] — Violation SRP**
`UserService.create_user()` gère la validation, la création et l'envoi d'email.
Suggère d'extraire `EmailService.send_welcome()`.

---

### 🟢 Points positifs
- Bonne gestion des erreurs avec exceptions typées
- Tests bien structurés avec fixtures réutilisables

---

### Verdict : CHANGES REQUESTED / APPROVED
Score : [X/10]
```

---

## Questions à se poser en review

```
1. "Si je devais modifier ce code dans 6 mois sans contexte, est-ce que je comprendrais ?"
2. "Qu'est-ce qui se passe si cet input est null / vide / négatif ?"
3. "Qu'est-ce qui se passe si ce service externe est indisponible ?"
4. "Est-ce que ce code crée de la dette technique que quelqu'un devra payer ?"
5. "Est-ce que je validerais ce code si je ne connaissais pas l'auteur ?"
```
