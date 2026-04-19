import { Router } from "express";
import type { AuthJwtPayload } from "../../../middleware/auth";
import { requirePermission } from "../../../middleware/guard";
import { assertTenantAccess, resolveParam } from "../helpers";
import { listPoliciesHandler } from "./controller/queries/list";

// Sub-router mounted at /tenants/:tenantId/policies via the tenants router.
// mergeParams: true is required so that :tenantId from the parent route is
// accessible within this router via req.params.tenantId.
const router: Router = Router({ mergeParams: true });

// Tenant scope guard — applied to every policy route.
// Only identities whose JWT tenantId matches the URL :tenantId may proceed.
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

// GET /tenants/:tenantId/policies
//   Lists policies belonging to this tenant (paginated).
//   Optional filters: search, isManaged.
//   Requires: iam:policy:read
router.get("/", requirePermission("iam:policy:read"), listPoliciesHandler);

export default router;
