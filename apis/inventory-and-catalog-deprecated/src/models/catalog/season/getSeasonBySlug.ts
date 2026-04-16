import { SeasonNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getSeasonBySlug = async (tenantSlug: string, slug: string) => {
  const season = await prisma.season.findUnique({
    where: {
      tenantSlug_slug: { tenantSlug, slug },
      deletedAt: { isSet: false },
    },
  });

  if (!season) throw new SeasonNotFoundError();

  return season;
};

export default getSeasonBySlug;
