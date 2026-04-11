import { Router } from "express";
import main from "./main";

const router: Router = Router();

// Public routes — no auth required
router.use("/", main);

// Authenticated routes — apply authMiddleware at the router level
// import { authMiddleware } from "../middleware/auth";
// router.use("/example", authMiddleware(), exampleRoutes);

export default router;
