---
name: api-design
description: >
  Design d'APIs REST et conventions de réponses. Charger automatiquement lors
  de la création d'endpoints, routes API, handlers, controllers, ou lors de
  discussions sur les contrats d'API.
---

# API Design — Conventions et standards

## Structure des réponses — format uniforme

**Toujours retourner le même format**, qu'il y ait succès ou erreur.

```typescript
// ✅ Format de réponse standard
interface ApiResponse<T = null> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

interface ApiError {
  success: false;
  error: {
    code: string;           // Code machine (ex: "USER_NOT_FOUND")
    message: string;        // Message humain
    details?: unknown;      // Détails de validation si pertinent
  };
}

interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// ✅ Exemples de réponses
// Succès simple
{ "success": true, "data": { "id": 1, "name": "Paul" } }

// Succès avec pagination
{
  "success": true,
  "data": [...],
  "meta": { "page": 1, "per_page": 20, "total": 150, "total_pages": 8 }
}

// Erreur
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "details": { "email": ["Email invalide"] }
  }
}
```

---

## HTTP Status codes — utilisation correcte

```
GET    /resources          → 200 OK
POST   /resources          → 201 Created
PUT    /resources/:id      → 200 OK
PATCH  /resources/:id      → 200 OK
DELETE /resources/:id      → 204 No Content

400 Bad Request      → Corps malformé / paramètres manquants
401 Unauthorized     → Non authentifié (pas de token)
403 Forbidden        → Authentifié mais pas autorisé
404 Not Found        → Ressource introuvable
409 Conflict         → Conflit (email existant, état invalide)
422 Unprocessable    → Données valides syntaxiquement mais invalides métier
429 Too Many Requests → Rate limiting
500 Internal Server  → Erreur serveur (jamais exposer les détails)
```

---

## Nommage des routes REST

```
# ✅ Conventions REST
GET    /users                    → Liste des utilisateurs
GET    /users/:id                → Un utilisateur
POST   /users                    → Créer un utilisateur
PUT    /users/:id                → Remplacer un utilisateur
PATCH  /users/:id                → Modifier partiellement
DELETE /users/:id                → Supprimer

# Relations
GET    /users/:id/orders          → Commandes d'un utilisateur
POST   /users/:id/orders          → Créer une commande pour un utilisateur
GET    /orders/:id/items          → Articles d'une commande

# Actions non-CRUD (verbes acceptés)
POST   /users/:id/activate        → Activer un compte
POST   /orders/:id/cancel         → Annuler une commande
POST   /auth/login                → Connexion
POST   /auth/logout               → Déconnexion
POST   /auth/refresh              → Rafraîchir le token
POST   /payments/:id/refund       → Rembourser

# ❌ À éviter
GET    /getUsers
POST   /createUser
GET    /user_list
POST   /users/create
```

---

## Pagination, filtres, tri

```typescript
// ✅ Query params standards
GET /users?page=2&per_page=20
GET /orders?status=pending&from=2024-01-01&to=2024-12-31
GET /products?sort=price&order=asc&category=electronics

// ✅ Handler avec validation
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["created_at", "name", "price"]).default("created_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = querySchema.parse(Object.fromEntries(searchParams));
  
  const { data, total } = await userService.findAll(query);
  
  return NextResponse.json({
    success: true,
    data,
    meta: {
      page: query.page,
      per_page: query.per_page,
      total,
      total_pages: Math.ceil(total / query.per_page),
    },
  });
}
```

---

## Versioning d'API

```
# ✅ Version dans l'URL (recommandé pour APIs publiques)
/api/v1/users
/api/v2/users

# ✅ Header pour APIs internes
Accept: application/vnd.myapp.v2+json
```

---

## Handlers API — structure type (Next.js)

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userService } from "@/server/services/user-service";
import { requireAuth } from "@/server/middleware/auth";
import { handleApiError } from "@/lib/api-utils";

const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Auth
    const currentUser = await requireAuth(request);
    
    // 2. Params validation
    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_ID", message: "ID invalide" } },
        { status: 400 }
      );
    }
    
    // 3. Body validation
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Données invalides", details: parsed.error.flatten() } },
        { status: 422 }
      );
    }
    
    // 4. Authorization
    if (currentUser.id !== userId && currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Non autorisé" } },
        { status: 403 }
      );
    }
    
    // 5. Business logic
    const updated = await userService.update(userId, parsed.data);
    
    // 6. Response
    return NextResponse.json({ success: true, data: updated });
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

---

## FastAPI — structure type (Python)

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Annotated

router = APIRouter(prefix="/users", tags=["users"])

class UserUpdate(BaseModel):
    name: str | None = None
    email: str | None = None

@router.patch("/{user_id}", response_model=ApiResponse[UserResponse])
async def update_user(
    user_id: int,
    data: UserUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    service: Annotated[UserService, Depends(get_user_service)],
):
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    updated = await service.update(user_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    
    return ApiResponse(success=True, data=updated)
```

---

## Checklist API avant commit

- [ ] Format de réponse uniforme (ApiResponse) sur tous les endpoints
- [ ] Status codes HTTP corrects
- [ ] Tous les inputs validés (Zod / Pydantic) avant traitement
- [ ] Auth vérifiée avant toute opération
- [ ] Authorization (permissions) vérifiée après auth
- [ ] Pas de données sensibles dans les réponses (passwords, tokens internes)
- [ ] Erreurs gérées sans exposer les stack traces en production
- [ ] Pagination sur toutes les listes (max per_page limité)
