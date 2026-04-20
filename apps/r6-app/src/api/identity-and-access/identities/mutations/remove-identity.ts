import { useMutation, useQueryClient } from "@tanstack/react-query";
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
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: removeIdentityFn,
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId] });
		},
	});
}
