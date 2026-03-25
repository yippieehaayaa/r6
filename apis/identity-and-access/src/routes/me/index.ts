import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { getMe } from "./controller/get-me";
import { updatePassword } from "./controller/update-password";

const router: Router = Router();

router.use(authMiddleware());

router.get("/", getMe);
router.patch("/password", updatePassword);

export default router;
