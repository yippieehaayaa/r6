import { type Request, type Response, Router } from "express";
import {
  analyticsController,
  catalogController,
  inventoryController,
  procurementController,
  seasonsController,
} from "../modules";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.sendStatus(200);
});

router.use("/catalog", catalogController);
router.use("/seasons", seasonsController);
router.use("/inventory", inventoryController);
router.use("/procurement", procurementController);
router.use("/analytics", analyticsController);

export default router;
