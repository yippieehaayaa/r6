import type { PrismaClient } from "../../generated/client/index.js";

type SeasonDef = {
  name: string;
  slug: string;
  description: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
};

// Philippine retail seasons — users can freely add/edit via the seasons API
const SEASON_DEFS: SeasonDef[] = [
  {
    name: "New Year",
    slug: "new-year",
    description:
      "Post-holiday period. Clearance sales and fresh product launches.",
    startMonth: 1,
    startDay: 1,
    endMonth: 1,
    endDay: 31,
  },
  {
    name: "Summer",
    slug: "summer",
    description:
      "Hot dry season. Peak for beach, outdoor, and vacation products.",
    startMonth: 3,
    startDay: 1,
    endMonth: 5,
    endDay: 31,
  },
  {
    name: "Back to School",
    slug: "back-to-school",
    description:
      "School opening season. High demand for supplies, bags, uniforms, and electronics.",
    startMonth: 6,
    startDay: 1,
    endMonth: 7,
    endDay: 31,
  },
  {
    name: "Rainy Season",
    slug: "rainy-season",
    description:
      "Monsoon period. Elevated demand for rain gear and waterproof products.",
    startMonth: 6,
    startDay: 1,
    endMonth: 10,
    endDay: 31,
  },
  {
    name: "Ber Season",
    slug: "ber-season",
    description:
      "Philippine Christmas ramp-up (Sep–Nov). Consumer spending accelerates.",
    startMonth: 9,
    startDay: 1,
    endMonth: 11,
    endDay: 30,
  },
  {
    name: "Christmas",
    slug: "christmas",
    description:
      "Peak holiday shopping. Highest sales volume across all categories.",
    startMonth: 12,
    startDay: 1,
    endMonth: 12,
    endDay: 31,
  },
];

const SEED_YEARS = [2024, 2025, 2026];

export async function seedSeasons(
  prisma: PrismaClient,
  log: (msg: string) => void,
): Promise<void> {
  const records = SEED_YEARS.flatMap((year) =>
    SEASON_DEFS.map((def) => ({
      name: `${def.name} ${year}`,
      slug: `${def.slug}-${year}`,
      description: def.description,
      startDate: new Date(Date.UTC(year, def.startMonth - 1, def.startDay)),
      endDate: new Date(
        Date.UTC(year, def.endMonth - 1, def.endDay, 23, 59, 59),
      ),
      year,
      isActive: year >= 2025,
    })),
  );

  const created = await Promise.all(
    records.map((r) =>
      prisma.season.upsert({
        where: { slug: r.slug },
        update: {},
        create: r,
      }),
    ),
  );

  log(`${created.length} seasons (${SEED_YEARS.join(", ")})`);
}
