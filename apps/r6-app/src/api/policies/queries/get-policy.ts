import { type Policy, PolicySchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getPolicyFn(
	tenantSlug: string,
	id: string,
): Promise<Policy> {
	const { data } = await identityApi.get<unknown>(
		`/tenants/${tenantSlug}/policies/${id}`,
	);
	return PolicySchema.parse(data);
}

export function useGetPolicyQuery(tenantSlug: string, id: string) {
	return useQuery({
		queryKey: ["policies", tenantSlug, id],
		queryFn: () => getPolicyFn(tenantSlug, id),
		enabled: !!tenantSlug && !!id,
	});
}
