import { verifyPassword } from "@r6/bcrypt";
import {
  createIdentity,
  getIdentityByEmail,
  getIdentityByUsername,
  getIdentityWithRolesAndPolicies,
  getTenantById,
  updateIdentity,
} from "@r6/db-identity-and-access";
import { CreateIdentitySchema } from "@r6/schemas/identity-and-access";
import { type Request, type Response, Router } from "express";
import { AppError } from "../../lib/errors";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../lib/jwt";

const router: Router = Router();

// ─── Helpers ─────────────────────────────────────────────────

// Structural types for token-claim building — avoids depending on
// Prisma model types flowing through the package boundary.
type PolicyClaim = { effect: string; permissions: string[] };
type RoleForToken = { id: string; isActive: boolean; policies: PolicyClaim[] };
type IdentityForToken = {
  id: string;
  kind: string;
  tenantId: string | null;
  roles: RoleForToken[];
};

const buildTokenClaims = (identity: IdentityForToken) => {
  const activeRoles = identity.roles.filter((r) => r.isActive);
  const roleIds = activeRoles.map((r) => r.id);
  const permissions: string[] = [
    ...new Set(
      activeRoles.flatMap((r) =>
        r.policies
          .filter((p) => p.effect === "ALLOW")
          .flatMap((p) => p.permissions),
      ),
    ),
  ];
  return { roles: roleIds, permissions };
};

const toSafeIdentity = <T extends { hash: string; salt: string }>(
  identity: T,
) => {
  const { hash, salt, ...safe } = identity;
  return safe;
};

// ─── POST /auth/register ─────────────────────────────────────

router.post("/register", async (req: Request, res: Response) => {
  const body = CreateIdentitySchema.parse(req.body);

  if (body.kind && body.kind !== "USER") {
    throw new AppError(
      400,
      "invalid_kind",
      "Only USER identities can self-register",
    );
  }

  if (!body.tenantId) {
    throw new AppError(
      400,
      "tenant_required",
      "tenantId is required for registration",
    );
  }

  const tenant = await getTenantById(body.tenantId);
  if (!tenant) throw new AppError(404, "not_found", "Tenant not found");
  if (!tenant.isActive)
    throw new AppError(403, "tenant_inactive", "Tenant is not active");

  const identity = await createIdentity({
    tenantId: body.tenantId,
    username: body.username,
    email: body.email ?? null,
    password: body.plainPassword,
    kind: "USER",
    mustChangePassword: false,
  });

  await updateIdentity(identity.id, { status: "ACTIVE" });

  const full = await getIdentityWithRolesAndPolicies(identity.id);
  if (!full)
    throw new AppError(
      500,
      "internal",
      "Failed to load identity after creation",
    );

  const claims = buildTokenClaims(full);
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({
      sub: full.id,
      kind: full.kind,
      tenantId: full.tenantId,
      roles: claims.roles,
      permissions: claims.permissions,
    }),
    signRefreshToken(full.id),
  ]);

  return res
    .status(201)
    .json({ identity: toSafeIdentity(full), accessToken, refreshToken });
});

// ─── POST /auth/login ────────────────────────────────────────

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000; // 15 minutes

router.post("/login", async (req: Request, res: Response) => {
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password: string;
  };

  if (!password)
    throw new AppError(400, "validation_error", "password is required");
  if (!username && !email) {
    throw new AppError(
      400,
      "validation_error",
      "username or email is required",
    );
  }

  // We need tenantId for scoped lookups — for ADMIN accounts tenantId is null
  const tenantId: string | null =
    (req.body as { tenantId?: string }).tenantId ?? null;

  const identity = username
    ? await getIdentityByUsername(tenantId, username)
    : await getIdentityByEmail(tenantId, email as string);

  if (!identity)
    throw new AppError(401, "invalid_credentials", "Invalid credentials");

  // Check account lock
  if (identity.lockedUntil && identity.lockedUntil > new Date()) {
    throw new AppError(
      423,
      "account_locked",
      "Account is temporarily locked due to too many failed login attempts",
    );
  }

  if (identity.status !== "ACTIVE") {
    throw new AppError(
      403,
      "account_inactive",
      `Account status is ${identity.status}`,
    );
  }

  const valid = await verifyPassword(password, identity.hash);

  if (!valid) {
    const newAttempts = identity.failedLoginAttempts + 1;
    const lock = newAttempts >= LOGIN_MAX_ATTEMPTS;
    await updateIdentity(identity.id, {
      failedLoginAttempts: newAttempts,
      lockedUntil: lock ? new Date(Date.now() + LOGIN_LOCK_MS) : undefined,
    });
    throw new AppError(401, "invalid_credentials", "Invalid credentials");
  }

  // Reset on success
  await updateIdentity(identity.id, {
    failedLoginAttempts: 0,
    lockedUntil: null,
  });

  const full = await getIdentityWithRolesAndPolicies(identity.id);
  if (!full) throw new AppError(500, "internal", "Failed to load identity");

  const claims = buildTokenClaims(full);
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({
      sub: full.id,
      kind: full.kind,
      tenantId: full.tenantId,
      roles: claims.roles,
      permissions: claims.permissions,
    }),
    signRefreshToken(full.id),
  ]);

  return res
    .status(200)
    .json({ identity: toSafeIdentity(full), accessToken, refreshToken });
});

// ─── POST /auth/refresh ──────────────────────────────────────

router.post("/refresh", async (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };
  if (!token) throw new AppError(400, "validation_error", "token is required");

  const payload = await verifyRefreshToken(token).catch(() => {
    throw new AppError(
      401,
      "invalid_token",
      "Invalid or expired refresh token",
    );
  });

  if ((payload as Record<string, unknown>).tokenType !== "refresh") {
    throw new AppError(401, "invalid_token", "Invalid token type");
  }

  if (typeof payload.sub !== "string") {
    throw new AppError(401, "invalid_token", "Token subject missing");
  }

  const full = await getIdentityWithRolesAndPolicies(payload.sub);
  if (!full) throw new AppError(401, "invalid_token", "Identity not found");
  if (full.status !== "ACTIVE") {
    throw new AppError(
      403,
      "account_inactive",
      `Account status is ${full.status}`,
    );
  }

  const claims = buildTokenClaims(full);
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({
      sub: full.id,
      kind: full.kind,
      tenantId: full.tenantId,
      roles: claims.roles,
      permissions: claims.permissions,
    }),
    signRefreshToken(full.id),
  ]);

  return res.status(200).json({ accessToken, refreshToken });
});

// ─── POST /auth/logout ───────────────────────────────────────

router.post("/logout", (_req: Request, res: Response) => {
  return res.status(200).json({ message: "Logged out successfully" });
});

export default router;
