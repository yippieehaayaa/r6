import { IAM_PERMISSIONS } from "@r6/schemas/identity-and-access";
import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireAdmin,
  requirePermission,
  requireTenantScope,
} from "../../middleware/guard";
import identitiesRouter from "../identities";
import rolesRouter from "../roles";
import { createTenantHandler } from "./controller/create";
import { getTenant } from "./controller/get";
import { list } from "./controller/list";
import { provisionIdentityHandler } from "./controller/provision";
import { remove } from "./controller/remove";
import { restore } from "./controller/restore";
import { updateTenantHandler } from "./controller/update";

const router: Router = Router();

router.use(authMiddleware());

router.post("/", requireAdmin(), createTenantHandler);
router.get("/", requireAdmin(), list);
router.get(
  "/:tenantSlug",
  requireTenantScope(),
  requirePermission(IAM_PERMISSIONS.TENANT_READ),
  getTenant,
);
router.patch("/:tenantSlug", requireAdmin(), updateTenantHandler);
router.delete("/:tenantSlug", requireAdmin(), remove);
router.post("/:tenantSlug/restore", requireAdmin(), restore);

// ADMIN-only: bootstrap a tenant-owner or tenant-admin identity for a tenant.
router.post("/:tenantSlug/provision", requireAdmin(), provisionIdentityHandler);

router.use("/:tenantSlug/identities", identitiesRouter);
router.use("/:tenantSlug/roles", rolesRouter);

export default router;
