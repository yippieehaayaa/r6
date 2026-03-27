import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { login } from "./controller/login";
import { logout } from "./controller/logout";
import { refresh } from "./controller/refresh";

const router: Router = Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", authMiddleware(), logout);

export default router;
