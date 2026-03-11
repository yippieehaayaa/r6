import {
	BrandNameExistsError,
	BrandNotFoundError,
	BrandSlugExistsError,
} from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

export type UpdateBrandInput = {
	name?: string;
	slug?: string;
	description?: string;
	logoUrl?: string;
	isActive?: boolean;
};

const updateBrand = async (id: string, input: UpdateBrandInput) => {
	const brand = await prisma.brand.findUnique({
		where: { id, deletedAt: { isSet: false } },
	});

	if (!brand) throw new BrandNotFoundError();

	try {
		return await prisma.brand.update({
			where: { id },
			data: input,
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

export default updateBrand;
