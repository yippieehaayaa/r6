import { CategoryNotFoundError } from "../../../errors";
import { prisma } from "../../../utils/prisma";

const getCategoryById = async (id: string) => {
	const category = await prisma.category.findUnique({
		where: { id, deletedAt: { isSet: false } },
	});

	if (!category) throw new CategoryNotFoundError();

	return category;
};

export default getCategoryById;
