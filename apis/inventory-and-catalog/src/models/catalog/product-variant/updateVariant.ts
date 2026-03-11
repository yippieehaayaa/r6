import {
	ProductVariantNotFoundError,
	ProductVariantSkuExistsError,
} from "../../../utils/errors";
import { type ImageEmbed, prisma } from "../../../utils/prisma";

export type UpdateVariantInput = {
	sku?: string;
	name?: string;
	options?: Record<string, string>;
	price?: number;
	compareAtPrice?: number;
	weight?: number;
	images?: ImageEmbed[];
	isActive?: boolean;
};

const updateVariant = async (id: string, input: UpdateVariantInput) => {
	const variant = await prisma.productVariant.findUnique({
		where: { id, deletedAt: { isSet: false } },
	});

	if (!variant) throw new ProductVariantNotFoundError();

	const { images, ...rest } = input;

	try {
		return await prisma.productVariant.update({
			where: { id },
			data: {
				...rest,
				...(images !== undefined && { images: { set: images } }),
			},
		});
	} catch (error) {
		if (
			error instanceof Error &&
			"code" in error &&
			(error as { code: string }).code === "P2002"
		) {
			throw new ProductVariantSkuExistsError();
		}
		throw error;
	}
};

export default updateVariant;
