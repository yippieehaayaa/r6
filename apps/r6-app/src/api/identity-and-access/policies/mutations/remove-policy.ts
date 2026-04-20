import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function removePolicyFn(
	tenantId: string,
	id: string,
): Promise<void> {
	await identityApi.delete(`/tenants/${tenantId}/policies/${id}`);
}

export function useRemovePolicyMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ tenantId, id }: { tenantId: string; id: string }) =>
			removePolicyFn(tenantId, id),
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["policies", tenantId] });
		},
	});
}
