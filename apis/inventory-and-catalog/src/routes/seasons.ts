import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { seasonsService } from "../modules/seasons";

const router: Router = Router();

const createSeasonSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  isActive: z.boolean().optional(),
});

const updateSeasonSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

router.get("/", async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);
  const search = req.query.search as string | undefined;
  const isActive =
    req.query.isActive !== undefined
      ? req.query.isActive === "true"
      : undefined;
  const year =
    req.query.year !== undefined ? Number(req.query.year) : undefined;

  const result = await seasonsService.listSeasons({
    page,
    limit,
    search,
    isActive,
    year,
  });
  res.json(result);
});

router.get("/slug/:slug", async (req: Request, res: Response) => {
  const season = await seasonsService.getSeasonBySlug(
    req.params.slug as string,
  );
  res.json(season);
});

router.get("/:id", async (req: Request, res: Response) => {
  const season = await seasonsService.getSeasonById(req.params.id as string);
  res.json(season);
});

router.post("/", async (req: Request, res: Response) => {
  const parsed = createSeasonSchema.parse(req.body);
  const season = await seasonsService.createSeason(parsed);
  res.status(201).json(season);
});

router.patch("/:id", async (req: Request, res: Response) => {
  const parsed = updateSeasonSchema.parse(req.body);
  const season = await seasonsService.updateSeason(
    req.params.id as string,
    parsed,
  );
  res.json(season);
});

router.delete("/:id", async (req: Request, res: Response) => {
  await seasonsService.deleteSeason(req.params.id as string);
  res.sendStatus(204);
});

export default router;
