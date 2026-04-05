import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function removeTenantFn(tenantSlug: string): Promise<void> {
	await identityApi.delete(`/tenants/${tenantSlug}`);
}

export function useRemoveTenantMutation() {
	return useMutation({
		mutationFn: removeTenantFn,
	});
}
