import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middleware/auth";
import { getTotpSetup } from "./controller/queries/get-totp-setup";
import { disableTotp } from "./controller/mutations/disable-totp";
import { enableTotp } from "./controller/mutations/enable-totp";

const router: Router = Router();

// All /me routes require authentication.
router.use(authMiddleware());

// Conservative rate limit on sensitive self-service TOTP operations.
const totpLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
});

// ── TOTP management ──────────────────────────────────────────────────────────
// These routes let a user set up, activate, and remove 2FA on their own account.

// GET /me/totp/setup
//   Generates + stores an encrypted TOTP secret and returns the QR code / URI.
//   Call this before POST /me/totp/enable.
router.get("/totp/setup", totpLimiter, getTotpSetup);

// POST /me/totp/enable
//   Verifies the first authenticator code and activates TOTP on the account.
router.post("/totp/enable", totpLimiter, enableTotp);

// DELETE /me/totp
//   Disables TOTP. Requires the account password in the body to prevent
//   a stolen access token from silently downgrading 2FA.
router.delete("/totp", totpLimiter, disableTotp);

// ── Future self-service profile routes ───────────────────────────────────────
// GET  /me          → getProfile     (fetch own profile)
// PATCH /me         → updateProfile  (update own name, country, etc.)
// PATCH /me/password → changePassword (change own password)

export default router;
