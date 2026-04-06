import { IAM_PERMISSIONS } from "@r6/schemas/identity-and-access";
import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireNotAdmin,
  requirePermission,
  requireTenantScope,
} from "../../middleware/guard";
import { attachPolicy } from "./controller/attach-policy";
import { createRoleHandler } from "./controller/create";
import { detachPolicy } from "./controller/detach-policy";
import { getRole } from "./controller/get";
import { list } from "./controller/list";
import { remove } from "./controller/remove";
import { restore } from "./controller/restore";
import { setPolicies } from "./controller/set-policies";
import { updateRoleHandler } from "./controller/update";

const router: Router = Router({ mergeParams: true });

router.use(authMiddleware(), requireTenantScope());

// ── Reads (Admin reads are allowed; permission check is sufficient) ──────────
router.get("/", requirePermission(IAM_PERMISSIONS.ROLE_READ), list);
router.get("/:id", requirePermission(IAM_PERMISSIONS.ROLE_READ), getRole);

// ── Writes (Admin blocked — only tenant-admin may mutate roles) ──────────────
router.post(
  "/",
  requireNotAdmin(),
  requirePermission(IAM_PERMISSIONS.ROLE_CREATE),
  createRoleHandler,
);
router.patch(
  "/:id",
  requireNotAdmin(),
  requirePermission(IAM_PERMISSIONS.ROLE_UPDATE),
  updateRoleHandler,
);
router.delete(
  "/:id",
  requireNotAdmin(),
  requirePermission(IAM_PERMISSIONS.ROLE_DELETE),
  remove,
);

// Restore is a write — tenant-admin (has role:delete) may restore soft-deleted roles.
router.post(
  "/:id/restore",
  requireNotAdmin(),
  requirePermission(IAM_PERMISSIONS.ROLE_DELETE),
  restore,
);

// Policy attachment — tenant-admin only (has role:update). Admin and tenant-owner blocked.
router.post(
  "/:id/policies",
  requireNotAdmin(),
  requirePermission(IAM_PERMISSIONS.ROLE_UPDATE),
  attachPolicy,
);
router.delete(
  "/:id/policies/:policyId",
  requireNotAdmin(),
  requirePermission(IAM_PERMISSIONS.ROLE_UPDATE),
  detachPolicy,
);
router.put(
  "/:id/policies",
  requireNotAdmin(),
  requirePermission(IAM_PERMISSIONS.ROLE_UPDATE),
  setPolicies,
);

export default router;
