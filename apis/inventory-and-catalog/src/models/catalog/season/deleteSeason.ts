import { SeasonNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const deleteSeason = async (id: string) => {
  const season = await prisma.season.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!season) throw new SeasonNotFoundError();

  return await prisma.season.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export default deleteSeason;
