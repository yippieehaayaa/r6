import { type WarehouseDetail, WarehouseDetailSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { WarehouseDetail };

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
