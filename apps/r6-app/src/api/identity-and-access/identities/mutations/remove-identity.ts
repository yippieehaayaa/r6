import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RemoveIdentityParams {
	tenantId: string;
	id: string;
}

export async function removeIdentityFn({
	tenantId,
	id,
}: RemoveIdentityParams): Promise<void> {
	await identityApi.delete(`/tenants/${tenantId}/identities/${id}`);
}

export function useRemoveIdentityMutation() {
	return useMutation({
		mutationFn: removeIdentityFn,
	});
}
