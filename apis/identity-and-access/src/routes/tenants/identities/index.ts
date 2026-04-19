import { Router } from "express";
import type { AuthJwtPayload } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/guard";
import { assertTenantAccess, resolveParam } from "../helpers";
import { assignPolicyHandler } from "./controller/mutations/assign-policy";
import { createIdentityHandler } from "./controller/mutations/create";
import { removeIdentityHandler } from "./controller/mutations/remove";
import { removePolicyHandler } from "./controller/mutations/remove-policy";
import { restoreIdentityHandler } from "./controller/mutations/restore";
import { setPoliciesHandler } from "./controller/mutations/set-policies";
import { updateIdentityHandler } from "./controller/mutations/update";
import { getIdentityHandler } from "./controller/queries/get";
import { listIdentitiesHandler } from "./controller/queries/list";

// Sub-router mounted at /tenants/:tenantId/identities via the tenants router.
// mergeParams: true is required so that :tenantId from the parent route is
// accessible within this router via req.params.tenantId.
const router: Router = Router({ mergeParams: true });

// Tenant scope guard — applied to every identity management route.
// Only identities whose JWT tenantId matches the URL :tenantId may proceed.
// This is the first line of defence; permission checks follow per-route.
router.use((req, res, next) => {
  const payload = req.jwtPayload as AuthJwtPayload;
  const tenantId = resolveParam(req, "tenantId");

  if (!tenantId) {
    res.status(400).json({
      error: { code: "validation_error", message: "Tenant ID is required" },
    });
    return;
  }

  try {
    assertTenantAccess(payload, tenantId);
    next();
  } catch (err) {
    next(err);
  }
});

// ── Queries (GET) ────────────────────────────────────────────────────────────

// GET /tenants/:tenantId/identities
//   Lists identities belonging to this tenant (paginated).
//   Optional filters: search, status, kind.
//   Requires: iam:identity:read
router.get("/", requirePermission("iam:identity:read"), listIdentitiesHandler);

// GET /tenants/:tenantId/identities/:id
//   Fetches a single identity by ID within this tenant.
//   Requires: iam:identity:read
router.get("/:id", requirePermission("iam:identity:read"), getIdentityHandler);

// ── Mutations (POST / PATCH / DELETE) ────────────────────────────────────────

// POST /tenants/:tenantId/identities
//   Creates a new identity within this tenant (activated immediately).
//   Requires: iam:identity:create
router.post(
  "/",
  requirePermission("iam:identity:create"),
  createIdentityHandler,
);

// PATCH /tenants/:tenantId/identities/:id
//   Updates an identity's profile fields (name, country, etc.).
//   Enforces tier-based write protection.
//   Requires: iam:identity:update
router.patch(
  "/:id",
  requirePermission("iam:identity:update"),
  updateIdentityHandler,
);

// DELETE /tenants/:tenantId/identities/:id
//   Soft-deletes an identity within this tenant.
//   Enforces tier-based write protection.
//   Requires: iam:identity:delete
router.delete(
  "/:id",
  requirePermission("iam:identity:delete"),
  removeIdentityHandler,
);

// POST /tenants/:tenantId/identities/:id/restore
//   Restores a soft-deleted identity.
//   Requires: iam:identity:restore
router.post(
  "/:id/restore",
  requirePermission("iam:identity:restore"),
  restoreIdentityHandler,
);

// ── Policy assignment (replaces role routes) ─────────────────────────────────
// Routes are named /:id/roles for URL compatibility but operate on policies.
// Assigning a policy stamps its permissions[] as IdentityPermission ALLOW rows.

// POST /tenants/:tenantId/identities/:id/roles
//   Assigns a policy to an identity by policyId in the request body.
//   Requires: iam:role:assign
router.post(
  "/:id/roles",
  requirePermission("iam:role:assign"),
  assignPolicyHandler,
);

// DELETE /tenants/:tenantId/identities/:id/roles/:roleId
//   Removes a policy (by policyId = :roleId) from an identity.
//   Requires: iam:role:assign
router.delete(
  "/:id/roles/:roleId",
  requirePermission("iam:role:assign"),
  removePolicyHandler,
);

// PUT /tenants/:tenantId/identities/:id/roles
//   Replaces all policy assignments on an identity atomically.
//   Requires: iam:role:assign
router.put(
  "/:id/roles",
  requirePermission("iam:role:assign"),
  setPoliciesHandler,
);

export default router;
