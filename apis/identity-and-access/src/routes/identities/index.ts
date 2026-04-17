import { IAM_PERMISSIONS } from "@r6/schemas/identity-and-access";
import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireNotAdmin,
  requireNotSelf,
  requirePermission,
  requireSelfOrAdminOrTenantOwner,
  requireTenantScope,
} from "../../middleware/guard";
import { createIdentityHandler } from "./controller/create";
import { getIdentity } from "./controller/get";
import { list } from "./controller/list";
import { remove } from "./controller/remove";
import { restore } from "./controller/restore";
import { updateIdentityHandler } from "./controller/update";

const router: Router = Router({ mergeParams: true });

// All identity routes require auth. Tenant scope is applied per-route so
// that ADMIN (cross-tenant observer) can bypass it on reads but is blocked
// from writes by requireNotAdmin().
router.use(authMiddleware());

// ── Reads (Admin can read any tenant; tenant members need permission) ────────
router.get(
  "/",
  requireTenantScope(),
  requirePermission(IAM_PERMISSIONS.IDENTITY_READ),
  list,
);
router.get(
  "/:id",
  requireTenantScope(),
  requireSelfOrAdminOrTenantOwner({
    orPermission: IAM_PERMISSIONS.IDENTITY_READ,
  }),
  getIdentity,
);

// ── Writes (Admin blocked; tenant members need scope + permission) ────────────
router.post(
  "/",
  requireNotAdmin(),
  requireTenantScope(),
  requirePermission(IAM_PERMISSIONS.IDENTITY_CREATE),
  createIdentityHandler,
);
router.patch(
  "/:id",
  requireNotAdmin(),
  requireNotSelf(),
  requireTenantScope(),
  requirePermission(IAM_PERMISSIONS.IDENTITY_UPDATE),
  updateIdentityHandler,
);
router.delete(
  "/:id",
  requireNotAdmin(),
  requireNotSelf(),
  requireTenantScope(),
  requirePermission(IAM_PERMISSIONS.IDENTITY_DELETE),
  remove,
);
router.post(
  "/:id/restore",
  requireNotAdmin(),
  requireNotSelf(),
  requireTenantScope(),
  requirePermission(IAM_PERMISSIONS.IDENTITY_DELETE),
  restore,
);

export default router;
