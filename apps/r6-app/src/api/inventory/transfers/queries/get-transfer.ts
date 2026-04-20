import {
	type StockTransferDetail,
	StockTransferDetailSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { StockTransferDetail };

export async function getTransferFn(
	tenantId: string,
	id: string,
): Promise<StockTransferDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantId}/transfers/${id}`,
	);
	return StockTransferDetailSchema.parse(data);
}

export function useGetTransferQuery(
	tenantId: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["transfers", tenantId, id],
		queryFn: () => getTransferFn(tenantId, id),
		enabled: (options?.enabled ?? true) && !!tenantId && !!id,
	});
}
