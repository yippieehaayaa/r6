import { Router } from "express";
import { sendDemo } from "./controller/send-demo";

const router: Router = Router();

router.post("/demo", sendDemo);

export default router;
