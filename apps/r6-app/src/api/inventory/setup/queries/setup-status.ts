import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function getSetupStatusFn(tenantSlug: string): Promise<unknown> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantSlug}/setup/status`,
	);
	return data;
}

export function useSetupStatusQuery(
	tenantSlug: string,
	options?: { staleTime?: number },
) {
	return useQuery({
		queryKey: ["setup-status", tenantSlug],
		queryFn: () => getSetupStatusFn(tenantSlug),
		enabled: !!tenantSlug,
		...options,
	});
}
