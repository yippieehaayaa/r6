import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RemoveIdentityParams {
	tenantSlug: string;
	id: string;
}

export async function removeIdentityFn({
	tenantSlug,
	id,
}: RemoveIdentityParams): Promise<void> {
	await identityApi.delete(`/tenants/${tenantSlug}/identities/${id}`);
}

export function useRemoveIdentityMutation() {
	return useMutation({
		mutationFn: removeIdentityFn,
	});
}
