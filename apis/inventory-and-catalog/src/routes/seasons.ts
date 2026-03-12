import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { seasonsService } from "../modules/seasons";
import {
  SeasonNameExistsError,
  SeasonNotFoundError,
  SeasonSlugExistsError,
} from "../utils/errors";

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

// GET /seasons — paginated list with optional filters
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

// GET /seasons/slug/:slug — O(1) lookup by unique slug (must precede /:id)
router.get("/slug/:slug", async (req: Request, res: Response) => {
  try {
    const season = await seasonsService.getSeasonBySlug(
      req.params.slug as string,
    );
    res.json(season);
  } catch (error) {
    if (error instanceof SeasonNotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }
    throw error;
  }
});

// GET /seasons/:id — O(1) lookup by id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const season = await seasonsService.getSeasonById(req.params.id as string);
    res.json(season);
  } catch (error) {
    if (error instanceof SeasonNotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }
    throw error;
  }
});

// POST /seasons — create a new season
router.post("/", async (req: Request, res: Response) => {
  const parsed = createSeasonSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: "Invalid request body", issues: parsed.error.issues });
    return;
  }

  try {
    const season = await seasonsService.createSeason(parsed.data);
    res.status(201).json(season);
  } catch (error) {
    if (
      error instanceof SeasonNameExistsError ||
      error instanceof SeasonSlugExistsError
    ) {
      res.status(409).json({ message: error.message });
      return;
    }
    throw error;
  }
});

// PATCH /seasons/:id — partial update
router.patch("/:id", async (req: Request, res: Response) => {
  const parsed = updateSeasonSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ message: "Invalid request body", issues: parsed.error.issues });
    return;
  }

  try {
    const season = await seasonsService.updateSeason(
      req.params.id as string,
      parsed.data,
    );
    res.json(season);
  } catch (error) {
    if (error instanceof SeasonNotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }
    if (
      error instanceof SeasonNameExistsError ||
      error instanceof SeasonSlugExistsError
    ) {
      res.status(409).json({ message: error.message });
      return;
    }
    throw error;
  }
});

// DELETE /seasons/:id — soft delete
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await seasonsService.deleteSeason(req.params.id as string);
    res.sendStatus(204);
  } catch (error) {
    if (error instanceof SeasonNotFoundError) {
      res.status(404).json({ message: error.message });
      return;
    }
    throw error;
  }
});

export default router;
