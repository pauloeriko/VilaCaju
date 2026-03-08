---
name: database-design
description: >
  Conception de schémas BDD, migrations, requêtes optimisées, Prisma, SQLAlchemy.
  Charger automatiquement pour tout ce qui touche aux modèles de données,
  migrations, relations, schémas, ou requêtes complexes.
---

# Database Design — Conventions et bonnes pratiques

## Conventions de nommage

```sql
-- Tables : snake_case, pluriel
users, orders, order_items, product_categories

-- Colonnes : snake_case
user_id, created_at, is_active, first_name

-- Clés primaires : toujours "id"
id SERIAL PRIMARY KEY  -- ou uuid

-- Clés étrangères : {table_singulier}_id
user_id, order_id, product_id

-- Indexes : idx_{table}_{colonnes}
idx_orders_user_id
idx_users_email
idx_orders_user_status  -- index composé

-- Timestamps : toujours created_at + updated_at
created_at TIMESTAMPTZ DEFAULT NOW()
updated_at TIMESTAMPTZ DEFAULT NOW()
```

---

## Schéma Prisma — patterns corrects

```prisma
// ✅ Modèle bien structuré
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  role      UserRole @default(USER)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  orders    Order[]
  profile   Profile?

  @@index([email])        // Index sur email (pour les lookups)
  @@map("users")          // Nom de table en snake_case
}

model Order {
  id        Int         @id @default(autoincrement())
  userId    Int
  status    OrderStatus @default(PENDING)
  total     Decimal     @db.Decimal(10, 2)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  user  User        @relation(fields: [userId], references: [id])
  items OrderItem[]

  @@index([userId])
  @@index([status])
  @@index([userId, status])  // Index composé pour filtre fréquent
  @@map("orders")
}

enum UserRole {
  USER
  ADMIN
  MODERATOR
}
```

---

## Migrations — règles critiques

```
✅ Une migration = un changement logique
✅ Migrations toujours réversibles (up + down)
✅ Jamais modifier une migration déjà déployée — créer une nouvelle
✅ Tester les migrations sur un dump de la prod avant déploiement

❌ Jamais supprimer une colonne directement (risque d'erreur app)
  → Étape 1 : déprécier (ne plus écrire, app toujours compatible)
  → Étape 2 : supprimer après déploiement app
  
❌ Jamais ajouter une colonne NOT NULL sans default sur table peuplée
  → Ajouter avec DEFAULT ou NULLABLE d'abord, puis contraindre
```

```python
# ✅ Migration SQLAlchemy Alembic avec up et down
def upgrade() -> None:
    op.add_column("users", sa.Column(
        "phone",
        sa.String(20),
        nullable=True,  # Nullable d'abord sur table existante
    ))
    op.create_index("idx_users_phone", "users", ["phone"])

def downgrade() -> None:
    op.drop_index("idx_users_phone", "users")
    op.drop_column("users", "phone")
```

---

## Requêtes avec SQLAlchemy (Python)

```python
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload, joinedload

# ✅ Requêtes avec eager loading (anti N+1)
async def get_orders_with_details(user_id: int) -> list[Order]:
    result = await session.execute(
        select(Order)
        .where(Order.user_id == user_id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product),
        )
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()

# ✅ Pagination
async def get_paginated_users(page: int, per_page: int) -> tuple[list[User], int]:
    offset = (page - 1) * per_page
    
    # Compter et charger en parallèle
    count_query = select(func.count(User.id)).where(User.is_active == True)
    data_query = (
        select(User)
        .where(User.is_active == True)
        .offset(offset)
        .limit(per_page)
        .order_by(User.created_at.desc())
    )
    
    total = await session.scalar(count_query)
    users = await session.scalars(data_query)
    return users.all(), total

# ✅ Aggregation
async def get_revenue_by_month() -> list[dict]:
    result = await session.execute(
        select(
            func.date_trunc("month", Order.created_at).label("month"),
            func.sum(Order.total).label("revenue"),
            func.count(Order.id).label("order_count"),
        )
        .where(Order.status == OrderStatus.COMPLETED)
        .group_by(func.date_trunc("month", Order.created_at))
        .order_by(func.date_trunc("month", Order.created_at))
    )
    return [{"month": r.month, "revenue": r.revenue, "orders": r.order_count}
            for r in result]
```

---

## Transactions — quand et comment

```python
# ✅ Transaction pour opérations liées (tout ou rien)
async def transfer_credits(from_user_id: int, to_user_id: int, amount: int):
    async with session.begin():  # Transaction automatique (commit ou rollback)
        from_user = await session.get(User, from_user_id, with_for_update=True)
        to_user = await session.get(User, to_user_id, with_for_update=True)
        
        if from_user.credits < amount:
            raise InsufficientCreditsError(from_user_id, amount, from_user.credits)
        
        from_user.credits -= amount
        to_user.credits += amount
        # Pas besoin de commit() — géré par le context manager
```

```typescript
// ✅ Transaction Prisma
async function createOrderWithItems(data: CreateOrderData): Promise<Order> {
  return prisma.$transaction(async (tx) => {
    // Vérifier le stock
    for (const item of data.items) {
      const product = await tx.product.findUniqueOrThrow({
        where: { id: item.productId },
      });
      if (product.stock < item.quantity) {
        throw new InsufficientStockError(item.productId, item.quantity, product.stock);
      }
    }
    
    // Créer la commande
    const order = await tx.order.create({
      data: {
        userId: data.userId,
        items: { create: data.items },
      },
    });
    
    // Décrémenter le stock
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
    
    return order;
  });
}
```

---

## Repository Pattern — abstraire l'accès données

```python
# ✅ Interface Repository
from abc import ABC, abstractmethod

class OrderRepository(ABC):
    @abstractmethod
    async def get(self, order_id: int) -> Order | None: ...
    
    @abstractmethod
    async def get_or_raise(self, order_id: int) -> Order: ...
    
    @abstractmethod
    async def find_by_user(self, user_id: int, status: OrderStatus | None = None) -> list[Order]: ...
    
    @abstractmethod
    async def create(self, data: OrderCreate) -> Order: ...
    
    @abstractmethod
    async def update_status(self, order_id: int, status: OrderStatus) -> Order: ...

# ✅ Implémentation SQLAlchemy
class SQLAlchemyOrderRepository(OrderRepository):
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def get_or_raise(self, order_id: int) -> Order:
        order = await self.session.get(Order, order_id)
        if not order:
            raise OrderNotFoundError(order_id)
        return order
    
    async def find_by_user(self, user_id: int, status: OrderStatus | None = None) -> list[Order]:
        query = select(Order).where(Order.user_id == user_id)
        if status:
            query = query.where(Order.status == status)
        result = await self.session.execute(query.order_by(Order.created_at.desc()))
        return result.scalars().all()
```

---

## Checklist BDD avant commit

- [ ] Timestamps `created_at` + `updated_at` sur tous les modèles
- [ ] Index sur toutes les FK et colonnes filtrées fréquemment
- [ ] Migrations réversibles avec `downgrade()`
- [ ] Transactions sur les opérations multi-tables liées
- [ ] Eager loading configuré pour éviter N+1
- [ ] Données sensibles hashées (passwords) ou chiffrées (PII)
- [ ] Soft delete si les données doivent être restaurables (is_deleted + deleted_at)
- [ ] Repository pattern — logique BDD isolée des services
