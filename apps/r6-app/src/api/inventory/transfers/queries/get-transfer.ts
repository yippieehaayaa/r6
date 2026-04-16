import {
	type StockTransferDetail,
	StockTransferDetailSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { StockTransferDetail };

export async function getTransferFn(
	tenantSlug: string,
	id: string,
): Promise<StockTransferDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/transfers/${id}`,
	);
	return StockTransferDetailSchema.parse(data);
}

export function useGetTransferQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["transfers", tenantSlug, id],
		queryFn: () => getTransferFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
	});
}
