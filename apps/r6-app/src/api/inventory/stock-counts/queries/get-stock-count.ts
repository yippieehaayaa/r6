import { type StockCountDetail, StockCountDetailSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { StockCountDetail };

export async function getStockCountFn(
	tenantId: string,
	id: string,
): Promise<StockCountDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantId}/stock-counts/${id}`,
	);
	return StockCountDetailSchema.parse(data);
}

export function useGetStockCountQuery(
	tenantId: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["stock-counts", tenantId, id],
		queryFn: () => getStockCountFn(tenantId, id),
		enabled: (options?.enabled ?? true) && !!tenantId && !!id,
	});
}
