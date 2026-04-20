import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function removeTenantFn(tenantId: string): Promise<void> {
	await identityApi.delete(`/tenants/${tenantId}`);
}

export function useRemoveTenantMutation() {
	return useMutation({
		mutationFn: removeTenantFn,
	});
}
