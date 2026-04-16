import { type StockCountDetail, StockCountDetailSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { StockCountDetail };

export async function getStockCountFn(
	tenantSlug: string,
	id: string,
): Promise<StockCountDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/stock-counts/${id}`,
	);
	return StockCountDetailSchema.parse(data);
}

export function useGetStockCountQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["stock-counts", tenantSlug, id],
		queryFn: () => getStockCountFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
	});
}
