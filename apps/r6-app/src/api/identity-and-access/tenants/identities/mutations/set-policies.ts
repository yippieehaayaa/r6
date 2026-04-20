import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

// PUT /tenants/:tenantId/identities/:id/roles
// Atomically replaces all policy assignments on an identity.
// An empty policyIds array clears all permissions.
export async function setPoliciesFn(
	tenantId: string,
	id: string,
	policyIds: string[],
): Promise<void> {
	await identityApi.put(`/tenants/${tenantId}/identities/${id}/roles`, {
		policyIds,
	});
}

export function useSetPoliciesMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			tenantId,
			id,
			policyIds,
		}: {
			tenantId: string;
			id: string;
			policyIds: string[];
		}) => setPoliciesFn(tenantId, id, policyIds),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["identity", id] });
		},
	});
}
