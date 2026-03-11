import { WarehouseNotFoundError } from "../../../utils/errors";
import { prisma } from "../../../utils/prisma";

const getWarehouseById = async (id: string) => {
	const warehouse = await prisma.warehouse.findUnique({
		where: { id, deletedAt: { isSet: false } },
	});

	if (!warehouse) throw new WarehouseNotFoundError();

	return warehouse;
};

export default getWarehouseById;
