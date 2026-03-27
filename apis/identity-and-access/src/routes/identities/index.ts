import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireAdmin,
  requireAdminOrTenantOwner,
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

router.use(authMiddleware(), requireTenantScope());
router.post(
  "/",
  requireAdminOrTenantOwner(),
  requirePermission("iam:identity:create"),
  createIdentityHandler,
);
router.get("/", requireAdminOrTenantOwner(), list);
router.get("/:id", requireSelfOrAdminOrTenantOwner(), getIdentity);
router.patch("/:id", requireSelfOrAdminOrTenantOwner(), updateIdentityHandler);
router.delete("/:id", requireAdminOrTenantOwner(), remove);
router.post("/:id/restore", requireAdmin(), restore);
router.post("/:id/roles", requireAdminOrTenantOwner(), assignRole);
router.delete("/:id/roles/:roleId", requireAdminOrTenantOwner(), removeRole);
router.put("/:id/roles", requireAdminOrTenantOwner(), setRoles);

export default router;
