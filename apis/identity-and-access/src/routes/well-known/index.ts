import { type Request, type Response, Router } from "express";
import { getPublicJwk } from "../../lib/jwt";

const router: Router = Router();

router.get("/jwks.json", async (_req: Request, res: Response) => {
  const jwk = await getPublicJwk();
  return res.status(200).json({ keys: [jwk] });
});

export default router;
