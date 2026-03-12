import {
  SeasonNameExistsError,
  SeasonNotFoundError,
  SeasonSlugExistsError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

export type UpdateSeasonInput = {
  name?: string;
  slug?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
};

const updateSeason = async (id: string, input: UpdateSeasonInput) => {
  const season = await prisma.season.findUnique({
    where: { id, deletedAt: { isSet: false } },
  });

  if (!season) throw new SeasonNotFoundError();

  // Re-derive denormalized year whenever startDate changes
  const year = input.startDate ? input.startDate.getFullYear() : undefined;

  try {
    return await prisma.season.update({
      where: { id },
      data: { ...input, ...(year !== undefined && { year }) },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      const target = (error as { meta?: { target?: string[] } }).meta?.target;
      if (target?.includes("name")) throw new SeasonNameExistsError();
      throw new SeasonSlugExistsError();
    }
    throw error;
  }
};

export default updateSeason;
