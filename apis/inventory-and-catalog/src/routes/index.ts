import { Router } from "express";

import main from "./main";
import seasons from "./seasons";

const router: Router = Router();

router.use("/", main);
router.use("/seasons", seasons);

export default router;
