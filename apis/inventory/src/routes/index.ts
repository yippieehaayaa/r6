import { Router } from "express";
import main from "./main";
import system from "./system";
import tenants from "./tenants";

const router: Router = Router();

router.use("/", main);
router.use("/tenants", tenants);
router.use("/system", system);

export default router;
