---
name: performance
description: >
  Optimisation des performances : requêtes BDD, caching, algorithmes, rendering
  React. Charger automatiquement lors d'optimisation de requêtes, discussion de
  N+1 queries, caching, lazy loading, ou performances API.
---

# Performance — Optimiser au bon endroit

## Règle d'or : mesurer avant d'optimiser

```
Profil → Identifie le vrai goulot → Optimise → Mesure à nouveau
```

Ne jamais optimiser au doigt mouillé. Utiliser les outils :
- Python : `cProfile`, `py-spy`, `line_profiler`
- Node.js : `--prof`, `clinic.js`, DevTools profiler
- BDD : `EXPLAIN ANALYZE` sur toutes les requêtes lentes

---

## Base de données — les optimisations les plus impactantes

### N+1 Queries — le tueur de performances le plus courant

```python
# ❌ N+1 : 1 query pour les ordres + N queries pour les users
orders = await Order.find_all()
for order in orders:
    user = await User.find_by_id(order.user_id)  # Query par itération !
    print(f"{user.name}: {order.total}")

# ✅ Eager loading — 1 seule query avec JOIN
orders = await Order.find_all(include=["user"])  # SELECT orders JOIN users
for order in orders:
    print(f"{order.user.name}: {order.total}")

# ✅ Avec Prisma (TypeScript)
const orders = await prisma.order.findMany({
  include: { user: true, items: { include: { product: true } } }
});

# ✅ Avec SQLAlchemy
from sqlalchemy.orm import selectinload
orders = await session.execute(
    select(Order).options(selectinload(Order.user), selectinload(Order.items))
)
```

### Index — vérifier avant de déployer

```sql
-- ✅ Index sur toutes les colonnes filtrées fréquemment
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Index composé si filtre multi-colonnes fréquent
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- Vérifier qu'une query utilise bien l'index
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 1 AND status = 'pending';
```

### Pagination — obligatoire sur toutes les listes

```python
# ❌ Charger toute la table
users = await User.find_all()  # Peut retourner des millions de lignes

# ✅ Pagination cursor-based (plus performante que OFFSET pour grandes tables)
async def get_users_page(cursor: int | None = None, limit: int = 20):
    query = select(User).order_by(User.id).limit(limit + 1)
    if cursor:
        query = query.where(User.id > cursor)
    
    users = await session.execute(query)
    users = users.scalars().all()
    
    has_more = len(users) > limit
    return users[:limit], users[-1].id if has_more else None
```

---

## Caching — quoi et comment cacher

```python
# ✅ Cache en mémoire avec functools pour données stables
from functools import lru_cache
import time

@lru_cache(maxsize=100)
def get_country_list() -> list[dict]:
    """Cache en mémoire — données qui ne changent jamais."""
    return db.query("SELECT * FROM countries ORDER BY name")

# ✅ Cache avec TTL pour données semi-stables
from cachetools import TTLCache, cached

products_cache = TTLCache(maxsize=500, ttl=300)  # 5 minutes

@cached(products_cache)
async def get_product(product_id: int) -> Product:
    return await product_repo.get(product_id)

# ✅ Redis pour cache distribué (plusieurs instances)
import redis.asyncio as redis

async def get_user_permissions(user_id: int) -> list[str]:
    cache_key = f"user:{user_id}:permissions"
    
    # Vérifier le cache
    cached = await redis_client.get(cache_key)
    if cached:
        return json.loads(cached)
    
    # Charger depuis la BDD
    permissions = await permission_repo.get_user_permissions(user_id)
    
    # Mettre en cache 10 minutes
    await redis_client.setex(cache_key, 300, json.dumps(permissions))
    return permissions

# Invalider le cache quand les permissions changent
async def update_user_permissions(user_id: int, permissions: list[str]):
    await permission_repo.update(user_id, permissions)
    await redis_client.delete(f"user:{user_id}:permissions")  # Invalidation
```

