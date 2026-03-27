import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/guard";
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

router.use(authMiddleware(), requireAdmin());

router.post("/", createRoleHandler);
router.get("/", list);
router.get("/:id", getRole);
router.patch("/:id", updateRoleHandler);
router.delete("/:id", remove);
router.post("/:id/restore", restore);
router.post("/:id/policies", attachPolicy);
router.delete("/:id/policies/:policyId", detachPolicy);
router.put("/:id/policies", setPolicies);

export default router;
