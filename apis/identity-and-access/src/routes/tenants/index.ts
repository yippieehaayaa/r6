import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireAdmin,
  requireAdminOrTenantOwner,
} from "../../middleware/guard";
import identitiesRouter from "../identities";
import policiesRouter from "../policies";
import rolesRouter from "../roles";
import { createTenantHandler } from "./controller/create";
import { getTenant } from "./controller/get";
import { list } from "./controller/list";
import { remove } from "./controller/remove";
import { restore } from "./controller/restore";
import { updateTenantHandler } from "./controller/update";

const router: Router = Router();

router.use(authMiddleware());

router.post("/", requireAdmin(), createTenantHandler);
router.get("/", requireAdmin(), list);
router.get("/:tenantSlug", requireAdminOrTenantOwner(), getTenant);
router.patch("/:tenantSlug", requireAdminOrTenantOwner(), updateTenantHandler);
router.delete("/:tenantSlug", requireAdmin(), remove);
router.post("/:tenantSlug/restore", requireAdmin(), restore);

router.use("/:tenantSlug/identities", identitiesRouter);
router.use("/:tenantSlug/roles", rolesRouter);
router.use("/:tenantSlug/policies", policiesRouter);

export default router;
