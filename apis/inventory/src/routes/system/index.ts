import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/guard";
import { expireReservationsHandler } from "./controller/expire-reservations";

const router: Router = Router();

router.use(authMiddleware());

router.post("/expire-reservations", requireAdmin(), expireReservationsHandler);

export default router;
