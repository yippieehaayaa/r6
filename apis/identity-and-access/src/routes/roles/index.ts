import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireAdmin,
  requireAdminOrTenantOwner,
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

router.use(authMiddleware());

// Role definitions and policy attachments are ADMIN-only operations.
// Tenant owners may read roles (to know which ones exist for assignment)
// but cannot create, modify, or control what policies a role contains.
router.post("/", requireAdmin(), createRoleHandler);
router.get("/", requireAdminOrTenantOwner(), list);
router.get("/:id", requireAdminOrTenantOwner(), getRole);
router.patch("/:id", requireAdmin(), updateRoleHandler);
router.delete("/:id", requireAdmin(), remove);
router.post("/:id/restore", requireAdmin(), restore);
router.post("/:id/policies", requireAdmin(), attachPolicy);
router.delete("/:id/policies/:policyId", requireAdmin(), detachPolicy);
router.put("/:id/policies", requireAdmin(), setPolicies);

export default router;
