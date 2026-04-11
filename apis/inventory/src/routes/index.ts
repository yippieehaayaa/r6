import { Router } from "express";
import main from "./main";

const router: Router = Router();

// Public routes — no auth required
router.use("/", main);

export default router;
