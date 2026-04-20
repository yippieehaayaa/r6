import { type SetupStatus, SetupStatusSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/api/_app";

export async function getSetupStatusFn(
	tenantId: string,
): Promise<SetupStatus> {
	const { data } = await inventoryApi.get<unknown>(
		`/tenants/${tenantId}/setup/status`,
	);
	return SetupStatusSchema.parse(data);
}

export function useSetupStatusQuery(
	tenantId: string,
	options?: { staleTime?: number },
) {
	return useQuery({
		queryKey: ["setup-status", tenantId],
		queryFn: () => getSetupStatusFn(tenantId),
		enabled: !!tenantId,
		...options,
	});
}
