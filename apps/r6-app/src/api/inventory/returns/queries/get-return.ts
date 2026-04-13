import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function getReturnFn(
	tenantSlug: string,
	id: string,
): Promise<unknown> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/returns/${id}`,
	);
	return data;
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
