import {
	type ListWarehousesQuery,
	type PaginatedResponse,
	PaginatedResponseSchema,
} from "@r6/schemas";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

export type ListWarehousesParams = ListWarehousesQuery;

const WarehouseSchema = z.object({
	id: z.string(),
	tenantId: z.string(),
	name: z.string(),
	code: z.string(),
	isActive: z.boolean(),
	addressLine1: z.string(),
	addressLine2: z.string().nullable(),
	addressCity: z.string(),
	addressState: z.string(),
	addressCountry: z.string(),
	addressPostal: z.string(),
	contactName: z.string().nullable(),
	contactPhone: z.string().nullable(),
	contactEmail: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type Warehouse = z.infer<typeof WarehouseSchema>;

const ListWarehousesResponseSchema = PaginatedResponseSchema(WarehouseSchema);

export async function listWarehousesFn(
	tenantSlug: string,
	params: ListWarehousesParams = {},
): Promise<PaginatedResponse<Warehouse>> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/warehouses`,
		{ params },
	);
	return ListWarehousesResponseSchema.parse(data);
}

export function useListWarehousesQuery(
	tenantSlug: string,
	params: ListWarehousesParams = {},
	options?: { staleTime?: number; gcTime?: number },
) {
	return useQuery({
		queryKey: ["warehouses", tenantSlug, params],
		queryFn: () => listWarehousesFn(tenantSlug, params),
		enabled: !!tenantSlug,
		placeholderData: keepPreviousData,
		staleTime: options?.staleTime ?? 60 * 1000,
		gcTime: options?.gcTime,
	});
}
