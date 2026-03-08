---
name: security
description: >
  Sécurité applicative : authentification, autorisation, validation des inputs,
  protection des données, secrets. Charger automatiquement pour tout ce qui
  touche à l'auth, les inputs utilisateur, les données sensibles, les secrets,
  les permissions, ou lors de reviews de sécurité.
---

# Sécurité — Standards non-négociables

## Règle absolue #1 — Jamais faire confiance aux inputs

**Tout input externe est hostile par défaut.** Valider et sanitiser systématiquement.

```python
# ❌ Faire confiance à l'input
def get_user(user_id: str):
    query = f"SELECT * FROM users WHERE id = {user_id}"  # SQL Injection
    return db.execute(query)

def get_file(filename: str):
    return open(f"/var/files/{filename}")  # Path Traversal

# ✅ Paramétrer les requêtes SQL
def get_user(user_id: int):
    return db.execute(
        "SELECT * FROM users WHERE id = :id",
        {"id": user_id}
    )

# ✅ Valider et sanitiser les chemins
import os

def get_file(filename: str) -> bytes:
    safe_name = os.path.basename(filename)  # Retire les ../
    full_path = os.path.join(BASE_DIR, safe_name)
    
    # Vérifier que le chemin reste dans BASE_DIR
    if not full_path.startswith(BASE_DIR):
        raise SecurityError("Chemin non autorisé")
    
    with open(full_path, "rb") as f:
        return f.read()
```

```typescript
// ✅ Zod pour validation stricte
const userInputSchema = z.object({
  name: z.string().trim().min(1).max(100)
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Nom invalide"),  // Pas d'injection HTML
  email: z.string().email().toLowerCase(),
  message: z.string().max(5000),
});
```

---

## Authentification — JWT et sessions

```typescript
// ❌ Token JWT sans expiration
const token = jwt.sign({ userId: user.id }, SECRET);

// ❌ Secret faible ou en dur
const SECRET = "password123";

// ✅ Token avec expiration courte + refresh token
const accessToken = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" }   // Courte durée de vie
);

const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_REFRESH_SECRET!,
  { expiresIn: "7d" }
);

// ✅ Vérification sécurisée
function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token expiré");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Token invalide");
    }
    throw error;
  }
}
```

```python
# ✅ Hachage de mots de passe
import bcrypt

def hash_password(plain: str) -> str:
    salt = bcrypt.gensalt(rounds=12)  # rounds=12 minimum
    return bcrypt.hashpw(plain.encode(), salt).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())

# ❌ Ne JAMAIS utiliser md5, sha1, sha256 pour les mots de passe
# ❌ Ne JAMAIS stocker les mots de passe en clair
```

---

## Autorisation — vérifier les permissions

```python
# ❌ Autorisation insuffisante — IDOR (Insecure Direct Object Reference)
@router.get("/orders/{order_id}")
async def get_order(order_id: int, current_user: User = Depends(get_current_user)):
    order = await order_repo.get(order_id)  # N'importe qui peut voir n'importe quelle commande
    return order

# ✅ Vérifier que la ressource appartient à l'utilisateur
@router.get("/orders/{order_id}")
async def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user)
):
    order = await order_repo.get(order_id)
    
    if not order:
        raise HTTPException(status_code=404, detail="Commande introuvable")
    
    # Vérification de propriété
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    return order
```

---

## Secrets — gestion sécurisée

```python
# ❌ Jamais en dur dans le code
STRIPE_KEY = "sk_live_xxxxxxxxxxxxxxxx"
DATABASE_URL = "postgresql://user:password@host/db"

# ❌ Jamais dans les logs
logger.info(f"Connexion avec clé: {api_key}")

# ✅ Variables d'environnement uniquement
from pydantic_settings import BaseSettings
from pydantic import SecretStr

class Settings(BaseSettings):
    stripe_secret_key: SecretStr         # SecretStr masque dans les logs
    database_url: SecretStr
    jwt_secret: SecretStr
    
    model_config = {"env_file": ".env"}

settings = Settings()

# Usage sécurisé
stripe.api_key = settings.stripe_secret_key.get_secret_value()

# ✅ Masquer dans les logs
logger.info("Stripe configuré", extra={"key_prefix": "sk_live_****"})
```

**Règles des secrets :**
- `.env` dans `.gitignore` — toujours
- `.env.example` commité avec les clés (sans valeurs)
- Rotation des secrets si exposition accidentelle
- Utiliser un gestionnaire de secrets en production (AWS Secrets Manager, Vault)

---

## CORS — configuration correcte

```typescript
// ❌ CORS trop permissif
app.use(cors({ origin: "*" }));

// ✅ CORS restreint
const allowedOrigins = [
  process.env.FRONTEND_URL!,
  "https://monapp.com",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS non autorisé"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

---

## Rate limiting

```typescript
// ✅ Rate limiting sur toutes les routes sensibles
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                      // 5 tentatives
  message: { error: "Trop de tentatives, réessayer dans 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/auth/login", authLimiter, loginHandler);
app.post("/auth/register", authLimiter, registerHandler);

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 100,
});

app.use("/api/", apiLimiter);
```

---

## Headers de sécurité HTTP

```typescript
// ✅ Helmet.js pour Node.js (ou équivalent)
import helmet from "helmet";

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-xxx'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));
```

---

## Données sensibles — ce qu'on ne retourne jamais

```python
# ❌ Retourner des données sensibles
return user  # Inclut password_hash, internal_id, etc.

# ✅ DTO explicite — seulement ce qui est nécessaire
class UserPublicResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    
    model_config = {"from_attributes": True}

# Jamais dans les réponses API :
# - password / password_hash / salt
# - tokens internes
# - clés API
# - données de paiement complètes (PAN, CVV)
# - informations personnelles non nécessaires
```

---

## Checklist sécurité avant tout déploiement

- [ ] Tous les inputs validés (Zod/Pydantic) avant utilisation
- [ ] Requêtes SQL paramétrées — 0 concaténation de chaînes SQL
- [ ] Mots de passe hachés avec bcrypt (rounds ≥ 12)
- [ ] Tokens JWT avec expiration courte (≤ 15-30 min)
- [ ] Vérification de propriété sur toutes les ressources (anti-IDOR)
- [ ] 0 secret hardcodé — tout en variables d'environnement
- [ ] `.env` dans `.gitignore`
- [ ] Rate limiting sur auth et endpoints sensibles
- [ ] CORS restreint aux origines connues
- [ ] Réponses API sans données sensibles (password, tokens)
- [ ] Headers de sécurité HTTP (Helmet ou équivalent)
