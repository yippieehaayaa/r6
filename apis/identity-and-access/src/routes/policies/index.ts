import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/guard";
import { createPolicyHandler } from "./controller/create";
import { getPolicy } from "./controller/get";
import { list } from "./controller/list";
import { remove } from "./controller/remove";
import { restore } from "./controller/restore";
import { updatePolicyHandler } from "./controller/update";

const router: Router = Router({ mergeParams: true });

router.use(authMiddleware());

// Policies define the permission vocabulary of the platform.
// Only ADMIN can create, read, update, or delete them.
router.post("/", requireAdmin(), createPolicyHandler);
router.get("/", requireAdmin(), list);
router.get("/:id", requireAdmin(), getPolicy);
router.patch("/:id", requireAdmin(), updatePolicyHandler);
router.delete("/:id", requireAdmin(), remove);
router.post("/:id/restore", requireAdmin(), restore);

export default router;
