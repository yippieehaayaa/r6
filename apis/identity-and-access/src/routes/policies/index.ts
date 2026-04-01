import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { requireAdmin, requireAdminOrTenantOwner } from "../../middleware/guard";
import { createPolicyHandler } from "./controller/create";
import { getPolicy } from "./controller/get";
import { list } from "./controller/list";
import { remove } from "./controller/remove";
import { restore } from "./controller/restore";
import { updatePolicyHandler } from "./controller/update";

const router: Router = Router({ mergeParams: true });

router.use(authMiddleware());

router.post("/", requireAdminOrTenantOwner(), createPolicyHandler);
router.get("/", requireAdminOrTenantOwner(), list);
router.get("/:id", requireAdminOrTenantOwner(), getPolicy);
router.patch("/:id", requireAdminOrTenantOwner(), updatePolicyHandler);
router.delete("/:id", requireAdminOrTenantOwner(), remove);
router.post("/:id/restore", requireAdmin(), restore);


export default router;
