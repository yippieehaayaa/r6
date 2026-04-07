import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { login } from "./controller/login";
import { logout } from "./controller/logout";
import { refresh } from "./controller/refresh";
import { verifyTotp } from "./controller/verify-totp";

const router: Router = Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authMiddleware(), logout);
router.post("/totp/verify", verifyTotp);

export default router;