---

## React — optimisations de rendering

```typescript
// ❌ Re-render inutile — recalcul à chaque render
function ProductList({ products, category }: Props) {
  // Recalculé à chaque render même si products/category n'a pas changé
  const filtered = products.filter(p => p.category === category);
  const sorted = filtered.sort((a, b) => a.price - b.price);
  
  return <>{sorted.map(p => <ProductCard key={p.id} product={p} />)}</>;
}

// ✅ Mémoisation des calculs coûteux
function ProductList({ products, category }: Props) {
  const sortedFiltered = useMemo(
    () => products
      .filter(p => p.category === category)
      .sort((a, b) => a.price - b.price),
    [products, category]  // Recalcule seulement si ces deps changent
  );
  
  return <>{sortedFiltered.map(p => <ProductCard key={p.id} product={p} />)}</>;
}

// ✅ Mémoisation des composants coûteux
const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  // Ne re-rend pas si product n'a pas changé
  return <div>{product.name}</div>;
});

// ✅ useCallback pour les fonctions passées en props
function OrderList({ orders }: Props) {
  const handleCancel = useCallback(async (orderId: number) => {
    await orderService.cancel(orderId);
    queryClient.invalidateQueries(["orders"]);
  }, []);  // Référence stable
  
  return orders.map(o => <OrderItem key={o.id} order={o} onCancel={handleCancel} />);
}
```

---

## Algorithmes — complexité

```python
# ❌ O(n²) — boucle imbriquée sur grandes listes
def find_duplicates_slow(items: list[str]) -> list[str]:
    duplicates = []
    for i, item in enumerate(items):
        for j, other in enumerate(items):
            if i != j and item == other and item not in duplicates:
                duplicates.append(item)
    return duplicates  # O(n³) dans le pire cas

# ✅ O(n) avec set/dict
def find_duplicates_fast(items: list[str]) -> list[str]:
    seen = set()
    duplicates = set()
    for item in items:
        if item in seen:
            duplicates.add(item)
        seen.add(item)
    return list(duplicates)

# ❌ Lookup O(n) dans une liste
def get_user_by_email(users: list[User], email: str) -> User | None:
    for user in users:
        if user.email == email:  # O(n)
            return user

# ✅ Lookup O(1) avec dict
def build_user_index(users: list[User]) -> dict[str, User]:
    return {user.email: user for user in users}

user_index = build_user_index(users)
user = user_index.get("paul@example.com")  # O(1)
```

---

## Async — éviter les blocages

```python
# ❌ Bloquer l'event loop avec du code synchrone long
async def process_large_file(path: str):
    with open(path) as f:
        data = f.read()          # Bloque l'event loop
        result = process(data)   # CPU-bound : bloque l'event loop
    return result

# ✅ Déléguer les opérations I/O et CPU à des executors
import asyncio
import aiofiles
from concurrent.futures import ProcessPoolExecutor

async def process_large_file(path: str):
    # I/O async
    async with aiofiles.open(path) as f:
        data = await f.read()
    
    # CPU-bound dans un process séparé
    loop = asyncio.get_event_loop()
    with ProcessPoolExecutor() as pool:
        result = await loop.run_in_executor(pool, process, data)
    
    return result
```

---

## Checklist performance avant déploiement

- [ ] 0 N+1 queries (vérifier avec query counter en dev)
- [ ] Index sur toutes les colonnes de WHERE, ORDER BY, JOIN
- [ ] Pagination sur toutes les listes (max 100 items/page)
- [ ] `EXPLAIN ANALYZE` sur les requêtes lentes (> 100ms)
- [ ] Cache pour les données stables ou semi-stables
- [ ] `useMemo` / `memo` sur les composants React coûteux
- [ ] Algorithmes O(n) ou O(n log n) max pour les traitements listes
- [ ] Pas de blocage de l'event loop Node/Python avec code synchrone long
