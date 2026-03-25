import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { requireAdmin, requireTenantScope } from "../../middleware/guard";
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
router.post("/", createIdentityHandler);
router.get("/", list);
router.get("/:id", getIdentity);
router.patch("/:id", updateIdentityHandler);
router.delete("/:id", remove);
router.post("/:id/restore", requireAdmin(), restore);
router.post("/:id/roles", assignRole);
router.delete("/:id/roles/:roleId", removeRole);
router.put("/:id/roles", setRoles);

export default router;
