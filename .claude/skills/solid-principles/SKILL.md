---
name: solid-principles
description: >
  Principes SOLID de conception orientée objet. Charger automatiquement quand :
  création ou refactoring de classes, conception d'architecture, discussion de
  couplage/cohésion, review de code orienté objet, design patterns.
---

# SOLID Principles — Guide d'application

## S — Single Responsibility Principle

**Règle :** Une classe/fonction = une seule raison de changer.

**Signal d'alerte :** La description de la classe utilise "ET" ou "AUSSI".
- ❌ `UserService` qui gère l'auth ET envoie des emails ET écrit dans les logs
- ✅ `UserAuthService`, `UserEmailService`, `UserLogger` séparés

**En pratique :**
```python
# ❌ Trop de responsabilités
class UserService:
    def create_user(self, data): ...
    def send_welcome_email(self, user): ...  # ← responsabilité Email
    def log_creation(self, user): ...        # ← responsabilité Logging
    def hash_password(self, pwd): ...        # ← responsabilité Crypto

# ✅ Responsabilité unique
class UserRepository:
    def create(self, data: UserCreate) -> User: ...
    def find_by_email(self, email: str) -> User | None: ...

class UserEmailService:
    def send_welcome(self, user: User) -> None: ...

class PasswordHasher:
    def hash(self, plain: str) -> str: ...
    def verify(self, plain: str, hashed: str) -> bool: ...
```

```typescript
// ❌ Classe fourre-tout
class OrderService {
  createOrder(data: OrderData) { ... }
  calculateTax(order: Order) { ... }      // ← responsabilité Tax
  sendConfirmationEmail(order: Order) {... } // ← responsabilité Email
  generatePDF(order: Order) { ... }       // ← responsabilité Document
}

// ✅ Séparation claire
class OrderRepository { ... }
class TaxCalculator { ... }
class OrderEmailer { ... }
class OrderPDFGenerator { ... }
```

---

## O — Open/Closed Principle

**Règle :** Ouvert à l'extension, fermé à la modification. Ajouter des comportements sans modifier le code existant.

**Signal d'alerte :** Un `if/elif/switch` qui grandit à chaque nouveau type.

```python
# ❌ Modifier à chaque nouveau format
class ReportExporter:
    def export(self, report, format: str):
        if format == "pdf":
            return self._to_pdf(report)
        elif format == "csv":
            return self._to_csv(report)
        elif format == "excel":  # ← modification nécessaire à chaque fois
            return self._to_excel(report)

# ✅ Extension sans modification
from abc import ABC, abstractmethod

class ReportExporter(ABC):
    @abstractmethod
    def export(self, report: Report) -> bytes: ...

class PDFExporter(ReportExporter):
    def export(self, report: Report) -> bytes: ...

class CSVExporter(ReportExporter):
    def export(self, report: Report) -> bytes: ...

# Nouveau format = nouvelle classe, rien à modifier
class ExcelExporter(ReportExporter):
    def export(self, report: Report) -> bytes: ...
```

---

## L — Liskov Substitution Principle

**Règle :** Un sous-type doit pouvoir remplacer son type parent sans casser le comportement.

**Signal d'alerte :** Un `isinstance()` check dans du code qui utilise une abstraction, ou une méthode qui `raise NotImplementedError`.

```python
# ❌ Violation : Rectangle/Square classique
class Rectangle:
    def set_width(self, w): self.width = w
    def set_height(self, h): self.height = h
    def area(self): return self.width * self.height

class Square(Rectangle):
    def set_width(self, w):      # ← Brise le contrat parent
        self.width = w
        self.height = w          # Comportement inattendu

# ✅ Modéliser correctement
class Shape(ABC):
    @abstractmethod
    def area(self) -> float: ...

class Rectangle(Shape):
    def __init__(self, width: float, height: float): ...
    def area(self) -> float: return self.width * self.height

class Square(Shape):
    def __init__(self, side: float): ...
    def area(self) -> float: return self.side ** 2
```

