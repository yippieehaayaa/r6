import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middleware/auth";
import { login } from "./controller/mutations/login";
import { logout } from "./controller/mutations/logout";
import { refresh } from "./controller/mutations/refresh";
import { verifyTotp } from "./controller/mutations/verify-totp";

const router: Router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Session mutations ────────────────────────────────────────────────────────
router.post("/login", authLimiter, login);
router.post("/refresh", authLimiter, refresh);
router.post("/logout", authMiddleware(), logout);

// POST /auth/totp/verify
//   Exchanges a short-lived TOTP challenge token + 6-digit code for full
//   access + refresh tokens. Issued after login when totpEnabled = true.
router.post("/totp/verify", authLimiter, verifyTotp);

// TOTP management (setup / enable / disable) lives under /me/totp.
// See routes/me/index.ts.

export default router;
