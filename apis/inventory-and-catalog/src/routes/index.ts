import { Router } from "express";

import main from "./main";

const router: Router = Router();

router.use("/", main);

export default router;
