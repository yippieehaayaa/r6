import { type Request, type Response, Router } from "express";
import { validate } from "../../shared/middleware";
import * as seasonsService from "./seasons.service";
import { createSeasonSchema, updateSeasonSchema } from "./seasons.validator";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = req.query.search as string | undefined;
  const isActive =
    req.query.isActive !== undefined
      ? req.query.isActive === "true"
      : undefined;
  const year =
    req.query.year !== undefined ? Number(req.query.year) : undefined;

  const result = await seasonsService.listSeasons(tenantSlug, {
    page,
    limit,
    search,
    isActive,
    year,
  });
  res.json(result);
});

router.get("/slug/:slug", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const season = await seasonsService.getSeasonBySlug(
    tenantSlug,
    req.params.slug as string,
  );
  res.json(season);
});

router.get("/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  const season = await seasonsService.getSeasonById(
    tenantSlug,
    req.params.id as string,
  );
  res.json(season);
});

router.post(
  "/",
  validate(createSeasonSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const season = await seasonsService.createSeason(tenantSlug, req.body);
    res.status(201).json(season);
  },
);

router.patch(
  "/:id",
  validate(updateSeasonSchema),
  async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const season = await seasonsService.updateSeason(
      tenantSlug,
      req.params.id as string,
      req.body,
    );
    res.json(season);
  },
);

router.delete("/:id", async (req: Request, res: Response) => {
  const tenantSlug = req.jwtPayload!.tenantSlug as string;
  await seasonsService.deleteSeason(tenantSlug, req.params.id as string);
  res.sendStatus(204);
});

export default router;
