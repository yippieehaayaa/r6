import { type Tenant, TenantSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getTenantFn(tenantSlug: string): Promise<Tenant> {
	const { data } = await identityApi.get<unknown>(`/tenants/${tenantSlug}`);
	return TenantSchema.parse(data);
}

export function useGetTenantQuery(tenantSlug: string) {
	return useQuery({
		queryKey: ["tenants", tenantSlug],
		queryFn: () => getTenantFn(tenantSlug),
		enabled: !!tenantSlug,
	});
}
