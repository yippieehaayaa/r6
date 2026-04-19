import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middleware/auth";
import { login } from "./controller/login";
import { logout } from "./controller/logout";
import { refresh } from "./controller/refresh";
import { disableTotp } from "./controller/totp/disable";
import { enableTotp } from "./controller/totp/enable";
import { setupTotp } from "./controller/totp/setup";
import { verifyTotp } from "./controller/verify-totp";

const router: Router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", authMiddleware(), logout);
router.post("/totp/verify", authLimiter, verifyTotp);

// TOTP management — require authentication for all three.
router.get("/totp/setup", authMiddleware(), authLimiter, setupTotp);
router.post("/totp/enable", authMiddleware(), authLimiter, enableTotp);
router.delete("/totp", authMiddleware(), authLimiter, disableTotp);

export default router;
