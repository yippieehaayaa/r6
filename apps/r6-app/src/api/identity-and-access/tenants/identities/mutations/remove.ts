import { useMutation, useQueryClient } from "@tanstack/react-query";
import { identityApi } from "@/api/_app";

export async function removeIdentityFn(
	tenantId: string,
	id: string,
): Promise<void> {
	await identityApi.delete(`/tenants/${tenantId}/identities/${id}`);
}

export function useRemoveIdentityMutation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ tenantId, id }: { tenantId: string; id: string }) =>
			removeIdentityFn(tenantId, id),
		onSuccess: (_data, { tenantId }) => {
			queryClient.invalidateQueries({ queryKey: ["identities", tenantId] });
		},
	});
}
