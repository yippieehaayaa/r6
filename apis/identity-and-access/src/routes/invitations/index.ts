import { Router } from "express";
import rateLimit from "express-rate-limit";
import { acceptInvitationHandler } from "./controller/accept";

const router: Router = Router();

// Conservative rate limit — prevents brute-force attempts against invitation tokens.
const acceptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /invitations/accept
//   Public endpoint — no auth required.
//   Accepts a pending invitation using the raw token received via email.
//   The invitee must already have an r6 account (registered + email verified).
router.post("/accept", acceptLimiter, acceptInvitationHandler);

export default router;
