import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireAdmin,
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

// Policy attachment stays ADMIN-only — prevents tenant privilege escalation.
router.use(authMiddleware(), requireTenantScope());
router.post("/", requirePermission("iam:role:create"), createRoleHandler);
router.get("/", requirePermission("iam:role:read"), list);
router.get("/:id", requirePermission("iam:role:read"), getRole);
router.patch("/:id", requirePermission("iam:role:update"), updateRoleHandler);
router.delete("/:id", requirePermission("iam:role:delete"), remove);
router.post("/:id/restore", requireAdmin(), restore);
router.post("/:id/policies", requireAdmin(), attachPolicy);
router.delete("/:id/policies/:policyId", requireAdmin(), detachPolicy);
router.put("/:id/policies", requireAdmin(), setPolicies);

export default router;
