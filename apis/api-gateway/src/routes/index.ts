import { Router } from "express";
import mainRoutes from "./main";

const router = Router();

router.use("/", mainRoutes);

export default router;