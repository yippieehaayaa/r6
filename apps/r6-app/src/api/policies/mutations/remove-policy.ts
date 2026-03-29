import { useMutation } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RemovePolicyParams {
	tenantSlug: string;
	id: string;
}

export async function removePolicyFn({
	tenantSlug,
	id,
}: RemovePolicyParams): Promise<void> {
	await identityApi.delete(`/tenants/${tenantSlug}/policies/${id}`);
}

export function useRemovePolicyMutation() {
	return useMutation({
		mutationFn: removePolicyFn,
	});
}
