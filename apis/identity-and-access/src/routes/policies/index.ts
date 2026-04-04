import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { requireAdmin, requirePermission } from "../../middleware/guard";
import { createPolicyHandler } from "./controller/create";
import { getPolicy } from "./controller/get";
import { list } from "./controller/list";
import { remove } from "./controller/remove";
import { restore } from "./controller/restore";
import { updatePolicyHandler } from "./controller/update";

const router: Router = Router();

// Policies are global (tenantId = null). Reads are open to any identity
// with iam:policy:read. Writes are ADMIN-only — policies define the
// permission vocabulary; allowing non-admins to mutate them would enable
// privilege escalation.
router.use(authMiddleware());
router.get("/", requirePermission("iam:policy:read"), list);
router.post("/", requireAdmin(), createPolicyHandler);
router.get("/:id", requirePermission("iam:policy:read"), getPolicy);
router.patch("/:id", requireAdmin(), updatePolicyHandler);
router.delete("/:id", requireAdmin(), remove);
router.post("/:id/restore", requireAdmin(), restore);

export default router;