---

## I — Interface Segregation Principle

**Règle :** Des interfaces petites et spécifiques valent mieux qu'une grosse interface générale. Un client ne doit pas dépendre de méthodes qu'il n'utilise pas.

```python
# ❌ Interface trop large
class Animal(ABC):
    @abstractmethod
    def eat(self): ...
    @abstractmethod
    def fly(self): ...    # Les chiens ne volent pas
    @abstractmethod
    def swim(self): ...   # Les aigles ne nagent pas

# ✅ Interfaces ciblées
class Eatable(ABC):
    @abstractmethod
    def eat(self): ...

class Flyable(ABC):
    @abstractmethod
    def fly(self): ...

class Swimmable(ABC):
    @abstractmethod
    def swim(self): ...

class Duck(Eatable, Flyable, Swimmable): ...
class Dog(Eatable, Swimmable): ...
class Eagle(Eatable, Flyable): ...
```

```typescript
// ❌ Interface monolithique
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
}

// ✅ Interfaces ségrégées
interface Workable { work(): void; }
interface Eatable { eat(): void; }
interface Sleepable { sleep(): void; }

class HumanWorker implements Workable, Eatable, Sleepable { ... }
class RobotWorker implements Workable { ... }  // robots ne mangent pas
```

---

## D — Dependency Inversion Principle

**Règle :** Dépendre des abstractions, pas des implémentations concrètes. Injecter les dépendances.

**Signal d'alerte :** `new ConcreteClass()` à l'intérieur d'une classe, imports directs de modules bas niveau dans des modules haut niveau.

```python
# ❌ Couplage fort — impossible à tester
class OrderService:
    def __init__(self):
        self.db = PostgreSQLDatabase()    # ← dépendance concrète
        self.emailer = SMTPEmailer()       # ← dépendance concrète
        self.logger = FileLogger()         # ← dépendance concrète

# ✅ Injection de dépendances — testable
class OrderService:
    def __init__(
        self,
        repository: OrderRepository,       # ← abstraction
        emailer: EmailService,             # ← abstraction
        logger: Logger,                    # ← abstraction
    ):
        self.repository = repository
        self.emailer = emailer
        self.logger = logger

# Usage (composition root / DI container)
service = OrderService(
    repository=PostgreSQLOrderRepository(db),
    emailer=SMTPEmailer(config),
    logger=StructuredLogger(),
)

# Test
service = OrderService(
    repository=InMemoryOrderRepository(),
    emailer=MockEmailer(),
    logger=NullLogger(),
)
```

```typescript
// ✅ Avec interfaces TypeScript
interface PaymentGateway {
  charge(amount: number, token: string): Promise<ChargeResult>;
}

class OrderService {
  constructor(
    private readonly payment: PaymentGateway,  // ← interface, pas classe concrète
    private readonly repo: OrderRepository,
  ) {}
}

// Production
new OrderService(new StripeGateway(config), new PrismaOrderRepo(db));
// Test
new OrderService(new MockPaymentGateway(), new InMemoryOrderRepo());
```

---

## Checklist SOLID avant tout commit

- [ ] Chaque classe a une seule raison de changer (S)
- [ ] Ajouter un comportement ne nécessite pas de modifier du code existant (O)
- [ ] Les sous-classes peuvent remplacer les parents sans surprise (L)
- [ ] Les interfaces sont petites et ciblées, aucune méthode "vide" (I)
- [ ] Les dépendances sont injectées, pas instanciées en dur (D)
- [ ] Les dépendances sont des abstractions (interfaces/ABC), pas des classes concrètes (D)

---

## Patterns SOLID fréquents à préférer

| Situation | Pattern |
|---|---|
| Comportements variables | Strategy Pattern |
| Création d'objets complexes | Factory / Builder |
| Notifications entre composants | Observer / Event Emitter |
| Accès à une ressource | Repository Pattern |
| Décoration de comportement | Decorator Pattern |
| Interface simplifiée | Facade Pattern |
