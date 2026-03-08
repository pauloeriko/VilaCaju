---
name: error-handling
description: >
  Gestion des erreurs, exceptions personnalisées, Result types, logging.
  Charger automatiquement lors de la gestion d'exceptions, création de classes
  d'erreur, try/catch, ou discussion sur la robustesse du code.
---

# Error Handling — Gérer les erreurs proprement

## Principe fondamental

**Les erreurs font partie du domaine métier.** Elles doivent être explicites,
typées, et porteuses de contexte. Un `Exception` générique sans contexte
est aussi inutile qu'un silence.

---

## Hiérarchie d'exceptions — Python

```python
# ✅ Créer une hiérarchie d'exceptions métier
class AppError(Exception):
    """Base exception de l'application."""
    def __init__(self, message: str, code: str | None = None):
        self.message = message
        self.code = code or self.__class__.__name__
        super().__init__(message)

# Catégories
class NotFoundError(AppError):
    """Ressource introuvable."""
    pass

class ValidationError(AppError):
    """Données invalides."""
    def __init__(self, message: str, field: str | None = None):
        self.field = field
        super().__init__(message)

class AuthError(AppError):
    """Problème d'authentification ou autorisation."""
    pass

class ConflictError(AppError):
    """Conflit de données (unicité, état invalide)."""
    pass

class ExternalServiceError(AppError):
    """Erreur d'un service externe."""
    def __init__(self, service: str, message: str):
        self.service = service
        super().__init__(f"{service}: {message}")

# Spécifiques métier
class UserNotFoundError(NotFoundError):
    def __init__(self, user_id: int):
        self.user_id = user_id
        super().__init__(f"Utilisateur {user_id} introuvable")

class InsufficientStockError(ConflictError):
    def __init__(self, product_id: int, requested: int, available: int):
        self.product_id = product_id
        self.requested = requested
        self.available = available
        super().__init__(
            f"Stock insuffisant: demandé={requested}, disponible={available}",
            code="INSUFFICIENT_STOCK"
        )

class OrderAlreadyCancelledError(ConflictError):
    def __init__(self, order_id: int):
        super().__init__(f"Commande {order_id} déjà annulée")
```

---

## Result Type — erreurs sans exceptions

Pour les cas d'erreur attendus et contrôlés, le Result type évite les exceptions
comme mécanisme de contrôle de flux.

```python
# ✅ Result type en Python avec dataclass
from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")
E = TypeVar("E", bound=Exception)

@dataclass
class Ok(Generic[T]):
    value: T
    is_ok: bool = True

@dataclass  
class Err(Generic[E]):
    error: E
    is_ok: bool = False

type Result[T, E] = Ok[T] | Err[E]

# Usage
async def find_user(email: str) -> Result[User, UserNotFoundError]:
    user = await db.users.find_by_email(email)
    if not user:
        return Err(UserNotFoundError(email=email))
    return Ok(user)

# Consommation explicite
result = await find_user("paul@example.com")
if not result.is_ok:
    logger.warning("Utilisateur non trouvé", extra={"email": "paul@example.com"})
    raise HTTPException(status_code=404)

user = result.value  # Type narrowing — on sait que c'est Ok ici
```

```typescript
// ✅ Result type en TypeScript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });
const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

// Usage
async function findUser(email: string): Promise<Result<User, "NOT_FOUND" | "DB_ERROR">> {
  try {
    const user = await db.users.findByEmail(email);
    if (!user) return err("NOT_FOUND");
    return ok(user);
  } catch {
    return err("DB_ERROR");
  }
}

// Consommation
const result = await findUser("paul@example.com");
if (!result.ok) {
  if (result.error === "NOT_FOUND") return notFound();
  return serverError();
}
// result.value est typé User ici
const user = result.value;
```

---

## Logging structuré — le bon niveau

```python
import logging
import structlog

logger = structlog.get_logger()

# ✅ Niveaux corrects
logger.debug("Connexion DB établie", host="localhost", port=5432)
logger.info("Utilisateur créé", user_id=new_user.id, email=new_user.email)
logger.warning("Tentative de connexion échouée", email=email, attempts=3)
logger.error("Paiement échoué", order_id=order.id, error=str(e))
logger.critical("BDD inaccessible — service dégradé", error=str(e))

# ✅ Contexte structuré (pas de string interpolation dans les logs)
# ❌ logger.info(f"Commande {order_id} créée pour {user_email}")
# ✅
logger.info("Commande créée", order_id=order_id, user_email=user_email)

# ✅ Exception avec traceback
try:
    result = await external_api.charge(amount)
except httpx.TimeoutException as e:
    logger.error(
        "Timeout paiement Stripe",
        order_id=order.id,
        amount=str(amount),
        exc_info=True,  # Inclut le traceback
    )
    raise ExternalServiceError("Stripe", "Timeout lors du paiement") from e
```

---

## Gestionnaire d'erreurs global — FastAPI

```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    return JSONResponse(
        status_code=404,
        content={"success": False, "error": {"code": exc.code, "message": exc.message}},
    )

@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={"success": False, "error": {"code": exc.code, "message": exc.message, "field": exc.field}},
    )

@app.exception_handler(AuthError)
async def auth_error_handler(request: Request, exc: AuthError):
    return JSONResponse(
        status_code=403,
        content={"success": False, "error": {"code": exc.code, "message": exc.message}},
    )

@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    logger.error("Erreur non gérée", path=str(request.url), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": {"code": "INTERNAL_ERROR", "message": "Erreur interne"}},
        # ↑ Jamais exposer les détails en production
    )
```

---

## Gestionnaire global — Next.js

```typescript
// lib/api-utils.ts
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: 404 }
    );
  }
  
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: 422 }
    );
  }
  
  if (error instanceof AuthError) {
    return NextResponse.json(
      { success: false, error: { code: error.code, message: error.message } },
      { status: 403 }
    );
  }

  // Erreur non gérée — logger mais ne pas exposer
  logger.error("Unhandled error", { error: String(error) });
  return NextResponse.json(
    { success: false, error: { code: "INTERNAL_ERROR", message: "Erreur interne" } },
    { status: 500 }
  );
}
```

---

## Ce qu'il ne faut jamais faire

```python
# ❌ Silence des erreurs
try:
    send_email(user)
except:
    pass  # L'email n'est pas parti, personne ne le sait

# ❌ Re-throw sans contexte
try:
    order = create_order(data)
except Exception as e:
    raise Exception("Error") from None  # On perd tout le contexte

# ❌ Log + raise (double reporting)
try:
    result = process(data)
except ValueError as e:
    logger.error("Erreur", exc_info=True)
    raise  # Va être logué à nouveau plus haut

# ✅ Log OU raise, pas les deux (sauf au niveau handler global)
# Au niveau service : raise avec contexte
# Au niveau handler HTTP : catch, log, retourner réponse HTTP
```

---

## Checklist error handling avant commit

- [ ] Exceptions métier personnalisées (pas `Exception` générique)
- [ ] Chaque exception porte contexte suffisant (IDs, valeurs concernées)
- [ ] Pas de `except: pass` ni `.catch(() => {})`
- [ ] Logs structurés avec contexte (pas de string interpolation)
- [ ] Gestionnaire global qui mappe exceptions → codes HTTP
- [ ] Jamais exposer les stack traces en production
- [ ] Erreurs attendues → Result type, erreurs inattendues → exceptions
