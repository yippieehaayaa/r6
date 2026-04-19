import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authMiddleware } from "../../middleware/auth";
import { disableTotp } from "./controller/totp/disable";
import { enableTotp } from "./controller/totp/enable";
import { setupTotp } from "./controller/totp/setup";

const router: Router = Router();

// Protect all /me routes with auth (defense-in-depth — also applied at mount in routes/index.ts).
router.use(authMiddleware());

// Conservative rate limit for TOTP mutations — these are sensitive operations.
const totpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// GET /me/totp/setup
//   Generate a new TOTP secret and return QR code + otpauth URI + plaintext secret.
//   Stores the AES-256-GCM encrypted secret; TOTP stays inactive until /enable is called.
router.get("/totp/setup", totpLimiter, setupTotp);

// POST /me/totp/enable
//   Confirm setup with a valid 6-digit code. Sets totpEnabled = true.
router.post("/totp/enable", totpLimiter, enableTotp);

// DELETE /me/totp
//   Disable TOTP. Requires current account password to prevent
//   stolen-token downgrade attacks.
router.delete("/totp", totpLimiter, disableTotp);

export default router;
