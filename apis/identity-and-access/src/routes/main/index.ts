import { type Request, type Response, Router } from "express";

const router: Router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.sendStatus(200);
});

export default router;
