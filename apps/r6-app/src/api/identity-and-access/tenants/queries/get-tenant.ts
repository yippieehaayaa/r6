import { type Tenant, TenantSchema } from "@r6/schemas";
import { useQuery } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function getTenantFn(tenantId: string): Promise<Tenant> {
	const { data } = await identityApi.get<unknown>(`/tenants/${tenantId}`);
	return TenantSchema.parse(data);
}

export function useGetTenantQuery(tenantId: string) {
	return useQuery({
		queryKey: ["tenants", tenantId],
		queryFn: () => getTenantFn(tenantId),
		enabled: !!tenantId,
	});
}
