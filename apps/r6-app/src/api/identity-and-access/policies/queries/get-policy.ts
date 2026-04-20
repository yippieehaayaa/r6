import { type Policy, PolicySchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getPolicyFn(
	tenantId: string,
	id: string,
): Promise<Policy> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantId}/policies/${id}`,
	);
	return PolicySchema.parse(data);
}

export function useGetPolicyQuery(
	tenantId: string,
	id: string,
	options?: { enabled?: boolean },
) {
	return useQuery({
		queryKey: ["policies", tenantId, id],
		queryFn: () => getPolicyFn(tenantId, id),
		enabled: (options?.enabled ?? true) && !!tenantId && !!id,
	});
}
