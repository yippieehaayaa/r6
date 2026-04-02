import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  requireAdmin,
  requirePermission,
  requireTenantScope,
} from "../../middleware/guard";
import { createPolicyHandler } from "./controller/create";
import { getPolicy } from "./controller/get";
import { list } from "./controller/list";
import { remove } from "./controller/remove";
import { restore } from "./controller/restore";
import { updatePolicyHandler } from "./controller/update";

const router: Router = Router({ mergeParams: true });

// Reads are open to any identity with iam:policy:read.
// Writes remain ADMIN-only — policies define the permission vocabulary;
// allowing tenant users to mutate them would enable privilege escalation.
router.use(authMiddleware(), requireTenantScope());
router.post("/", requireAdmin(), createPolicyHandler);
router.get("/", requirePermission("iam:policy:read"), list);
router.get("/:id", requirePermission("iam:policy:read"), getPolicy);
router.patch("/:id", requireAdmin(), updatePolicyHandler);
router.delete("/:id", requireAdmin(), remove);
router.post("/:id/restore", requireAdmin(), restore);

export default router;
