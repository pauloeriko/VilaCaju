---
name: clean-code
description: >
  Règles Clean Code pour écrire du code lisible, maintenable et expressif.
  Charger automatiquement lors de l'écriture de fonctions, nommage de variables,
  refactoring, review de code, ou quand le code semble complexe à lire.
---

# Clean Code — Règles d'application

## Nommage — la règle d'or

Le nom doit révéler l'intention. Si un commentaire est nécessaire pour expliquer
un nom, le nom est mauvais.

```python
# ❌ Noms obscurs
def calc(x, y, z):
    return x * y * (1 - z)

d = 7
lst = [u for u in users if u.a]

# ✅ Noms expressifs
def calculate_discounted_price(base_price: float, quantity: int, discount_rate: float) -> float:
    return base_price * quantity * (1 - discount_rate)

days_since_last_login = 7
active_users = [user for user in users if user.is_active]
```

```typescript
// ❌ Abréviations et acronymes inutiles
const usr = await getUsr(usrId);
const calcTtlOrd = (ords: Ord[]) => ords.reduce((acc, o) => acc + o.amt, 0);

// ✅ Noms complets et clairs
const user = await getUserById(userId);
const calculateTotalOrderAmount = (orders: Order[]) =>
  orders.reduce((total, order) => total + order.amount, 0);
```

**Conventions de nommage :**

| Type | Python | TypeScript |
|---|---|---|
| Variables/fonctions | `snake_case` | `camelCase` |
| Classes | `PascalCase` | `PascalCase` |
| Constantes | `UPPER_SNAKE_CASE` | `UPPER_SNAKE_CASE` |
| Interfaces | — | `PascalCase` (sans préfixe I) |
| Types | — | `PascalCase` |
| Fichiers | `snake_case.py` | `kebab-case.ts` |

**Préfixes sémantiques pour les booléens :**
`is_`, `has_`, `can_`, `should_`, `was_`, `will_`
```python
is_authenticated, has_permission, can_edit, should_retry
```

---

## Fonctions — taille et responsabilité

**Règle :** Une fonction fait une chose. Elle la fait bien. Elle ne fait qu'elle.

```python
# ❌ Fonction trop longue, trop de responsabilités
def process_order(order_data: dict):
    # Validation
    if not order_data.get("user_id"):
        raise ValueError("Missing user_id")
    if not order_data.get("items"):
        raise ValueError("No items")
    
    # Calcul prix
    total = 0
    for item in order_data["items"]:
        product = db.query(Product).filter_by(id=item["product_id"]).first()
        total += product.price * item["quantity"]
    
    # Appliquer remise
    if order_data.get("coupon"):
        coupon = db.query(Coupon).filter_by(code=order_data["coupon"]).first()
        total *= (1 - coupon.discount_rate)
    
    # Créer commande
    order = Order(user_id=order_data["user_id"], total=total)
    db.add(order)
    db.commit()
    
    # Envoyer email
    user = db.query(User).filter_by(id=order_data["user_id"]).first()
    send_email(user.email, f"Order confirmed: {order.id}")
    
    return order

# ✅ Responsabilités séparées, fonctions courtes
def process_order(order_data: OrderCreate) -> Order:
    validated = validate_order_data(order_data)
    total = calculate_order_total(validated.items, validated.coupon_code)
    order = order_repository.create(validated.user_id, total)
    event_bus.publish(OrderCreated(order_id=order.id, user_id=order.user_id))
    return order

def validate_order_data(data: OrderCreate) -> OrderCreate:
    if not data.user_id:
        raise ValidationError("user_id requis")
    if not data.items:
        raise ValidationError("Au moins un article requis")
    return data

def calculate_order_total(items: list[OrderItem], coupon_code: str | None) -> Decimal:
    subtotal = sum(get_item_price(item) for item in items)
    discount = get_coupon_discount(coupon_code) if coupon_code else Decimal(0)
    return subtotal * (1 - discount)
```

**Limites à respecter :**
- Fonction : max 25 lignes (hors docstring)
- Paramètres : max 3-4. Au-delà → créer un objet/dataclass
- Niveaux d'indentation : max 2-3. Au-delà → extraire une fonction

---

## Arguments — simplifier les signatures

```python
# ❌ Trop de paramètres primitifs
def create_user(first_name, last_name, email, password, role, is_active, plan):
    ...

# ✅ Regrouper en dataclass / TypedDict
@dataclass
class UserCreate:
    first_name: str
    last_name: str
    email: str
    password: str
    role: UserRole = UserRole.USER
    is_active: bool = True
    plan: Plan = Plan.FREE

def create_user(data: UserCreate) -> User:
    ...
```

