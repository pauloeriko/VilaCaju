# Feuille de route — finalisation admin Vila Caju

Consolide `ADMIN_AUDIT.md` (14/09) + les points identifiés en testant l'admin en vrai. Un item = une session Claude Code = un commit. Ne pas paralléliser plusieurs items dans une même session.

Coche au fur et à mesure : `- [ ]` → `- [x]`.

---

## P0 — bloquant avant que ton père utilise l'admin seul

### 1. Nettoyer la donnée de test
- [ ] Supprimer la réservation "tes" (pending, 09→17 déc 2026) visible dans la liste.
Pas besoin de Claude Code — fais-le directement dans l'admin (icône poubelle). Vérifie aussi qu'il n'y a pas d'autres entrées de test qui traînent (blocages, saisons) avant de considérer les données propres pour la remise.

### 2. Diagnostiquer le risque de chevauchement de saisons
Repéré sur capture : "Basse" (1 Jui→30 Jui) et "Moyenne" (1 Jui→31 Aoû) semblent se chevaucher — à vérifier une fois le point 3 (ambiguïté Juin/Juillet) éclairci. Si c'est un vrai chevauchement, le site public affiche potentiellement un tarif faux **dès maintenant**, indépendamment de l'admin. Prioritaire.

```
Vérifie si les périodes de saisons dans la table `seasons` peuvent se
chevaucher, en lecture seule, sans rien modifier :

1. Liste toutes les périodes actuellement en base avec leurs dates de
   début/fin et le type de saison associé.
2. Calcule s'il existe un chevauchement entre deux périodes
   quelconques (même partiel, même de saisons différentes).
3. Si oui, montre-moi précisément lesquelles se chevauchent et sur
   quelle plage de dates.
4. Cherche dans le code (API route POST/PUT de seasons) s'il existe
   une validation anti-chevauchement à la création/édition d'une
   période. S'il n'y en a aucune, dis-le clairement.
5. Explique, en lisant src/lib/pricing.ts, ce qui se passe
   concrètement si une date tombe dans une zone de chevauchement :
   quel prix est retenu, et pourquoi (ordre de requête, priorité
   codée en dur, ou autre).

Ne corrige rien, donne-moi juste le diagnostic complet.
```
→ Selon le résultat : si chevauchement réel confirmé, décider ensemble s'il faut juste corriger les dates existantes (pas de code) ou aussi ajouter une validation serveur anti-chevauchement (code, prompt à écrire une fois le diagnostic connu).

### 3. Réinitialisation de mot de passe self-service
Le point le plus important de tout l'audit — sans ça, ton père est bloqué en permanence s'il oublie son mot de passe.

```
Ajoute un flux de réinitialisation de mot de passe self-service sur
/admin/login, pour que mon père puisse se reconnecter seul s'il
oublie son mot de passe.

1. Sur la page de login, ajoute un lien "Mot de passe oublié ?" qui
   mène à un petit formulaire (email uniquement) appelant
   supabase.auth.resetPasswordForEmail(email, { redirectTo: <URL de
   la page de définition du nouveau mot de passe> }).
2. Crée la page de destination (ex: /admin/reset-password) qui reçoit
   le lien envoyé par email, permet de saisir un nouveau mot de passe
   (avec confirmation), et appelle
   supabase.auth.updateUser({ password }).
3. Messages d'erreur/succès traduits en français, cohérents avec le
   style déjà utilisé sur la page de login actuelle.
4. Vérifie que ces nouvelles routes ne sont PAS protégées par le
   middleware admin (un utilisateur non connecté doit pouvoir y
   accéder).
5. Dis-moi si un template d'email Supabase par défaut est utilisé, ou
   s'il faut que j'aille le configurer/traduire côté dashboard
   Supabase.

Montre-moi le plan de fichiers créés/modifiés avant d'écrire le code.
```

