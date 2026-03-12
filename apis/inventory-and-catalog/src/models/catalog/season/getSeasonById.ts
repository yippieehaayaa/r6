import { SeasonNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getSeasonById = async (id: string) => {
  const season = await prisma.season.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!season) throw new SeasonNotFoundError();

  return season;
};

export default getSeasonById;
