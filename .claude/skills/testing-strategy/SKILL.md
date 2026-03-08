---
name: testing-strategy
description: >
  Stratégie de tests, TDD, tests unitaires et d'intégration. Charger
  automatiquement lors de l'écriture de tests, discussion de couverture,
  mocking, fixtures, ou lors de TDD.
---

# Testing Strategy — Écrire des tests qui comptent

## La pyramide des tests

```
        /\
       /  \
      / E2E \      ← Peu nombreux, lents, coûteux (Playwright, Cypress)
     /--------\
    /Integration\  ← Moyennement nombreux (API tests, DB tests)
   /------------\
  /  Unit Tests  \ ← Nombreux, rapides, ciblés (Jest, pytest)
 /________________\
```

**Répartition recommandée :**
- 70% tests unitaires (logique métier, utilitaires, transformations)
- 20% tests d'intégration (endpoints API, interactions BDD)
- 10% tests E2E (parcours critiques utilisateur)

---

## Anatomie d'un bon test

**AAA Pattern : Arrange → Act → Assert**

```python
# ✅ Test unitaire clair et focalisé
def test_calculate_order_total_applies_discount():
    # Arrange
    items = [
        OrderItem(product_id=1, quantity=2, unit_price=Decimal("10.00")),
        OrderItem(product_id=2, quantity=1, unit_price=Decimal("25.00")),
    ]
    coupon = Coupon(code="PROMO20", discount_rate=Decimal("0.20"))
    
    # Act
    total = calculate_order_total(items, coupon)
    
    # Assert
    assert total == Decimal("36.00")  # (20 + 25) * 0.80
```

```typescript
// ✅ Test avec describe/it bien structuré
describe("UserService", () => {
  describe("createUser", () => {
    it("should create a user with hashed password", async () => {
      // Arrange
      const mockRepo = { create: jest.fn().mockResolvedValue({ id: 1, email: "test@example.com" }) };
      const service = new UserService(mockRepo as any);
      
      // Act
      const user = await service.createUser({ email: "test@example.com", password: "plain123" });
      
      // Assert
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "test@example.com",
          password: expect.not.stringContaining("plain123"),  // Pas le mot de passe en clair
        })
      );
      expect(user.id).toBe(1);
    });

    it("should throw if email already exists", async () => {
      // Arrange
      const mockRepo = {
        create: jest.fn().mockRejectedValue(new UniqueConstraintError("email")),
      };
      const service = new UserService(mockRepo as any);
      
      // Act & Assert
      await expect(
        service.createUser({ email: "existing@example.com", password: "pass" })
      ).rejects.toThrow("Email déjà utilisé");
    });
  });
});
```

---

## Nommage des tests

```
# Pattern : should [action] when/given [condition]

✅ test_returns_user_when_id_exists
✅ test_raises_not_found_when_user_missing
✅ test_applies_discount_when_coupon_valid
✅ test_rejects_order_when_stock_insufficient

# TypeScript / Jest
✅ "should return 404 when user not found"
✅ "should hash password before saving"
✅ "should emit OrderCreated event after successful creation"
```

---

## Mocking — principes

```python
# ✅ Mocker les dépendances externes, pas la logique à tester
from unittest.mock import AsyncMock, patch

async def test_send_order_confirmation():
    # On mock l'envoi email (dépendance externe)
    # On teste la logique de construction de l'email
    
    mock_emailer = AsyncMock()
    service = OrderService(emailer=mock_emailer)
    
    order = Order(id=1, user_email="test@example.com", total=Decimal("99.99"))
    await service.confirm_order(order)
    
    mock_emailer.send.assert_called_once_with(
        to="test@example.com",
        subject="Confirmation commande #1",
        body=pytest.approx_contains("99.99"),
    )

# ❌ Ne pas mocker ce qu'on est en train de tester
async def test_calculate_total():
    with patch("myapp.services.order_service.calculate_total") as mock:
        mock.return_value = 100  # On mock la fonction testée... inutile
        result = await service.calculate_total(items)
```

---

## Fixtures et données de test

```python
# conftest.py — fixtures réutilisables
import pytest
from decimal import Decimal

@pytest.fixture
def sample_user():
    return User(
        id=1,
        name="Test User",
        email="test@example.com",
        role=UserRole.USER,
    )

@pytest.fixture
def sample_order(sample_user):
    return Order(
        id=1,
        user_id=sample_user.id,
        items=[
            OrderItem(product_id=1, quantity=2, unit_price=Decimal("10.00")),
        ],
        status=OrderStatus.PENDING,
    )

@pytest.fixture
def order_service(mock_repo, mock_emailer):
    return OrderService(
        repository=mock_repo,
        emailer=mock_emailer,
    )

@pytest.fixture
def mock_repo():
    return AsyncMock(spec=OrderRepository)

@pytest.fixture
def mock_emailer():
    return AsyncMock(spec=EmailService)
```

```typescript
// factories de test pour TypeScript
const createUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: "Test User",
  email: "test@example.com",
  role: "user",
  createdAt: new Date("2024-01-01"),
  ...overrides,
});

const createOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 1,
  userId: 1,
  items: [{ productId: 1, quantity: 2, unitPrice: 10 }],
  status: "pending",
  ...overrides,
});

// Usage
const adminUser = createUser({ role: "admin" });
const cancelledOrder = createOrder({ status: "cancelled" });
```

---

## Tests d'intégration API

```python
# ✅ Tests d'endpoints FastAPI avec TestClient
from fastapi.testclient import TestClient

def test_create_user_returns_201():
    client = TestClient(app)
    
    response = client.post("/api/v1/users", json={
        "name": "Paul",
        "email": "paul@example.com",
        "password": "SecurePass123!",
    })
    
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["email"] == "paul@example.com"
    assert "password" not in data["data"]  # Sécurité : pas de password en réponse

def test_create_user_returns_422_on_invalid_email():
    client = TestClient(app)
    
    response = client.post("/api/v1/users", json={
        "name": "Paul",
        "email": "not-an-email",
        "password": "SecurePass123!",
    })
    
    assert response.status_code == 422
```

---

## Ce qu'il faut toujours tester

```
✅ Happy path (cas nominal)
✅ Cas limites (liste vide, valeur à 0, string vide)
✅ Cas d'erreur (ressource manquante, input invalide, service indisponible)
✅ Sécurité (accès non autorisé, IDOR)
✅ Effets de bord (email envoyé, event publié, DB modifiée)

❌ Pas la peine de tester :
- Le framework (Next.js, FastAPI, etc.)
- Les librairies tierces
- Du code trivial sans logique (getters simples)
```

---

## Checklist tests avant commit

- [ ] Chaque nouvelle fonction de logique métier a au moins 1 test
- [ ] Happy path + au moins 1 cas d'erreur testé
- [ ] Mocks pour les dépendances externes (DB, email, API tierces)
- [ ] Noms de tests descriptifs (should X when Y)
- [ ] Pas de logique dans les tests (pas de conditions, boucles)
- [ ] Fixtures réutilisées, pas de duplication de données de test
- [ ] `pytest` / `jest --coverage` passent avec coverage > 70%
