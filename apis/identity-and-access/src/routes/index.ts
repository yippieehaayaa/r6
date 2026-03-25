import { Router } from "express";
import main from "./main";
import auth from "./auth";
import wellKnown from "./well-known";
import me from "./me";
import tenants from "./tenants";

const router: Router = Router();

router.use("/", main);
router.use("/auth", auth);
router.use("/.well-known", wellKnown);
router.use("/me", me);
router.use("/tenants", tenants);

export default router;