### 4. Vérifier RLS sur Supabase (manuel, pas de code)
- [ ] Dashboard Supabase → `reservations`, `blocked_dates`, `seasons` : RLS activé, policy `select` publique limitée au strict nécessaire (pas d'accès public à `reservations` du tout), aucune policy d'écriture publique.

---

## P1 — important, à faire après le P0

### 5. Saisie des prix en EUR (conversion, stockage reste BRL)
```
Sur la page Saisons & Tarifs (SeasonManager.tsx et le formulaire
d'édition associé) : le champ de prix (création et édition d'une
saison) affiche et accepte toujours le montant en BRL, quel que soit
l'état du toggle BRL/EUR en haut de la page.

Comportement attendu :
- Le prix stocké en base (colonne price sur `seasons`) reste en BRL —
  c'est la devise canonique, ne change pas ça.
- Le champ du formulaire doit afficher et accepter la saisie dans la
  devise actuellement sélectionnée par le toggle, via le taux déjà
  disponible dans CurrencyContext (eurRate depuis `settings`).
- Saisie en EUR → convertis vers BRL avant l'enregistrement en base
  (arrondi à l'entier le plus proche).
- Le label à côté du champ (actuellement "/ nuit") doit indiquer la
  devise active.
- Vérifie si la liste des saisons déjà créées (affichage read-only)
  reflète bien le toggle aussi ; sinon corrige-la de la même façon.

Ne touche pas à src/lib/pricing.ts ni aux valeurs déjà stockées.
```

### 6. Harmoniser les confirmations destructrices
```
Harmonise les confirmations avant action destructrice dans l'admin :
la suppression d'une réservation et le déblocage de dates utilisent
déjà ConfirmModal (variant danger, description explicite). La
suppression d'une période de saison (dans SeasonManager.tsx) utilise
à la place une confirmation inline discrète, sans texte
d'avertissement.

Remplace cette confirmation inline par ConfirmModal, avec un message
explicite du type : "Cette période sera supprimée du site public
immédiatement. Les visiteurs ne verront plus ce tarif pour ces
dates." Variant danger, comme pour les réservations.

Ne touche pas aux autres flux de confirmation, déjà corrects.
```

### 7. Messages d'erreur compréhensibles (pas de Postgres brut)
```
Plusieurs fonctions dans src/lib/supabase/queries.ts (dont
getSettings, et d'autres à identifier par une recherche de
`error.message` retourné tel quel) remontent le message d'erreur
Postgres/Supabase brut jusqu'au toast affiché à l'utilisateur admin.

1. Liste tous les endroits où error.message est directement remonté
   au client sans traduction.
2. Pour chacun, remplace par un message français générique et
   compréhensible, sur le modèle déjà utilisé pour les cas de
   chevauchement/dates invalides.
3. Garde le message technique original dans un console.error côté
   serveur, mais jamais exposé au client.

Montre-moi la liste des endroits touchés avant de committer.
```

### 8. Corriger l'ambiguïté "Jui" (Juin/Juillet)
```
Dans l'affichage des périodes de saisons, les mois sont abrégés à 3
lettres de façon ambiguë en français : "Jui" peut désigner Juin ou
Juillet, impossible à distinguer visuellement.

Trouve où cette abréviation est générée et remplace par un mapping
explicite non ambigu pour le français : Janv, Févr, Mars, Avr, Mai,
Juin, Juil, Août, Sept, Oct, Nov, Déc (ou les noms complets si la
place le permet — montre-moi les deux options si besoin).

Vérifie aussi les versions EN et PT si ce composant sert aux 3
langues.
```

### 9. Créer une réservation depuis des dates libres
```
Sur le calendrier admin, quand on sélectionne une plage de dates
LIBRES, la seule action proposée est "Bloquer ces dates".

Ajoute une deuxième option dans cette même modale : "Créer une
réservation", qui ouvre ReservationFormModal (le même composant que
le bouton "Ajouter une réservation" existant), pré-rempli avec les
dates de la sélection en cours. Réutilise strictement la logique déjà
en place dans ReservationFormModal — n'en duplique aucune partie.

Ne touche pas au comportement actuel de blocage.
```

### 10. Sous-plage précise à l'intérieur d'un blocage existant
```
Aujourd'hui, cliquer sur une date bloquée ouvre une modale à deux
choix appliqués à TOUTE la plage bloquée d'un coup : "Débloquer"
(tout) ou "convertir en réservation" (toute la plage).

Nouveau comportement : permettre de sélectionner une SOUS-PLAGE
précise à l'intérieur d'une plage bloquée, puis choisir entre :
1. Débloquer uniquement la sous-plage sélectionnée — le reste de la
   plage bloquée à l'origine doit rester bloqué avant et après.
2. Créer une réservation sur la sous-plage sélectionnée (via
   ReservationFormModal) — même règle : le reste reste bloqué avant
   et après. Réutilise et adapte la logique de split déjà existante
   pour la conversion blocage→réservation complète plutôt que d'en
   écrire une nouvelle.

Contrainte stricte, confirmée : une sélection ne doit JAMAIS mélanger
des dates de statuts différents (libre + bloqué + réservé). Si la
sélection est mixte, affiche une erreur claire au lieu d'un
comportement partiel : "Sélection invalide : mélange de dates avec
des statuts différents." Applique cette même règle de non-mélange au
point 9 ci-dessus si ce n'est pas déjà fait.

Pour le déblocage partiel : s'il n'existe pas encore d'endpoint pour
un déblocage de sous-plage, ajoute la logique de split côté API, sur
le même principe que le split existant pour la conversion en
réservation, mais qui recrée des blocked_dates pour les segments
restants au lieu de créer une réservation.

Montre-moi d'abord un plan (fichiers touchés + logique de split)
avant d'écrire le code.
```
→ À faire en dernier des items P1 : le plus gros morceau, et il s'appuie sur la logique de split déjà en place — autant avoir tout le reste réglé et committé avant.

### 11. Décision à prendre : statut "déclinée" vs suppression définitive
Pas de prompt pour l'instant — à trancher d'abord : si ton père reçoit une demande qu'il ne veut pas honorer, veux-tu qu'il puisse la marquer "déclinée" (gardée en base, hors calendrier actif, email/téléphone du client conservés) plutôt que la supprimer définitivement (aucune trace) ? Une fois décidé, on écrit le prompt correspondant.

### 12. Documenter le choix "un seul rôle admin"
Pas de code — juste noter quelque part (README ou commentaire) que c'est un choix assumé, pas un oubli, tant qu'un seul utilisateur (ton père) est prévu.

---

## P2 — amélioration continue, pas bloquant

### 13. Refactorer les fichiers > 300 lignes
```
Plusieurs fichiers de l'admin dépassent la limite de 300 lignes fixée
par CLAUDE.md : SeasonManager.tsx (553), AdminCalendar.tsx (474),
BookingForm.tsx (491), HeroDatePicker.tsx (426), queries.ts (407),
ReservationFormModal.tsx (359), ReservationList.tsx (301).

Pour CHAQUE fichier, propose un découpage en sous-modules cohérent
(par responsabilité), SANS RIEN CODER — juste un plan par fichier. Je
validerai avant que tu ne refactorises quoi que ce soit.
```

### 14. Nettoyer `NEXT_PUBLIC_WHATSAPP_OWNER`
```
NEXT_PUBLIC_WHATSAPP_OWNER a été ajouté à .env.example mais ne semble
plus utilisé (le numéro WhatsApp vient désormais de la table
settings). Vérifie par une recherche globale s'il est utilisé
n'importe où dans le code. S'il ne l'est nulle part, supprime la
ligne de .env.example. Si tu le trouves utilisé quelque part,
dis-le-moi au lieu de le supprimer.
```

### 15. Confirmer l'ajout de `zod`
Déjà tranché en pratique (validation Zod sur tous les endpoints admin, cohérent et déjà en usage) — juste à acter consciemment plutôt que de laisser passer silencieusement, par respect de ta propre règle CLAUDE.md.

### 16. Vérifier que `.next` n'est plus suivi par git
```
Vérifie si le dossier .next est actuellement suivi par git sur la
branche main : `git ls-files main -- .next | head`. S'il y a des
résultats, dis-le-moi sans rien modifier — je déciderai comment
nettoyer l'historique si besoin.
```

---

## Une fois tout coché
Repasser par la Phase 4 (tests/QA) et Phase 5 (handoff) de la stratégie initiale : checklist sécurité, test réel par quelqu'un de non-technique sur mobile, puis guide écrit pour ton père.