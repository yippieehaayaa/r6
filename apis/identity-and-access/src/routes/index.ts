import { Router } from "express";
import auth from "./auth";
import main from "./main";
import me from "./me";
import tenants from "./tenants";
import wellKnown from "./well-known";

const router: Router = Router();

router.use("/", main);
router.use("/auth", auth);
router.use("/.well-known", wellKnown);
router.use("/me", me);
router.use("/tenants", tenants);

export default router;
