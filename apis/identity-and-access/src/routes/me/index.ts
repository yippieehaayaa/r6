import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middleware/auth";
import { changePassword } from "./controller/mutations/change-password";
import { disableTotp } from "./controller/mutations/disable-totp";
import { enableTotp } from "./controller/mutations/enable-totp";
import { getProfile } from "./controller/queries/get-profile";
import { getTotpSetup } from "./controller/queries/get-totp-setup";
import { listPermissions } from "./controller/queries/list-permissions";

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

// ── Self-service profile ──────────────────────────────────────────────────────

// GET /me
//   Returns the authenticated identity's full safe profile.
router.get("/", getProfile);

// GET /me/permissions
//   Returns the authenticated identity's raw IdentityPermission override rows
//   (paginated). Requires the caller to belong to a tenant.
router.get("/permissions", listPermissions);

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

// ── Self-service password management ─────────────────────────────────────────

// PATCH /me/password
//   Changes the authenticated identity's password. Requires the current
//   password in the body. On success all refresh tokens are revoked.
router.patch("/password", totpLimiter, changePassword);

// ── Future self-service profile routes ───────────────────────────────────────
// PATCH /me         → updateProfile  (update own name, country, etc.)

export default router;
