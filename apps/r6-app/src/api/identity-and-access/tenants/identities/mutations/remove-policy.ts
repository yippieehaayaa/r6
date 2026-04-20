import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

// DELETE /tenants/:tenantId/identities/:id/roles/:policyId
// :policyId maps to :roleId in the backend for URL compatibility.
export async function removePolicyFn(
	tenantId: string,
	id: string,
	policyId: string,
): Promise<void> {
	await identityApi.delete(
		`/tenants/${tenantId}/identities/${id}/roles/${policyId}`,
	);
}

export function useRemovePolicyMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			tenantId,
			id,
			policyId,
		}: {
			tenantId: string;
			id: string;
			policyId: string;
		}) => removePolicyFn(tenantId, id, policyId),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["identity", id] });
		},
	});
}
