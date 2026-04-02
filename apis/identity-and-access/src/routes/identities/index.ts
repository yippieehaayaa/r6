import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireAdmin,
  requirePermission,
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
  requirePermission("iam:identity:create"),
  createIdentityHandler,
);
router.get("/", requirePermission("iam:identity:read"), list);
router.get("/:id", requirePermission("iam:identity:read"), getIdentity);
router.patch(
  "/:id",
  requirePermission("iam:identity:update"),
  updateIdentityHandler,
);
router.delete("/:id", requirePermission("iam:identity:delete"), remove);
router.post("/:id/restore", requireAdmin(), restore);
router.post("/:id/roles", requirePermission("iam:identity:update"), assignRole);
router.delete(
  "/:id/roles/:roleId",
  requirePermission("iam:identity:update"),
  removeRole,
);
router.put("/:id/roles", requirePermission("iam:identity:update"), setRoles);

export default router;
