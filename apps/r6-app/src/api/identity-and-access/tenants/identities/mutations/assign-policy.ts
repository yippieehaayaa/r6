import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

// POST /tenants/:tenantId/identities/:id/roles
// Route param name kept as "roles" for URL compatibility — the operation is
// policy-based. The body carries policyId (a UUID).
export async function assignPolicyFn(
	tenantId: string,
	id: string,
	policyId: string,
): Promise<void> {
	await identityApi.post(`/tenants/${tenantId}/identities/${id}/roles`, {
		policyId,
	});
}

export function useAssignPolicyMutation() {
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
		}) => assignPolicyFn(tenantId, id, policyId),
		onSuccess: (_data, { id }) => {
			queryClient.invalidateQueries({ queryKey: ["identity", id] });
		},
	});
}
