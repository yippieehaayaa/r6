import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export interface RemoveIdentityPolicyParams {
	tenantId: string;
	id: string;
	policyId: string;
}

export async function removeIdentityPolicyFn({
	tenantId,
	id,
	policyId,
}: RemoveIdentityPolicyParams): Promise<void> {
	await identityApi.delete(
		`/tenants/${tenantId}/identities/${id}/roles/${policyId}`,
	);
}

export function useRemoveIdentityPolicyMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: removeIdentityPolicyFn,
		onSuccess: (_data, { tenantId, id }) => {
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId, id] });
		},
	});
}
