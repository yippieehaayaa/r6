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

router.use(authMiddleware(), requireAdmin());

router.post("/", createPolicyHandler);
router.get("/", list);
router.get("/:id", getPolicy);
router.patch("/:id", updatePolicyHandler);
router.delete("/:id", remove);
router.post("/:id/restore", restore);

export default router;
