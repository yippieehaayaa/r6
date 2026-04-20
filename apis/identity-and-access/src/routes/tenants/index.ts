import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middleware/auth";
import { requirePermission } from "../../middleware/guard";
import { createTenant } from "./controller/mutations/create";
import { invite } from "./controller/mutations/invite";
import { listInvitationsHandler } from "./controller/queries/list-invitations";
import identities from "./identities";
import policies from "./policies";

const router: Router = Router();

// Defense-in-depth — authMiddleware is also applied at the mount point in routes/index.ts.
router.use(authMiddleware());

// Moderate rate limit on invitation sends to prevent spam.
const inviteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /tenants
//   Creates a new tenant with the caller as the owner.
//   Only authenticated identities that do not already belong to a tenant may call this.
router.post("/", createTenant);

// POST /tenants/:tenantId/invitations
//   Sends an invitation email to an address to join this tenant.
//   Caller must belong to the tenant and hold iam:invitation:create.
router.post(
  "/:tenantId/invitations",
  inviteLimiter,
  requirePermission("iam:invitation:create"),
  invite,
);

// GET /tenants/:tenantId/invitations
//   Lists pending (or all) invitations for this tenant.
//   Caller must belong to the tenant and hold iam:invitation:read.
router.get(
  "/:tenantId/invitations",
  requirePermission("iam:invitation:read"),
  listInvitationsHandler,
);

// /tenants/:tenantId/identities — privileged identity management.
// Tenant scope + per-route permission checks are enforced inside the sub-router.
router.use("/:tenantId/identities", identities);

// /tenants/:tenantId/policies — policy listing.
// Tenant scope + permission checks are enforced inside the sub-router.
router.use("/:tenantId/policies", policies);

export default router;
