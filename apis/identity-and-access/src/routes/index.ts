import { Router } from "express";
import auth from "./auth";
import email from "./email";
import main from "./main";
import registration from "./registration";
import wellKnown from "./well-known";

const router: Router = Router();

// Public routes — no auth required
router.use("/", main);
router.use("/auth", auth);
router.use("/.well-known", wellKnown);
router.use("/email", email);
router.use("/registration", registration);

// Authenticated routes — authMiddleware applied here AND in each sub-router (defense-in-depth)

export default router;
