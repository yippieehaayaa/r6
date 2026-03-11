import {
	BrandNameExistsError,
	BrandSlugExistsError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

export type CreateBrandInput = {
	name: string;
	slug: string;
	description?: string;
	logoUrl?: string;
	isActive?: boolean;
};

const createBrand = async (input: CreateBrandInput) => {
	try {
		return await prisma.brand.create({
			data: {
				name: input.name,
				slug: input.slug,
				description: input.description,
				logoUrl: input.logoUrl,
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
			if (target?.includes("name")) throw new BrandNameExistsError();
			throw new BrandSlugExistsError();
		}
		throw error;
	}
};

export default createBrand;
