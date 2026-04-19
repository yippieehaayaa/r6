import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import auth from "./auth";
import email from "./email";
import invitations from "./invitations";
import main from "./main";
import me from "./me";
import registration from "./registration";
import tenants from "./tenants";
import wellKnown from "./well-known";

const router: Router = Router();

// Public routes — no auth required
router.use("/", main);
router.use("/auth", auth);
router.use("/.well-known", wellKnown);
router.use("/email", email);
router.use("/registration", registration);
router.use("/invitations", invitations);

// Authenticated routes — authMiddleware applied at mount AND inside each sub-router (defense-in-depth)
router.use("/me", authMiddleware(), me);
router.use("/tenants", authMiddleware(), tenants);

export default router;
