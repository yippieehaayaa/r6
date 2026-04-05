import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireAdmin,
  requireAdminOrTenantOwner,
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
router.post("/", requirePermission("iam:role:create"), createRoleHandler);
router.get("/", requirePermission("iam:role:read"), list);
router.get("/:id", requirePermission("iam:role:read"), getRole);
router.patch("/:id", requirePermission("iam:role:update"), updateRoleHandler);
router.delete("/:id", requirePermission("iam:role:delete"), remove);
router.post("/:id/restore", requireAdmin(), restore);
// Tenant-Owner/Tenant-Admin may manage role-policy assignments, but the
// attach and set-policies controllers enforce module-scope validation so
// they can only assign policies within their availed services.
router.post("/:id/policies", requireAdminOrTenantOwner(), attachPolicy);
router.delete(
  "/:id/policies/:policyId",
  requireAdminOrTenantOwner(),
  detachPolicy,
);
router.put("/:id/policies", requireAdminOrTenantOwner(), setPolicies);

export default router;
