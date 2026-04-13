import { type StockAlert, StockAlertSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function getStockAlertFn(
	tenantSlug: string,
	id: string,
): Promise<StockAlert> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/stock-alerts/${id}`,
	);
	return StockAlertSchema.parse(data);
}

export function useGetStockAlertQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["stock-alerts", tenantSlug, id],
		queryFn: () => getStockAlertFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
	});
}
