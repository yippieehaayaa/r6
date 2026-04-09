import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middleware/auth";
import { login } from "./controller/login";
import { logout } from "./controller/logout";
import { refresh } from "./controller/refresh";
import { validate } from "./controller/validate";
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

// Service-to-service token validation — no rate limiting since it is
// called by trusted internal services forwarding an existing Bearer token.
router.post("/validate", validate);

export default router;
