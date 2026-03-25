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
router.get("/:tenantId", requireAdminOrTenantOwner(), getTenant);
router.patch("/:tenantId", requireAdminOrTenantOwner(), updateTenantHandler);
router.delete("/:tenantId", requireAdmin(), remove);
router.post("/:tenantId/restore", requireAdmin(), restore);

router.use("/:tenantId/identities", identitiesRouter);
router.use("/:tenantId/roles", rolesRouter);
router.use("/:tenantId/policies", policiesRouter);

export default router;
