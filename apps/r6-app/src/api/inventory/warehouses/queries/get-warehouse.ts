import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { inventoryApi } from "@/api/_app";

const BinLocationSchema = z.object({
	id: z.string(),
	code: z.string(),
	description: z.string().nullable(),
});

const WarehouseZoneSchema = z.object({
	id: z.string(),
	name: z.string(),
	code: z.string(),
	description: z.string().nullable(),
	bins: z.array(BinLocationSchema),
});

const WarehouseDetailSchema = z.object({
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
	zones: z.array(WarehouseZoneSchema),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export type WarehouseDetail = z.infer<typeof WarehouseDetailSchema>;

export async function getWarehouseFn(
	tenantSlug: string,
	id: string,
): Promise<WarehouseDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/warehouses/${id}`,
	);
	return WarehouseDetailSchema.parse(data);
}

export function useGetWarehouseQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["warehouses", tenantSlug, id],
		queryFn: () => getWarehouseFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
	});
}
