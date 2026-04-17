import { IAM_PERMISSIONS } from "@r6/schemas/identity-and-access";
import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireAdmin,
  requirePermission,
  requireTenantScope,
} from "../../middleware/guard";
import identitiesRouter from "../identities";
import { getTenant } from "./controller/get";
import { list } from "./controller/list";
import { remove } from "./controller/remove";
import { restore } from "./controller/restore";
import { updateTenantHandler } from "./controller/update";

const router: Router = Router();

router.use(authMiddleware());

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

router.use("/:tenantSlug/identities", identitiesRouter);

export default router;
