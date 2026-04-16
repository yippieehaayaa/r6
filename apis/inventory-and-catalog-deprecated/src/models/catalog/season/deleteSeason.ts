import { SeasonNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const deleteSeason = async (tenantSlug: string, id: string) => {
  const season = await prisma.season.findUnique({
    where: { id, tenantSlug, deletedAt: { isSet: false } },
  });

  if (!season) throw new SeasonNotFoundError();

  return await prisma.season.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export default deleteSeason;
