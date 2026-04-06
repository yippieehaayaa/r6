import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireNotAdmin,
  requireNotSelf,
  requirePermission,
  requireSelfOrAdminOrTenantOwner,
  requireTenantScope,
} from "../../middleware/guard";
import { assignRole } from "./controller/assign-role";
import { createIdentityHandler } from "./controller/create";
import { getIdentity } from "./controller/get";
import { list } from "./controller/list";
import { remove } from "./controller/remove";
import { removeRole } from "./controller/remove-role";
import { restore } from "./controller/restore";
import { setRoles } from "./controller/set-roles";
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
  requirePermission("iam:identity:read"),
  list,
);
router.get(
  "/:id",
  requireTenantScope(),
  requireSelfOrAdminOrTenantOwner({ orPermission: "iam:identity:read" }),
  getIdentity,
);

// ── Writes (Admin blocked; tenant members need scope + permission) ────────────
router.post(
  "/",
  requireNotAdmin(),
  requireTenantScope(),
  requirePermission("iam:identity:create"),
  createIdentityHandler,
);
router.patch(
  "/:id",
  requireNotAdmin(),
  requireNotSelf(),
  requireTenantScope(),
  requirePermission("iam:identity:update"),
  updateIdentityHandler,
);
router.delete(
  "/:id",
  requireNotAdmin(),
  requireNotSelf(),
  requireTenantScope(),
  requirePermission("iam:identity:delete"),
  remove,
);
router.post(
  "/:id/restore",
  requireNotAdmin(),
  requireNotSelf(),
  requireTenantScope(),
  requirePermission("iam:identity:delete"),
  restore,
);

// ── Role assignments (writes — admin blocked) ─────────────────────────────────
router.post(
  "/:id/roles",
  requireNotAdmin(),
  requireNotSelf(),
  requireTenantScope(),
  requirePermission("iam:identity:update"),
  assignRole,
);
router.delete(
  "/:id/roles/:roleId",
  requireNotAdmin(),
  requireNotSelf(),
  requireTenantScope(),
  requirePermission("iam:identity:update"),
  removeRole,
);
router.put(
  "/:id/roles",
  requireNotAdmin(),
  requireNotSelf(),
  requireTenantScope(),
  requirePermission("iam:identity:update"),
  setRoles,
);

export default router;
