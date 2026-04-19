import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register } from "./controller/register";
import { verifyEmailHandler } from "./controller/verify-email";

const router: Router = Router();

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/", registrationLimiter, register);
router.post("/verify-email", registrationLimiter, verifyEmailHandler);

export default router;
