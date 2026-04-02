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

// Tenant owners can fully manage role definitions within their tenant
// (create, read, update, delete) to build their org structure.
// Policy attachment is ADMIN-only — ADMIN controls what permissions
// a role actually carries, preventing tenant privilege escalation.
router.post("/", requireAdminOrTenantOwner(), createRoleHandler);
router.get("/", requireAdminOrTenantOwner(), list);
router.get("/:id", requireAdminOrTenantOwner(), getRole);
router.patch("/:id", requireAdminOrTenantOwner(), updateRoleHandler);
router.delete("/:id", requireAdminOrTenantOwner(), remove);
router.post("/:id/restore", requireAdmin(), restore);
router.post("/:id/policies", requireAdmin(), attachPolicy);
router.delete("/:id/policies/:policyId", requireAdmin(), detachPolicy);
router.put("/:id/policies", requireAdmin(), setPolicies);

export default router;
