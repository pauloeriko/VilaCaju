---
name: python-conventions
description: >
  Conventions Python modernes (3.10+) : typing, dataclasses, async, structure
  de projets, outils. Charger automatiquement pour tout code Python, scripts,
  APIs FastAPI/Flask, microservices, ou CLI Python.
---

# Python Conventions — Standards du projet

## Typing — obligatoire partout

Python 3.10+ avec annotations complètes sur toutes les fonctions publiques.

```python
# ❌ Sans types
def get_user(user_id, include_posts=False):
    ...

def process_items(items):
    result = []
    for item in items:
        result.append(transform(item))
    return result

# ✅ Avec types complets
from typing import Optional
from collections.abc import Sequence

def get_user(user_id: int, include_posts: bool = False) -> User | None:
    ...

def process_items(items: Sequence[Item]) -> list[ProcessedItem]:
    return [transform(item) for item in items]
```

**Types modernes Python 3.10+ :**
```python
# ✅ Union types
def find(id: int) -> User | None: ...         # pas Optional[User]
items: list[str] | None = None                # pas Optional[List[str]]
result: int | str | float                     # pas Union[int, str, float]

# ✅ Types built-in (pas besoin d'importer depuis typing)
def process(items: list[str]) -> dict[str, int]: ...   # pas List, Dict
def get(data: tuple[int, str]) -> set[int]: ...         # pas Tuple, Set
```

---

## Dataclasses et Pydantic

**Utiliser des dataclasses ou Pydantic, jamais des dict bruts pour les données structurées.**

```python
# ❌ Dict non typé
def create_user(data: dict):
    name = data.get("name")  # Peut être None, pas garanti
    email = data["email"]    # KeyError potentiel

# ✅ Pydantic pour validation externe (API, inputs)
from pydantic import BaseModel, EmailStr, field_validator

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    age: int
    
    @field_validator("age")
    @classmethod
    def validate_age(cls, v: int) -> int:
        if v < 0 or v > 150:
            raise ValueError("Âge invalide")
        return v

# ✅ Dataclass pour données internes
from dataclasses import dataclass, field

@dataclass
class OrderItem:
    product_id: int
    quantity: int
    unit_price: float
    
    @property
    def subtotal(self) -> float:
        return self.quantity * self.unit_price

@dataclass
class Order:
    user_id: int
    items: list[OrderItem] = field(default_factory=list)
    
    @property
    def total(self) -> float:
        return sum(item.subtotal for item in self.items)
```

---

## Gestion d'erreurs Python

```python
# ❌ Attraper trop large
try:
    result = process(data)
except Exception as e:
    print(f"Error: {e}")  # Silence les erreurs importantes

# ❌ except vide
try:
    connect_to_db()
except:
    pass

# ✅ Exceptions spécifiques avec contexte
class OrderNotFoundError(ValueError):
    def __init__(self, order_id: int):
        self.order_id = order_id
        super().__init__(f"Commande {order_id} introuvable")

class InsufficientStockError(RuntimeError):
    def __init__(self, product_id: int, requested: int, available: int):
        self.product_id = product_id
        self.requested = requested
        self.available = available
        super().__init__(
            f"Stock insuffisant pour produit {product_id}: "
            f"demandé={requested}, disponible={available}"
        )

# ✅ Gestion ciblée
try:
    order = order_service.create(data)
except ValidationError as e:
    logger.warning("Données invalides", extra={"errors": e.errors()})
    raise HTTPException(status_code=422, detail=e.errors())
except InsufficientStockError as e:
    logger.info("Stock insuffisant", extra={"product_id": e.product_id})
    raise HTTPException(status_code=409, detail=str(e))
```

---

## Code asynchrone

```python
# ❌ Appels async séquentiels inutiles
async def get_dashboard_data(user_id: int):
    user = await get_user(user_id)
    orders = await get_orders(user_id)       # Attend user inutilement
    stats = await get_stats(user_id)         # Attend orders inutilement
    return {"user": user, "orders": orders, "stats": stats}

# ✅ Parallélisation avec asyncio.gather
import asyncio

async def get_dashboard_data(user_id: int):
    user, orders, stats = await asyncio.gather(
        get_user(user_id),
        get_orders(user_id),
        get_stats(user_id),
    )
    return {"user": user, "orders": orders, "stats": stats}

# ✅ Timeout sur les opérations réseau
async def fetch_external_data(url: str) -> dict:
    async with asyncio.timeout(10):  # 10 secondes max
        async with httpx.AsyncClient() as client:
            response = await client.get(url)
            response.raise_for_status()
            return response.json()
```

---

## Context managers et ressources

```python
# ❌ Ressources non fermées proprement
def read_config():
    f = open("config.json")
    data = json.load(f)
    # f jamais fermé si exception
    return data

# ✅ Context manager toujours
def read_config() -> dict:
    with open("config.json", "r", encoding="utf-8") as f:
        return json.load(f)

# ✅ Context manager custom pour ressources complexes
from contextlib import asynccontextmanager

@asynccontextmanager
async def get_db_transaction():
    async with db.begin() as transaction:
        try:
            yield transaction
            await transaction.commit()
        except Exception:
            await transaction.rollback()
            raise
```

---

## Structure de projet Python

```
mon-projet/
├── src/
│   └── mon_projet/
│       ├── __init__.py
│       ├── main.py              # Point d'entrée
│       ├── config.py            # Settings (pydantic-settings)
│       ├── models/              # Modèles de données
│       │   ├── __init__.py
│       │   └── user.py
│       ├── repositories/        # Accès données (Pattern Repository)
│       │   ├── __init__.py
│       │   └── user_repository.py
│       ├── services/            # Logique métier
│       │   ├── __init__.py
│       │   └── user_service.py
│       ├── api/                 # Routes (FastAPI)
│       │   ├── __init__.py
│       │   ├── deps.py          # Dépendances injectées
│       │   └── routes/
│       └── utils/               # Utilitaires partagés
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── pyproject.toml
├── .env.example
└── README.md
```

---

## Configuration avec pydantic-settings

```python
# config.py — jamais de hardcoded values
from pydantic_settings import BaseSettings
from pydantic import SecretStr

class Settings(BaseSettings):
    # App
    app_name: str = "Mon App"
    debug: bool = False
    
    # Database
    database_url: str
    
    # Auth
    secret_key: SecretStr
    access_token_expire_minutes: int = 30
    
    # External APIs
    stripe_api_key: SecretStr | None = None
    
    model_config = {"env_file": ".env", "case_sensitive": False}

# Singleton — charger une seule fois
settings = Settings()

# Usage
from .config import settings
print(settings.database_url)
```

---

## Outils obligatoires

```toml
# pyproject.toml
[tool.ruff]
line-length = 100
select = ["E", "F", "I", "N", "UP", "B", "SIM", "ANN"]
ignore = ["ANN101", "ANN102"]

[tool.mypy]
strict = true
ignore_missing_imports = true

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

**Commandes :**
```bash
ruff check . --fix     # Lint + auto-fix
ruff format .          # Format (remplace black)
mypy src/              # Type checking strict
pytest --cov=src       # Tests avec coverage
```

---

## Checklist Python avant commit

- [ ] Toutes les fonctions publiques ont des annotations de types
- [ ] Pas de `dict` brut pour données structurées (dataclass ou Pydantic)
- [ ] Pas de `except Exception` ni `except:` sans justification
- [ ] Appels async parallélisés avec `asyncio.gather` quand possible
- [ ] Ressources fermées via context managers
- [ ] Pas de valeurs hardcodées (utiliser `settings`)
- [ ] `ruff check` et `mypy` passent sans erreur
