---
name: js-ts-conventions
description: >
  Conventions JavaScript et TypeScript modernes : typage strict, React, Node.js,
  async/await, patterns fonctionnels. Charger automatiquement pour tout code
  JavaScript, TypeScript, React, Next.js, ou Node.js.
---

# JavaScript / TypeScript Conventions

## TypeScript — typage strict, toujours

```json
// tsconfig.json — strict mode obligatoire
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

```typescript
// ❌ Types paresseux
const data: any = fetchData();
const user = {} as User;
function process(items: any[]): any { ... }

// ✅ Types précis
const data: ApiResponse<User[]> = await fetchData();
const user: Partial<User> = {};
function process(items: readonly Item[]): ProcessedItem[] { ... }

// ✅ Types utilitaires TypeScript
type UserUpdate = Partial<Pick<User, "name" | "email" | "bio">>;
type ReadonlyUser = Readonly<User>;
type UserWithoutPassword = Omit<User, "password" | "salt">;
type UserId = User["id"];  // type extraction
```

---

## Interfaces vs Types

```typescript
// ✅ Interface pour objets extensibles (classes, shapes)
interface Repository<T, ID> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: ID): Promise<void>;
}

// ✅ Type pour unions, intersections, primitives aliasés
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

type UserId = number;
type Email = string;
type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

// ✅ Discriminated unions pour états
type AuthState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "authenticated"; user: User; token: string }
  | { status: "error"; message: string };
```

---

## Async/Await — patterns corrects

```typescript
// ❌ Promise chains mélangées avec async/await
async function loadData() {
  return fetchUser(id).then(user => {
    return fetchOrders(user.id).then(orders => ({
      user,
      orders,
    }));
  });
}

// ❌ await séquentiels inutiles
async function getDashboard(userId: number) {
  const user = await getUser(userId);
  const orders = await getOrders(userId);    // n'attend pas user
  const stats = await getStats(userId);      // n'attend pas orders
  return { user, orders, stats };
}

// ✅ Promise.all pour parallélisation
async function getDashboard(userId: number) {
  const [user, orders, stats] = await Promise.all([
    getUser(userId),
    getOrders(userId),
    getStats(userId),
  ]);
  return { user, orders, stats };
}

// ✅ Gestion d'erreurs avec Result type
async function createUser(data: UserCreate): Promise<Result<User>> {
  try {
    const user = await userRepository.create(data);
    return { success: true, data: user };
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return { success: false, error: new Error("Email déjà utilisé") };
    }
    throw error; // Ré-lancer les erreurs inattendues
  }
}
```

---

## React — patterns modernes

```typescript
// ❌ Props non typées
function UserCard({ user, onEdit, showBadge }) {
  ...
}

// ✅ Props typées avec interface
interface UserCardProps {
  user: User;
  onEdit: (userId: number) => void;
  showBadge?: boolean;
  className?: string;
}

function UserCard({ user, onEdit, showBadge = false, className }: UserCardProps) {
  return (
    <div className={cn("user-card", className)}>
      ...
    </div>
  );
}

// ✅ Hooks custom pour logique réutilisable
function useUser(userId: number) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;  // Cleanup pour éviter les race conditions

    async function fetchUser() {
      try {
        setIsLoading(true);
        const data = await userService.getById(userId);
        if (!cancelled) setUser(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchUser();
    return () => { cancelled = true; };
  }, [userId]);

  return { user, isLoading, error };
}
```

---

## Immutabilité — pas de mutation directe

```typescript
// ❌ Mutation directe
function addItem(cart: Cart, item: CartItem): Cart {
  cart.items.push(item);           // Mutation !
  cart.total += item.price;        // Mutation !
  return cart;
}

// ✅ Copies immutables
function addItem(cart: Cart, item: CartItem): Cart {
  return {
    ...cart,
    items: [...cart.items, item],
    total: cart.total + item.price,
  };
}

// ✅ Avec arrays
const updated = items.map(item =>
  item.id === targetId ? { ...item, quantity: item.quantity + 1 } : item
);

const filtered = items.filter(item => item.id !== removedId);

const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
// ↑ [...items] car .sort() mute le tableau original
```

---

## Gestion des nulls et undefined

```typescript
// ✅ Optional chaining et nullish coalescing
const userName = user?.profile?.displayName ?? user?.name ?? "Anonyme";
const firstItem = cart?.items?.[0]?.name;

// ✅ Type guards pour narrowing
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "email" in value
  );
}

// ✅ Non-null assertion uniquement quand certitude absolue
// (toujours accompagner d'un commentaire)
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
// ^ Justifié : cet élément est rendu par notre composant et existe toujours

// ❌ Non-null assertion aveugle
const user = getUser()!;  // Peut exploser en runtime
```

---

## Structure d'un projet Node.js / Next.js

```
src/
├── app/                    # Next.js App Router (ou pages/)
│   ├── (auth)/
│   ├── dashboard/
│   └── api/
├── components/
│   ├── ui/                 # Composants génériques (Button, Input...)
│   └── features/           # Composants métier (UserCard, OrderList...)
├── hooks/                  # Hooks custom réutilisables
├── lib/                    # Utilitaires, configs clients
│   ├── api-client.ts
│   └── utils.ts
├── server/                 # Logique serveur uniquement
│   ├── repositories/
│   ├── services/
│   └── validators/
├── types/                  # Types globaux partagés
│   └── index.ts
└── constants/              # Constantes de l'app
```

---

## Imports — organisation

```typescript
// ✅ Ordre des imports (eslint-import géré automatiquement)
// 1. Node built-ins
import { readFile } from "fs/promises";

// 2. External packages
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// 3. Internal absolus (@/)
import { userService } from "@/server/services/user-service";
import type { User } from "@/types";

// 4. Relatifs
import { validateInput } from "./validators";
```

---

## Zod pour validation des inputs

```typescript
// ✅ Toujours valider les données externes avec Zod
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  age: z.number().int().min(18).max(120),
  role: z.enum(["admin", "user", "moderator"]).default("user"),
});

type CreateUserInput = z.infer<typeof createUserSchema>;

// Utilisation dans un handler API
export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = createUserSchema.safeParse(body);
  
  if (!result.success) {
    return NextResponse.json(
      { errors: result.error.flatten() },
      { status: 422 }
    );
  }
  
  const user = await userService.create(result.data);
  return NextResponse.json(user, { status: 201 });
}
```

---

## Checklist JS/TS avant commit

- [ ] `strict: true` dans tsconfig, aucun `any`
- [ ] Interfaces/types pour toutes les shapes d'objets
- [ ] `Promise.all` pour les opérations async indépendantes
- [ ] Pas de mutation directe (spread, map, filter)
- [ ] Props React typées avec interfaces
- [ ] Inputs externes validés avec Zod
- [ ] Hooks custom pour logique réutilisable
- [ ] ESLint + Prettier passent sans erreur
