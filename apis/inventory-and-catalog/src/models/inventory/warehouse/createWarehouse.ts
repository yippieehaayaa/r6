import {
	WarehouseCodeExistsError,
	WarehouseNameExistsError,
} from "../../../utils/errors";
import { type AddressEmbed, prisma } from "../../../utils/prisma";

export type CreateWarehouseInput = {
	name: string;
	code: string;
	address?: AddressEmbed;
	isActive?: boolean;
};

const createWarehouse = async (input: CreateWarehouseInput) => {
	try {
		return await prisma.warehouse.create({
			data: {
				name: input.name,
				code: input.code,
				address: input.address,
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
			if (target?.includes("code")) throw new WarehouseCodeExistsError();
			throw new WarehouseNameExistsError();
		}
		throw error;
	}
};

export default createWarehouse;
