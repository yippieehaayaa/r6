import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import auth from "./auth";
import main from "./main";
import me from "./me";
import tenants from "./tenants";
import wellKnown from "./well-known";

const router: Router = Router();

// Public routes — no auth required
router.use("/", main);
router.use("/auth", auth);
router.use("/.well-known", wellKnown);

// Authenticated routes — authMiddleware applied here AND in each sub-router (defense-in-depth)
router.use("/me", authMiddleware(), me);
router.use("/tenants", authMiddleware(), tenants);

export default router;