```typescript
// ❌ Paramètres booléens mystérieux
renderButton(true, false, true, "Submit");

// ✅ Options object
renderButton({
  isPrimary: true,
  isDisabled: false,
  isFullWidth: true,
  label: "Submit",
});
```

---

## Commentaires — quand écrire, quand éviter

**Commentaire = aveu d'échec du code.** D'abord améliorer le code, commenter en dernier recours.

```python
# ❌ Commentaire qui répète le code
# Incrémente le compteur de 1
counter += 1

# ❌ Commentaire qui explique un mauvais nom
# x est le taux de remise en pourcentage
x = 0.15

# ✅ Code auto-documenté
discount_rate = 0.15

# ✅ Commentaire utile : pourquoi, pas quoi
# On utilise PBKDF2 plutôt que bcrypt ici car la lib bcrypt
# n'est pas disponible dans l'environnement Lambda (voir issue #234)
hashed = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 100000)

# ✅ Commentaire pour logique non-évidente
# Délai intentionnel : l'API partenaire a un rate limit de 1 req/sec
# et retourne 429 si on dépasse, même avec backoff
await asyncio.sleep(1.1)
```

**À NE JAMAIS faire :**
- Code commenté laissé en place → utiliser git
- TODO sans ticket/issue référencé
- Commentaires de date ou d'auteur → utiliser git blame

---

## Structure du code — organisation

**Règle du journal :** Le code le plus important en haut (comme un article de presse).
Fonctions publiques en premier, helpers privés ensuite.

```python
# ✅ Organisation top-down
class OrderService:
    # Public API en premier
    def create_order(self, data: OrderCreate) -> Order:
        validated = self._validate(data)
        total = self._calculate_total(validated)
        return self._persist(validated, total)

    def cancel_order(self, order_id: int, reason: str) -> None:
        order = self._get_or_raise(order_id)
        self._validate_cancellation(order)
        self._apply_cancellation(order, reason)

    # Helpers privés ensuite
    def _validate(self, data: OrderCreate) -> OrderCreate: ...
    def _calculate_total(self, data: OrderCreate) -> Decimal: ...
    def _persist(self, data: OrderCreate, total: Decimal) -> Order: ...
    def _get_or_raise(self, order_id: int) -> Order: ...
    def _validate_cancellation(self, order: Order) -> None: ...
    def _apply_cancellation(self, order: Order, reason: str) -> None: ...
```

---

## DRY vs WET vs AHA

**DRY** (Don't Repeat Yourself) : ne pas dupliquer la logique.
**WET** (Write Everything Twice) : la duplication est acceptable la première fois.
**AHA** (Avoid Hasty Abstractions) : n'abstraire qu'après la 3ème duplication.

```
Règle pratique :
- 1ère fois → écrire directement
- 2ème fois → accepter la duplication
- 3ème fois → abstraire proprement
```

---

## Conditions — simplifier et clarifier

```python
# ❌ Conditions négatives complexes
if not (not user.is_banned and user.is_verified and user.has_subscription):
    redirect_to_login()

# ✅ Extraire dans une fonction nommée
def can_access_premium_content(user: User) -> bool:
    return (
        not user.is_banned
        and user.is_verified
        and user.has_active_subscription
    )

if not can_access_premium_content(user):
    redirect_to_login()
```

```typescript
// ❌ Early return absent — niveaux d'indentation excessifs
function processPayment(order: Order) {
  if (order) {
    if (order.isPaid) {
      if (order.items.length > 0) {
        // logique principale enfouie
      }
    }
  }
}

// ✅ Early returns — guard clauses
function processPayment(order: Order) {
  if (!order) throw new Error("Order requis");
  if (order.isPaid) throw new Error("Commande déjà payée");
  if (order.items.length === 0) throw new Error("Commande vide");

  // logique principale lisible ici
}
```

---

## Checklist Clean Code avant commit

- [ ] Chaque nom révèle l'intention sans commentaire
- [ ] Fonctions < 25 lignes, 1 seule responsabilité
- [ ] Max 3-4 paramètres par fonction (ou objet)
- [ ] Pas de commentaires qui expliquent "quoi" (seulement "pourquoi")
- [ ] Pas de code commenté
- [ ] Conditions lisibles (fonctions nommées, early returns)
- [ ] Pas de duplication logique (règle des 3)
- [ ] Niveaux d'indentation ≤ 3
