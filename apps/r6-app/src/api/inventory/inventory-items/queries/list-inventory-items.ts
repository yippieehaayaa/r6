import {
	type ListInventoryItemsQuery,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const InventoryItemSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	variantId: z.string(),
	warehouseId: z.string(),
	quantityOnHand: z.number(),
	quantityReserved: z.number(),
	reorderPoint: z.number().nullable(),
	reorderQuantity: z.number().nullable(),
	overstockThreshold: z.number().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
	variant: z.object({
		id: z.string(),
		sku: z.string(),
		name: z.string(),
		barcode: z.string().nullable(),
		trackingType: z.string(),
		isActive: z.boolean(),
		productId: z.string(),
		product: z.object({
			id: z.string(),
			sku: z.string(),
			name: z.string(),
			status: z.string(),
		}),
	}),
	warehouse: z.object({
		id: z.string(),
		name: z.string(),
		code: z.string(),
		isActive: z.boolean(),
	}),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;

const InventoryItemListResponseSchema =
	PaginatedResponseSchema(InventoryItemSchema);

export async function listInventoryItemsFn(
	tenantSlug: string,
	params: ListInventoryItemsQuery = {},
) {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/inventory-items`,
		{ params },
	);
	return InventoryItemListResponseSchema.parse(data);
}

export function useListInventoryItemsQuery(
	tenantSlug: string,
	params: ListInventoryItemsQuery = {},
	options?: { staleTime?: number },
) {
	return useQuery({
		queryKey: ["inventory-items", tenantSlug, params],
		queryFn: () => listInventoryItemsFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 30 * 1000,
	});
}
