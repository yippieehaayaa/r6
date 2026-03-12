import {
  SeasonNameExistsError,
  SeasonSlugExistsError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

export type CreateSeasonInput = {
  name: string;
  slug: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  isActive?: boolean;
};

const createSeason = async (input: CreateSeasonInput) => {
  try {
    return await prisma.season.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        // Denormalize year from startDate for O(1) equality index lookups
        year: input.startDate.getFullYear(),
        isActive: input.isActive,
      },
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

export default createSeason;
