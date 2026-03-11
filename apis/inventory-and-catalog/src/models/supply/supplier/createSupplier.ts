import {
	SupplierCodeExistsError,
	SupplierNameExistsError,
} from "../../../utils/errors";
import { type AddressEmbed, prisma } from "../../../utils/prisma";

export type CreateSupplierInput = {
	name: string;
	code: string;
	contactName?: string;
	contactEmail?: string;
	contactPhone?: string;
	address?: AddressEmbed;
	isActive?: boolean;
};

const createSupplier = async (input: CreateSupplierInput) => {
	try {
		return await prisma.supplier.create({
			data: {
				name: input.name,
				code: input.code,
				contactName: input.contactName,
				contactEmail: input.contactEmail,
				contactPhone: input.contactPhone,
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
			if (target?.includes("code")) throw new SupplierCodeExistsError();
			throw new SupplierNameExistsError();
		}
		throw error;
	}
};

export default createSupplier;
