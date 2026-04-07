import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { disableTotpHandler } from "./controller/disable-totp";
import { enableTotp } from "./controller/enable-totp";
import { getMe } from "./controller/get-me";
import { getTotpSetup } from "./controller/get-totp-setup";
import { updatePassword } from "./controller/update-password";

const router: Router = Router();

router.use(authMiddleware());

router.get("/", getMe);
router.patch("/password", updatePassword);
router.get("/totp/setup", getTotpSetup);
router.post("/totp/enable", enableTotp);
router.delete("/totp/disable", disableTotpHandler);

export default router;
