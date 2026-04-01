import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { requireAdmin, requireAdminOrTenantOwner } from "../../middleware/guard";
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

router.use(authMiddleware());

router.post("/", requireAdminOrTenantOwner(), createRoleHandler);
router.get("/", requireAdminOrTenantOwner(), list);
router.get("/:id", requireAdminOrTenantOwner(), getRole);
router.patch("/:id", requireAdminOrTenantOwner(), updateRoleHandler);
router.delete("/:id", requireAdminOrTenantOwner(), remove);
router.post("/:id/restore", requireAdmin(), restore);
router.post("/:id/policies", requireAdminOrTenantOwner(), attachPolicy);
router.delete("/:id/policies/:policyId", requireAdminOrTenantOwner(), detachPolicy);
router.put("/:id/policies", requireAdminOrTenantOwner(), setPolicies);

export default router;
