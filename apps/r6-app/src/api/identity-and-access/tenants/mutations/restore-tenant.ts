import { type Tenant, TenantSchema } from "@r6/schemas";
import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function restoreTenantFn(tenantId: string): Promise<Tenant> {
	const { data } = await identityApi.post<unknown>(
		`/tenants/${tenantId}/restore`,
	);
	return TenantSchema.parse(data);
}

export function useRestoreTenantMutation() {
	return useMutation({
		mutationFn: restoreTenantFn,
	});
}
