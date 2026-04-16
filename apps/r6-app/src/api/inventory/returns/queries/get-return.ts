import {
	type ReturnRequestDetail,
	ReturnRequestDetailSchema,
} from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export type { ReturnRequestDetail };

export async function getReturnFn(
	tenantSlug: string,
	id: string,
): Promise<ReturnRequestDetail> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/returns/${id}`,
	);
	return ReturnRequestDetailSchema.parse(data);
}

export function useGetReturnQuery(
	tenantSlug: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["return", tenantSlug, id],
		queryFn: () => getReturnFn(tenantSlug, id),
		enabled: (options?.enabled ?? true) && !!tenantSlug && !!id,
	});
}
