import {
	type ReturnRequestDetail,
	ReturnRequestDetailSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { ReturnRequestDetail };

export async function getReturnFn(
	tenantId: string,
	id: string,
): Promise<ReturnRequestDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantId}/returns/${id}`,
	);
	return ReturnRequestDetailSchema.parse(data);
}

export function useGetReturnQuery(
	tenantId: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["return", tenantId, id],
		queryFn: () => getReturnFn(tenantId, id),
		enabled: (options?.enabled ?? true) && !!tenantId && !!id,
	});
}
