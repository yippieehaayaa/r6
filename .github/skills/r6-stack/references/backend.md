# Backend Patterns — Express 5 + Zod + Prisma

## App Bootstrap (`src/app.ts`)

```typescript
const app: Express = express();
app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.use(errorHandler);  // MUST be last
```

## Route Registration (`src/routes/index.ts`)

Mount at `/` (public) or behind `authMiddleware()` (protected):

```typescript
// Public
router.use("/", main);
router.use("/auth", auth);
router.use("/.well-known", wellKnown);

// Authenticated — authMiddleware applied once at mount point
router.use("/me", authMiddleware(), me);
router.use("/tenants", authMiddleware(), tenants);
```

Feature routers can add per-route guards on top:

```typescript
// policies/index.ts
router.use(authMiddleware());                          // defense-in-depth
router.get("/", requirePermission("iam:policy:read"), list);
router.post("/", requireAdmin(), createPolicyHandler);
router.patch("/:id", requireAdmin(), updatePolicyHandler);
router.delete("/:id", requireAdmin(), remove);
router.post("/:id/restore", requireAdmin(), restore);
```

## Controller Pattern

Each verb lives in its own file: `controller/list.ts`, `controller/create.ts`, etc.
Always wrap in try/catch and forward errors to `next`.

```typescript
export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page  = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
    const result = await myService.list({ page, limit });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
```

## Validation Middleware (`shared/middleware/validate.ts`)

```typescript
// Body validation
router.post("/", validate(createCategorySchema), async (req, res) => {
  const category = await service.create(req.body);  // body already typed after parse
  res.status(201).json(category);
});

// Query-string validation
router.get("/", validateQuery(listQuerySchema), handler);
```

Both middlewares call `schema.parse(...)` and let the ZodError bubble to `errorHandler`.

## Auth Middleware (`middleware/auth/index.ts`)

```typescript
authMiddleware()  // factory — always call as a function
// Reads Authorization: Bearer <token>
// Verifies with jose, checks denylist, sets req.jwtPayload
```

`req.jwtPayload` type (extend in `express.d.ts`):
```typescript
type AuthJwtPayload = JWTPayload & {
  kind?: string;
  tenantSlug?: string | null;
  roles?: string[];
  permissions?: string[];
};
```

## Authorization Guards (`middleware/guard/index.ts`)

All guards assume `authMiddleware()` ran first. Compose AFTER it.

| Guard | When to use |
|---|---|
| `requireAdmin()` | ADMIN-only write operations |
| `requireAdminOrTenantOwner()` | Tenant management by owner or platform admin |
| `requireTenantScope()` | Enforce JWT tenantSlug === route `:tenantSlug` |
| `requirePermission("svc:res:act")` | Fine-grained permission check; ADMIN bypasses |
| `requireNotAdmin()` | Block ADMIN from actions that don't apply to them |
| `requireSelfOrAdminOrTenantOwner()` | User acting on own resource |
| `requireNotTargetingElevatedIdentity()` | Prevent escalation attacks |

## Error Classes

**IAM** (`lib/errors.ts`):
```typescript
throw new AppError(400, "validation_error", "password is required");
throw new AppError(401, "unauthorized", "Invalid or expired token");
throw new AppError(403, "forbidden", "Administrator privileges required");
throw new AppError(404, "not_found", "Identity not found");
```

**Inventory** (`shared/errors.ts`):
```typescript
throw new DomainError(404, "PRODUCT_NOT_FOUND", "Product not found");
```

## Error Response Format

```json
{ "error": { "message": "…", "code": "snake_case_code" } }
// ZodError adds:
{ "error": { "message": "Validation failed", "code": "VALIDATION_ERROR",
             "details": [{ "path": "name", "message": "Required" }] } }
```

## Layers: Controller → Service → Repository

```
routes/feature/
├── index.ts          Route registration + guard composition
└── controller/
    ├── list.ts
    ├── create.ts
    ├── get.ts
    ├── update.ts
    ├── remove.ts
    └── restore.ts

modules/feature/
├── feature.controller.ts  (Inventory style — inline router)
├── feature.service.ts     (thin facade, delegates to repo)
├── feature.repository.ts  (Prisma queries)
└── feature.validator.ts   (Zod schemas)
```

IAM uses the `routes/controller/` split. Inventory uses the `modules/` co-location style. Match the convention of the service you're extending.

## Rate Limiting (auth routes)

```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});
router.post("/login", authLimiter, login);
```

## Pagination Convention

API always returns:
```typescript
{ data: T[]; page: number; limit: number; total: number }
```

Query params: `?page=1&limit=20`. Clamp: `page ≥ 1`, `limit` between 1–100 (default 20).

## Permission String Convention

`service:resource:action` — e.g.:
- `iam:identity:create`
- `iam:policy:read`
- `inventory:product:update`

Wildcards: `iam:identity:*` (all identity actions), `iam:*` (all IAM).
ADMIN identities bypass `requirePermission` entirely.
