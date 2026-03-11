import { type Prisma, prisma } from "../../../utils/prisma";

export type ListBrandsInput = {
	page: number;
	limit: number;
	search?: string;
	isActive?: boolean;
};

const buildWhere = (
	input: Omit<ListBrandsInput, "page" | "limit">,
): Prisma.BrandWhereInput => ({
	deletedAt: { isSet: false },
	...(input.isActive !== undefined && { isActive: input.isActive }),
	...(input.search && {
		name: { contains: input.search, mode: "insensitive" },
	}),
});

const listBrands = async (input: ListBrandsInput) => {
	const where = buildWhere(input);
	const skip = (input.page - 1) * input.limit;

	const [data, total] = await Promise.all([
		prisma.brand.findMany({
			where,
			skip,
			take: input.limit,
			orderBy: [{ name: "asc" }, { createdAt: "desc" }],
		}),
		prisma.brand.count({ where }),
	]);

	return { data, total, page: input.page, limit: input.limit };
};

export default listBrands;
